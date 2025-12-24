import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onFeedback?: (id: string, type: 'positive' | 'negative') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';
  const isBot = message.role === 'model';
  const isSystem = message.content.startsWith('System:');
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-full uppercase tracking-wider">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-accent ml-3' : 'bg-white border border-slate-200 mr-3'}`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-accent text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
          }`}>
             {/* Use ReactMarkdown for safe HTML rendering of bot responses */}
             <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-800'}`}>
                <ReactMarkdown
                   components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      p: ({node, ...props}) => <p className="my-1 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                      code: ({node, ...props}) => <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                      a: ({node, ...props}) => <a className="underline hover:text-blue-500" target="_blank" rel="noopener noreferrer" {...props} />
                   }}
                >
                  {message.content}
                </ReactMarkdown>
             </div>
          </div>
          
          <div className="flex items-center gap-3 mt-1 px-1 w-full justify-between">
            <span className="text-xs text-slate-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {isBot && onFeedback && message.content.length > 0 && !message.isError && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onFeedback(message.id, 'positive')}
                  className={`p-1.5 rounded-md transition-all hover:bg-slate-100 ${message.feedback === 'positive' ? 'bg-blue-50 text-blue-600 scale-110' : 'text-slate-400'}`}
                  title="Helpful"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={message.feedback === 'positive' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.746 10 20.5 10.74 20.5 11.644c0 .357-.116.702-.33 1.002L17.25 17.5a2.5 2.5 0 01-2.036 1h-5.214a1 1 0 01-1-1v-6.5a1 1 0 01.3-.7l3.3-3.3a1.5 1.5 0 012.122 0 1.5 1.5 0 010 2.122L12.5 10H14zM4.5 10.5h2a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-7a1 1 0 011-1z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onFeedback(message.id, 'negative')}
                  className={`p-1.5 rounded-md transition-all hover:bg-slate-100 ${message.feedback === 'negative' ? 'bg-red-50 text-red-600 scale-110' : 'text-slate-400'}`}
                  title="Not helpful"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={message.feedback === 'negative' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.254 14 3.5 13.26 3.5 12.356c0-.357.116-.702.33-1.002L6.75 6.5a2.5 2.5 0 012.036-1h5.214a1 1 0 011 1v6.5a1 1 0 01-.3.7l-3.3 3.3a1.5 1.5 0 01-2.122 0 1.5 1.5 0 010-2.122L11.5 14h-1.5zM19.5 13.5h-2a1 1 0 01-1-1v-7a1 1 0 011-1h2a1 1 0 011 1v7a1 1 0 01-1 1z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;