import { User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Individual chat message component
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex space-x-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 35%, 90% 100%, 10% 100%, 0% 35%)',
            border: '2px solid #000000',
          }}
        >
          <span className="text-black font-bold text-xs">⚡</span>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div 
          className={`px-4 py-3 ${
            isUser 
              ? 'text-black font-medium' 
              : 'text-yellow-400 font-medium'
          }`}
          style={{
            background: isUser 
              ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
              : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
            border: isUser ? '2px solid #000000' : '2px solid #D4AF37',
            borderRadius: '12px',
            clipPath: isUser 
              ? 'polygon(10% 0%, 90% 0%, 100% 25%, 95% 100%, 5% 100%, 0% 25%)'
              : 'polygon(5% 0%, 95% 0%, 100% 25%, 90% 100%, 10% 100%, 0% 25%)',
            boxShadow: isUser 
              ? '0 4px 8px rgba(0,0,0,0.2)'
              : '0 4px 8px rgba(212, 175, 55, 0.2)',
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        <div className={`text-xs text-yellow-600 mt-1 px-2 font-medium ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <div 
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 35%, 90% 100%, 10% 100%, 0% 35%)',
            border: '2px solid #D4AF37',
          }}
        >
          <User size={14} className="text-yellow-400" />
        </div>
      )}
    </div>
  );
}