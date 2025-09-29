import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types';
import { apiService } from '@/services/apiService';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  documentId: string;
}

export interface ChatInterfaceRef {
  sendMessage: (message: string) => Promise<void>;
}

/**
 * Chat interface for document Q&A
 */
export const ChatInterface = forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ documentId }, ref) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessageType = {
      id: uuidv4(),
      type: 'ai',
      content: "Hello! I'm here to help you explore and understand this document. Ask me anything about the content, or click on nodes in the knowledge graph for quizzes and flashcards.",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [documentId]);


  const handleMessageSubmission = async (messageContent: string) => {
    if (!messageContent.trim() || isThinking) return;

    const userMessage: ChatMessageType = {
      id: uuidv4(),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await apiService.askQuestion(documentId, userMessage.content);
      
      const aiMessage: ChatMessageType = {
        id: uuidv4(),
        type: 'ai',
        content: response.answer, // Don't clean here, let ChatMessage handle formatting
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: uuidv4(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleMessageSubmission(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Expose sendMessage function to parent component
  useImperativeHandle(ref, () => ({
    sendMessage: handleMessageSubmission,
  }), [documentId, isThinking]);

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: '#000000',
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isThinking && (
          <div className="flex space-x-3 justify-start mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            <div className="bg-black border border-gray-700 px-4 py-3 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-black">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about this document..."
              className="w-full resize-none px-4 py-3 bg-black border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors min-h-[48px] max-h-[120px]"
              disabled={isThinking}
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="flex-shrink-0 w-12 h-12 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-lg flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
});