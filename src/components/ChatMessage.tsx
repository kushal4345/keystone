import { User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { formatResponseForDisplay } from '@/utils/formatResponse';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Individual chat message component
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full" />
        </div>
      )}
      
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div className={`px-4 py-3 rounded-lg ${
          isUser 
            ? 'bg-yellow-500 text-black' 
            : 'bg-black border border-gray-700 text-white'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed space-y-3">
              {formatResponseForDisplay(message.content).map((segment, index) => (
                <div key={index}>
                  {segment.type === 'headline' ? (
                    <div className="mb-3">
                      <h4 className="text-base font-bold text-yellow-400 mb-1 tracking-wide">
                        {segment.content}
                      </h4>
                      <div className="w-full h-0.5 bg-yellow-400/30"></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-white leading-relaxed">
                      {segment.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-400 mt-1 px-2 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User size={14} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}