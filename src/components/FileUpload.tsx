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
      <div className="w-full max-w-lg mx-auto p-6 bg-keystone-secondary rounded-xl border border-keystone-border">
        <LoadingState message="Analyzing document..." size="medium" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* PDF Upload Section */}
        <div
          className={`relative p-6 bg-keystone-secondary rounded-xl border-2 border-dashed transition-all duration-200 ${
            isDragging 
              ? 'border-keystone-accent bg-keystone-accent/10' 
              : 'border-keystone-border hover:border-keystone-accent/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              isDragging ? 'bg-keystone-accent/20' : 'bg-keystone-border'
            }`}>
              <FileText size={24} className={isDragging ? 'text-keystone-accent' : 'text-keystone-text-muted'} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-keystone-text mb-2">
                Upload PDF Document
              </h3>
              <p className="text-sm text-keystone-text-muted">
                Drag and drop your PDF here, or click to browse
              </p>
            </div>

            <button
              onClick={handleFileButtonClick}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-keystone-accent hover:bg-keystone-accent-dark text-keystone-primary font-medium rounded-lg transition-all duration-200"
            >
              <Upload size={18} />
              <span>Choose PDF File</span>
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
        <div className="p-6 bg-keystone-secondary rounded-xl border border-keystone-border">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-4">
                <Link2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-keystone-text mb-2">
                YouTube Video
              </h3>
              <p className="text-sm text-keystone-text-muted">
                Paste a YouTube video link to analyze
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-keystone-primary border border-keystone-border rounded-lg focus:ring-2 focus:ring-keystone-accent focus:border-keystone-accent text-keystone-text placeholder-keystone-text-muted transition-all duration-200"
              />
              <button
                type="submit"
                disabled={!url.trim() || !url.includes('youtube.com')}
                className="w-full px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-keystone-border disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200"
              >
                Analyze Video
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}