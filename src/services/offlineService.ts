// Import necessary modules
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    RunnableSequence,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- Service Initializations (Offline) ---
// Initialize a local LLM and embedding model using phi4-mini and nomic-embed-text
const llm = new ChatOllama({ model: "phi4-mini" });
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

let vectorStore: MemoryVectorStore | null = null;
const chatHistory = new Map<string, any[]>();

// --- Helper Functions (Offline) ---

/**
 * Extracts text from a PDF file.
 * @param {File} file - The PDF file to process.
 * @returns {Promise<string>} - The extracted text content.
 */
async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText;
}

// --- API-like Functions for Offline Mode ---

/**
 * Processes a PDF file, creates embeddings, and stores them in-memory.
 * This function replicates the /api/process-pdf endpoint.
 * @param {File} file - The uploaded PDF file.
 * @returns {Promise<object>} - A status message and index name.
 */
export async function processPdfOffline(file: File): Promise<{ message: string; index_name: string; graphData?: any }> {
    try {
        const fullText = await extractTextFromPdf(file);
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 150,
        });
        const chunks = await textSplitter.createDocuments([fullText]);

        vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);

        // Generate a simple graph data structure for offline mode
        const graphData = {
            nodes: [
                { id: 1, label: "Document", color: "#FFD700" },
                { id: 2, label: "Summary", color: "#FFA500" },
                { id: 3, label: "Analysis", color: "#FF6347" }
            ],
            edges: [
                { from: 1, to: 2 },
                { from: 1, to: 3 }
            ]
        };

        return {
            message: "Document processed successfully for offline use.",
            index_name: "local-memory",
            graphData
        };
    } catch (error) {
        console.error("Error processing PDF offline:", error);
        throw new Error("Failed to process PDF for offline use.");
    }
}

/**
 * Generates a summary for a given topic from the locally stored document.
 * This function replicates the /api/get-summary endpoint.
 * @param {string} topic - The topic to summarize.
 * @returns {Promise<object>} - The generated summary.
 */
export async function getSummaryOffline(topic: string): Promise<{ summary: string }> {
    if (!vectorStore) {
        throw new Error("No document has been processed for offline use.");
    }

    try {
        const retriever = vectorStore.asRetriever();
        const relevantDocs = await retriever.getRelevantDocuments(topic);
        const contextText = relevantDocs
            .map((doc) => doc.pageContent)
            .join("\n\n");

        const summaryPromptTemplate = `Based *only* on the following text, write a concise summary of the topic: '{topic}'.

Text:
---
{context}
---`;
        const prompt = ChatPromptTemplate.fromTemplate(summaryPromptTemplate);

        const chain = prompt.pipe(llm).pipe(new StringOutputParser());

        const summary = await chain.invoke({
            topic: topic,
            context: contextText,
        });

        return { summary: summary };
    } catch (error) {
        console.error("An error occurred during offline summarization:", error);
        throw new Error("Failed to generate summary offline.");
    }
}

/**
 * Handles a chat interaction for a given topic using the local document.
 * This function replicates the /api/chat endpoint.
 * @param {string} chatId - A unique identifier for the chat.
 * @param {string} userMessage - The user's message.
 * @returns {Promise<object>} - The AI's response.
 */
export async function chatWithTopicOffline(chatId: string, userMessage: string): Promise<{ ai_response: string }> {
    if (!vectorStore) {
        throw new Error("No document has been processed for offline use.");
    }

    try {
        const retriever = vectorStore.asRetriever();
        const relevantDocs = await retriever.getRelevantDocuments(userMessage);
        const contextText = relevantDocs
            .map((doc) => doc.pageContent)
            .join("\n\n");

        if (!chatHistory.has(chatId)) {
            chatHistory.set(chatId, []);
        }
        const history = chatHistory.get(chatId);

        const systemPrompt = `You are an expert AI tutor for the topic of "{chat_id}".
Your goal is to provide the best possible answer. Base your answer on the user's conversation history and the relevant context from the document provided below. Prioritize the document's information.

CONTEXT FROM DOCUMENT:
---
{context}
---`;

        const prompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(systemPrompt),
            ...history,
            HumanMessagePromptTemplate.fromTemplate("{input}"),
        ]);

        const chain = RunnableSequence.from([
            {
                context: retriever.pipe((docs) =>
                    docs.map((doc) => doc.pageContent).join("\n\n")
                ),
                input: new RunnablePassthrough(),
                chat_id: () => chatId,
            },
            prompt,
            llm,
            new StringOutputParser(),
        ]);

        const aiResponse = await chain.invoke(userMessage);

        // Update chat history
        history.push(new HumanMessagePromptTemplate.fromTemplate(userMessage));
        history.push(new SystemMessagePromptTemplate.fromTemplate(aiResponse));
        chatHistory.set(chatId, history);

        return { ai_response: aiResponse };
    } catch (error) {
        console.error("An error occurred during offline chat:", error);
        throw new Error("Failed to get chat response offline.");
    }
}

/**
 * Summarizes the entire legal document offline
 * @param {File} file - The PDF file to summarize
 * @returns {Promise<object>} - The generated summary
 */
export async function summarizeLegalDocumentOffline(file: File): Promise<{ summary: string }> {
    try {
        const fullText = await extractTextFromPdf(file);
        
        const summaryPromptTemplate = `Please provide a comprehensive summary of the following legal document. Focus on key points, main arguments, important clauses, and overall structure. Make it clear and well-organized.

Document:
---
{context}
---`;

        const prompt = ChatPromptTemplate.fromTemplate(summaryPromptTemplate);
        const chain = prompt.pipe(llm).pipe(new StringOutputParser());

        const summary = await chain.invoke({
            context: fullText,
        });

        return { summary: summary };
    } catch (error) {
        console.error("An error occurred during offline document summarization:", error);
        throw new Error("Failed to summarize document offline.");
    }
}

// --- Connectivity Detection ---
export function isOnline(): boolean {
    return navigator.onLine;
}

// Listen for connectivity changes
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => console.log('You are now online.'));
    window.addEventListener('offline', () => console.log('You are now offline. Functionality may be limited.'));
}
