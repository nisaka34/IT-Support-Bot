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
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-md ${isUser ? 'bg-accent ml-3 border-2 border-white' : 'bg-white border border-slate-200 mr-3'}`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Message Content Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden ${
            isUser 
              ? 'bg-accent text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
          }`}>
             <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-800'}`}>
                <ReactMarkdown
                   components={{
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      p: ({node, ...props}) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <span className="font-bold text-inherit" {...props} />,
                      code: ({node, ...props}) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200" {...props} />,
                      a: ({node, ...props}) => <a className="text-accent underline hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                      img: ({node, ...props}) => (
                        <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 group">
                          <img {...props} className="max-w-full h-auto rounded-lg transition-transform duration-300 group-hover:scale-[1.01]" loading="lazy" />
                          {props.alt && (
                            <div className="px-2 py-1.5 text-[10px] text-slate-500 font-medium uppercase tracking-tight bg-white border-t border-slate-100 italic">
                              {props.alt}
                            </div>
                          )}
                        </div>
                      )
                   }}
                >
                  {message.content}
                </ReactMarkdown>
             </div>

             {/* References / Grounding Chunks */}
             {isBot && message.groundingChunks && message.groundingChunks.length > 0 && (
               <div className="mt-4 pt-4 border-t border-slate-100">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                   </svg>
                   Sources & References
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {message.groundingChunks.map((chunk, idx) => {
                     const item = chunk.web || chunk.maps;
                     if (!item) return null;
                     return (
                       <a 
                         key={idx} 
                         href={item.uri} 
                         target="_blank" 
                         rel="noopener"
                         className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-all hover:border-accent group"
                       >
                         <span className="truncate max-w-[150px] group-hover:text-accent">{item.title}</span>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                         </svg>
                       </a>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
          
          <div className="flex items-center gap-3 mt-2 px-1 w-full justify-between">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {isBot && onFeedback && message.content.length > 0 && !message.isError && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => onFeedback(message.id, 'positive')}
                  className={`p-1 rounded-md transition-all hover:bg-green-50 hover:text-green-600 ${message.feedback === 'positive' ? 'text-green-600 bg-green-50 scale-110 shadow-sm' : 'text-slate-400'}`}
                  title="Helpful"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={message.feedback === 'positive' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.746 10 20.5 10.74 20.5 11.644c0 .357-.116.702-.33 1.002L17.25 17.5a2.5 2.5 0 01-2.036 1h-5.214a1 1 0 01-1-1v-6.5a1 1 0 01.3-.7l3.3-3.3a1.5 1.5 0 012.122 0 1.5 1.5 0 010 2.122L12.5 10H14zM4.5 10.5h2a1 1 0 011 1v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-7a1 1 0 011-1z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onFeedback(message.id, 'negative')}
                  className={`p-1 rounded-md transition-all hover:bg-red-50 hover:text-red-600 ${message.feedback === 'negative' ? 'text-red-600 bg-red-50 scale-110 shadow-sm' : 'text-slate-400'}`}
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