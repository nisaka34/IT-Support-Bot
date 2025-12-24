import React from 'react';
import ReactMarkdown from 'react-markdown';
import Button from './Button';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisText: string | null;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysisText, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin History Analysis</h2>
            <p className="text-sm text-slate-500">AI-generated insights from this conversation</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium animate-pulse">Generating admin report...</p>
            </div>
          ) : analysisText ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-800 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-6 mb-2 border-b border-slate-100 pb-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold text-slate-700 mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-600 mb-3 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-600" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                }}
              >
                {analysisText}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 italic">No analysis data available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
          <Button onClick={onClose} variant="secondary">Close Report</Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;