import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, Link2, FileText } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Central file upload and URL input component
 */
export function FileUpload({ onFileSelect, onUrlSubmit, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [isPdfHovered, setIsPdfHovered] = useState(false);
  const [isYoutubeHovered, setIsYoutubeHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileSelect(pdfFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && url.includes('youtube.com')) {
      onUrlSubmit(url.trim());
      setUrl('');
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div 
        className="w-full p-8 bg-gradient-to-r from-keystone-accent to-yellow-400 shadow-2xl shadow-yellow-500/50 transform scale-105"
        style={{
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 15%, 95% 100%, 5% 100%, 0% 15%)'
        }}
      >
        <LoadingState message="⚡ ANALYZING DOCUMENT..." size="medium" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {/* PDF Upload Section */}
      <div
        className={`relative overflow-hidden transition-all duration-300 transform hover:scale-102 ${
          isDragging 
            ? 'shadow-2xl shadow-yellow-500/50' 
            : 'hover:shadow-xl hover:shadow-yellow-500/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsPdfHovered(true)}
        onMouseLeave={() => setIsPdfHovered(false)}
        style={{
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 15%, 96% 100%, 4% 100%, 0% 15%)',
          background: isDragging || isPdfHovered 
            ? 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)' 
            : '#2a2a2a',
            // this here is the deafault background color for the boxes, tinker with the colors to see.
          transition: 'background 300ms ease-in-out'
        }}
      >
        <div className="p-6 text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 transition-all duration-300 ${
            isDragging || isPdfHovered
              ? 'text-black transform rotate-12 scale-110' 
              : 'text-keystone-accent'
          }`}>
            <FileText size={24} strokeWidth={2.5} />
          </div>
          
          <div>
            <h3 className={`text-lg font-bold mb-2 tracking-wide ${
              isDragging || isPdfHovered ? 'text-black' : 'text-keystone-text'
            }`}>
              PDF UPLOAD
            </h3>
            <p className={`text-xs font-medium ${
              isDragging || isPdfHovered ? 'text-black/80' : 'text-keystone-text-muted'
            }`}>
              Drop your PDF or click to select
            </p>
          </div>

          <button
            onClick={handleFileButtonClick}
            className={`inline-flex items-center space-x-2 px-6 py-3 font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-102 ${
              isDragging || isPdfHovered
                ? 'bg-black text-yellow-400 shadow-lg'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg'
            }`}
            style={{
              clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
            }}
          >
            <Upload size={16} strokeWidth={3} />
            <span>SELECT FILE</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* YouTube URL Section */}
      <div 
        className="relative overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-xl hover:shadow-yellow-500/30"
        onMouseEnter={() => setIsYoutubeHovered(true)}
        onMouseLeave={() => setIsYoutubeHovered(false)}
        style={{
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 20%, 92% 100%, 8% 100%, 0% 20%)',
          background: isYoutubeHovered
            ? 'linear-gradient(135deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)'
            : '#2a2a2a',
          transition: 'background 300ms ease-in-out'
        }}
      >
        <form onSubmit={handleUrlSubmit} className="p-5 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-300">
              <Link2 size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-keystone-text mb-2 tracking-wide">
              YOUTUBE VIDEO
            </h3>
            <p className="text-xs font-medium text-keystone-text-muted">
              Paste your YouTube link below
            </p>
          </div>

          <div className="space-y-3 px-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-keystone-primary border-2 border-keystone-border focus:border-yellow-500 text-keystone-text placeholder-keystone-text-muted transition-all duration-300 font-medium text-xs"
              style={{
                clipPath: 'polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)'
              }}
            />
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!url.trim() || !url.includes('youtube.com')}
                className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-black font-bold text-xs tracking-wide transition-all duration-300 transform hover:scale-102 shadow-lg hover:shadow-yellow-500/50"
                style={{
                  clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
                }}
              >
                KEYSTONE IT
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div 
          className="p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 shadow-lg"
          style={{
            clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)'
          }}
        >
          <p className="text-red-300 text-center font-medium text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}