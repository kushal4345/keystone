import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Central file upload and URL input component
 */
export function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPdfHovered, setIsPdfHovered] = useState(false);
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
            : '#000000',
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
            aria-label="Select PDF file"
          />
        </div>
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