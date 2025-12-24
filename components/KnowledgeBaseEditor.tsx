import React, { useState, useEffect } from 'react';
import Button from './Button';

interface KnowledgeBaseEditorProps {
  initialContent: string;
  onSave: (newContent: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({ initialContent, onSave, isOpen, onClose }) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

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
                  The bot will strictly adhere to the information provided below. Add new FAQs, procedures, or policy documents here.
                </p>
              </div>
            </div>
          </div>
          
          <label htmlFor="kb-content" className="block text-sm font-medium text-slate-700 mb-2">Content</label>
          <textarea
            id="kb-content"
            className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent font-mono text-sm resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter knowledge base content here..."
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