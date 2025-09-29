// Import necessary modules
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as pdfjsLib from "pdfjs-dist";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

// --- Service Initializations (Offline) ---
// Initialize a local LLM and embedding model using phi4-mini and nomic-embed-text
const llm = new ChatOllama({ model: "phi4-mini" });
const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

let vectorStore: MemoryVectorStore | null = null;
const chatHistory = new Map<string, { human: string; ai: string }[]>();

// --- Helper Functions (Offline) ---

/**
 * Generates graph data from extracted text by identifying legal document sections
 * @param {string} text - The extracted text content
 * @returns {Promise<object>} - Graph data with nodes and edges
 */
async function generateGraphDataFromText(text: string): Promise<any> {
    try {
        // Define common legal document sections
        const legalSections = [
            'SERVICE AGREEMENT',
            'RECITALS',
            'DEFINITIONS',
            'SCOPE OF SERVICES',
            'COMPENSATION',
            'REPRESENTATIONS AND WARRANTIES',
            'TERMINATION',
            'INDEMNIFICATION',
            'FORCE MAJEURE',
            'GOVERNING LAW',
            'DISPUTE RESOLUTION',
            'CONFIDENTIALITY',
            'INTELLECTUAL PROPERTY',
            'LIABILITY',
            'SURVIVAL',
            'ENSURE PERFORMANCE',
            'BREACH',
            'REMEDIES'
        ];

        const nodes: any[] = [];
        const edges: any[] = [];
        let nodeId = 1;

        // Search for sections in the text and create nodes
        for (const section of legalSections) {
            const sectionRegex = new RegExp(`\\b${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            if (sectionRegex.test(text)) {
                // Determine color based on section type
                let color = "#FFD700"; // Default gold
                if (section.includes('AGREEMENT') || section.includes('SERVICE')) {
                    color = "#FF6347"; // Tomato red
                } else if (section.includes('COMPENSATION') || section.includes('PAYMENT')) {
                    color = "#32CD32"; // Lime green
                } else if (section.includes('REPRESENTATIONS') || section.includes('WARRANTIES')) {
                    color = "#1E90FF"; // Dodger blue
                } else if (section.includes('TERMINATION') || section.includes('BREACH')) {
                    color = "#FF4500"; // Orange red
                } else if (section.includes('DEFINITIONS') || section.includes('RECITALS')) {
                    color = "#9370DB"; // Medium purple
                }

                nodes.push({
                    id: nodeId,
                    label: section,
                    color: color,
                    title: `Legal Section: ${section}`
                });

                // Create connections to previous nodes (simple sequential connection)
                if (nodeId > 1) {
                    edges.push({
                        from: nodeId - 1,
                        to: nodeId,
                        color: { color: "#888888", width: 2 }
                    });
                }

                nodeId++;
            }
        }

        // If no sections found, create a default node
        if (nodes.length === 0) {
            nodes.push({
                id: 1,
                label: "Legal Document",
                color: "#FFD700",
                title: "Legal Document Content"
            });
        }

        return {
            nodes,
            edges
        };
    } catch (error) {
        console.error('Error generating graph data:', error);
        // Return default graph structure if generation fails
        return {
            nodes: [
                { id: 1, label: "Legal Document", color: "#FFD700" }
            ],
            edges: []
        };
    }
}

/**
 * Extляет текст из PDF файла
 * @param {File} file - PDF файл для обработки
 * @returns {Promise<string>} - Извлеченный текстовый контент
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

        // Generate graph data structure based on document content
        const graphData = await generateGraphDataFromText(fullText);

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
        const history = chatHistory.get(chatId) || [];

        // Build conversation history from simple object structure
        let conversationHistory = "";
        for (const entry of history) {
            conversationHistory += `Human: ${entry.human}\n\n`;
            conversationHistory += `Assistant: ${entry.ai}\n\n`;
        }

        const systemPrompt = `You are an expert AI tutor for legal document analysis.
Your goal is to provide accurate and helpful answers based on the document content provided below. 
Please prioritize the information from the document and provide clear, well-structured responses.

DOCUMENT CONTEXT:
---
${contextText}
---`;

        let fullPrompt = systemPrompt;
        if (conversationHistory) {
            fullPrompt += `\n\nPREVIOUS CONVERSATION:\n${conversationHistory}`;
        }
        fullPrompt += `\n\nCurrent Question: ${userMessage}`;

        const response = await llm.invoke(fullPrompt);
        const aiResponse = response.content as string;

        // Update chat history with simple object structure
        history.push({ human: userMessage, ai: aiResponse });
        
        // Keep only last 10 exchanges to prevent context overflow
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        
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
