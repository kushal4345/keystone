import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Reusable loading component with customizable size and message
 */
export function LoadingState({ message = 'Loading...', size = 'medium' }: LoadingStateProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const containerClasses = {
    small: 'space-y-2',
    medium: 'space-y-3',
    large: 'space-y-4',
  };

  const textClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      </div>
      <p className={`text-gray-600 font-medium ${textClasses[size]}`}>
        {message}
      </p>
    </div>
  );
}