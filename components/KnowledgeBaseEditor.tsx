import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

interface KnowledgeBaseEditorProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({ initialContent, onSave, isOpen, onClose }) => {
  const [content, setContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    setIsUploading(true);
    try {
      // Dynamic import of pdf.js as an ES module (v4.10.38)
      const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
      
      // CRITICAL: Set the worker source to the matching version. 
      // Without this, pdf.js will throw "No GlobalWorkerOptions.workerSrc specified"
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let extractedText = `\n\n--- DOCUMENT: ${file.name} ---\n`;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += `[Page ${i}] ${pageText}\n`;
      }
      
      setContent(prev => prev + extractedText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Failed to extract text from PDF. Please ensure it is a text-based PDF.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl h-full bg-white shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Knowledge Base Editor</h2>
            <p className="text-sm text-slate-500">Edit the content the bot uses to answer questions.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  The bot strictly adheres to this data. You can manually edit or upload a PDF to automatically extract and append its text.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="kb-content" className="block text-sm font-medium text-slate-700">Content</label>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                type="button"
                className="flex items-center gap-2"
              >
                {!isUploading && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                Upload PDF
              </Button>
            </div>
          </div>
          
          <textarea
            id="kb-content"
            className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent font-mono text-sm resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge base content here or upload a PDF..."
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(content); onClose(); }}>Save & Restart Bot</Button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseEditor;