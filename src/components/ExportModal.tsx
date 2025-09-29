import React, { useState } from 'react';
import { X, Download, FileText, Image, MessageSquare, Loader2 } from 'lucide-react';
import type { ExportOptions } from '@/services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  annotationCount: number;
  hasSummary: boolean;
}

/**
 * Modal for configuring and triggering report exports
 */
export function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  annotationCount, 
  hasSummary 
}: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeGraph: true,
    includeSummary: hasSummary,
    includeAnnotations: annotationCount > 0,
    format: 'pdf',
    title: 'Legal Document Analysis Report'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      await onExport(options);
      onClose();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = <K extends keyof ExportOptions>(
    key: K, 
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Download className="w-5 h-5 mr-2 text-yellow-400" />
            Export Report
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            disabled={isExporting}
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Title
            </label>
            <input
              type="text"
              value={options.title || ''}
              onChange={(e) => updateOption('title', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Enter report title..."
              disabled={isExporting}
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateOption('format', 'pdf')}
                disabled={isExporting}
                className={`p-3 border rounded-lg transition-all ${
                  options.format === 'pdf'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">PDF</div>
                <div className="text-xs text-gray-400">Portable format</div>
              </button>
              
              <button
                onClick={() => updateOption('format', 'docx')}
                disabled={isExporting}
                className={`p-3 border rounded-lg transition-all ${
                  options.format === 'docx'
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                    : 'border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Word</div>
                <div className="text-xs text-gray-400">Editable format</div>
              </button>
            </div>
          </div>

          {/* Content Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Include Content
            </label>
            <div className="space-y-3">
              {/* Knowledge Graph */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeGraph}
                  onChange={(e) => updateOption('includeGraph', e.target.checked)}
                  disabled={isExporting}
                  className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <Image className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Knowledge Graph</span>
                </div>
              </label>

              {/* Document Summary */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSummary}
                  onChange={(e) => updateOption('includeSummary', e.target.checked)}
                  disabled={isExporting || !hasSummary}
                  className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2 disabled:opacity-50"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${hasSummary ? 'text-gray-300' : 'text-gray-500'}`}>
                    Document Summary
                    {!hasSummary && ' (not available)'}
                  </span>
                </div>
              </label>

              {/* Annotations */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeAnnotations}
                  onChange={(e) => updateOption('includeAnnotations', e.target.checked)}
                  disabled={isExporting || annotationCount === 0}
                  className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2 disabled:opacity-50"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${annotationCount > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                    Annotations & Comments
                    {annotationCount > 0 ? ` (${annotationCount})` : ' (none)'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {exportError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {exportError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || (!options.includeGraph && !options.includeSummary && !options.includeAnnotations)}
            className="flex items-center space-x-2 px-6 py-2 bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate {options.format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
