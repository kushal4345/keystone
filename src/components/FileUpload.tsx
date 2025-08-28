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
    <div className="w-full space-y-8">
      {/* PDF Upload Section */}
      <div
        className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 ${
          isDragging 
            ? 'shadow-2xl shadow-yellow-500/50' 
            : 'hover:shadow-xl hover:shadow-yellow-500/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 20%, 95% 100%, 5% 100%, 0% 20%)',
          background: isDragging 
            ? 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)' 
            : 'linear-gradient(135deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)'
        }}
      >
        <div className="p-8 text-center space-y-5">
          <div className={`inline-flex items-center justify-center w-16 h-16 transition-all duration-300 ${
            isDragging 
              ? 'text-black transform rotate-12 scale-110' 
              : 'text-keystone-accent hover:text-yellow-400 hover:scale-110'
          }`}>
            <FileText size={32} strokeWidth={2.5} />
          </div>
          
          <div>
            <h3 className={`text-xl font-bold mb-3 tracking-wide ${
              isDragging ? 'text-black' : 'text-keystone-text'
            }`}>
              PDF UPLOAD
            </h3>
            <p className={`text-sm font-medium ${
              isDragging ? 'text-black/80' : 'text-keystone-text-muted'
            }`}>
              Drop your PDF or click to select
            </p>
          </div>

          <button
            onClick={handleFileButtonClick}
            className={`inline-flex items-center space-x-3 px-8 py-4 font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 ${
              isDragging
                ? 'bg-black text-yellow-400 shadow-lg'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black shadow-lg hover:shadow-yellow-500/50'
            }`}
            style={{
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
            }}
          >
            <Upload size={20} strokeWidth={3} />
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
        className="relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/30"
        style={{
          clipPath: 'polygon(5% 0%, 95% 0%, 100% 25%, 90% 100%, 10% 100%, 0% 25%)',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #404040 50%, #2a2a2a 100%)'
        }}
      >
        <form onSubmit={handleUrlSubmit} className="p-8 space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-300">
              <Link2 size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-keystone-text mb-3 tracking-wide">
              YOUTUBE VIDEO
            </h3>
            <p className="text-sm font-medium text-keystone-text-muted">
              Paste your YouTube link below
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-6 py-4 bg-keystone-primary border-2 border-keystone-border focus:border-red-500 text-keystone-text placeholder-keystone-text-muted transition-all duration-300 font-medium"
              style={{
                clipPath: 'polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)'
              }}
            />
            <button
              type="submit"
              disabled={!url.trim() || !url.includes('youtube.com')}
              className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
              style={{
                clipPath: 'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)'
              }}
            >
              ANALYZE VIDEO
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div 
          className="p-6 bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 shadow-lg"
          style={{
            clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)'
          }}
        >
          <p className="text-red-300 text-center font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}