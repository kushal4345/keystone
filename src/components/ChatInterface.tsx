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
        content: response.answer,
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
      className="flex flex-col h-full rounded-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
        border: '2px solid #D4AF37',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isThinking && (
          <div className="flex space-x-3 justify-start mb-4">
            <div 
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 35%, 90% 100%, 10% 100%, 0% 35%)',
                border: '2px solid #000000',
              }}
            >
              <span className="text-black font-bold text-xs animate-bounce">⚡</span>
            </div>
            <div 
              className="px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                border: '2px solid #D4AF37',
                borderRadius: '12px',
                clipPath: 'polygon(5% 0%, 95% 0%, 100% 25%, 90% 100%, 10% 100%, 0% 25%)',
              }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div 
        className="p-4"
        style={{
          borderTop: '2px solid #D4AF37',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="⚡ Ask me anything about this document..."
              className="w-full resize-none px-4 py-3 transition-all duration-200 min-h-[48px] max-h-[120px] bg-black/50 text-yellow-400 placeholder-yellow-600 font-medium"
              style={{
                border: '2px solid #D4AF37',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
              }}
              disabled={isThinking}
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-black font-bold flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
            style={{
              clipPath: 'polygon(15% 0%, 85% 0%, 100% 35%, 90% 100%, 10% 100%, 0% 35%)',
              border: '2px solid #000000',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
});