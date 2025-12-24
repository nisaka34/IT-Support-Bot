import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import KnowledgeBaseEditor from './components/KnowledgeBaseEditor';
import AnalysisModal from './components/AnalysisModal';
import Button from './components/Button';
import { Message, ChatState } from './types';
import { DEFAULT_KNOWLEDGE_BASE, WELCOME_MESSAGE } from './constants';
import { initializeChat, sendMessageStream, analyzeConversation } from './services/geminiService';

const App: React.FC = () => {
  // State for the knowledge base content
  const [kbContent, setKbContent] = useState<string>(DEFAULT_KNOWLEDGE_BASE);
  const [isKbEditorOpen, setIsKbEditorOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Chat State
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [{
      id: 'welcome',
      role: 'model',
      content: WELCOME_MESSAGE,
      timestamp: new Date()
    }],
    isLoading: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Chat with default KB on mount
  useEffect(() => {
    initializeChat(kbContent);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Handle saving new KB content
  const handleSaveKb = (newContent: string) => {
    setKbContent(newContent);
    initializeChat(newContent);
    
    // Add a system message indicating update
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      content: "System: Knowledge Base updated. I have been restarted with the new information.",
      timestamp: new Date()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, systemMsg]
    }));
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, feedback: msg.feedback === type ? undefined : type } : msg
      )
    }));
  };

  const handleAnalyzeChat = async () => {
    setIsAnalysisOpen(true);
    setIsAnalysisLoading(true);
    try {
      const result = await analyzeConversation(chatState.messages);
      setAnalysisText(result || "Failed to generate analysis.");
    } catch (err) {
      setAnalysisText("Error generating analysis. Please ensure API key is valid.");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));
    setInput('');
    
    // Reset textarea height
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
    }

    try {
      const botMessageId = (Date.now() + 1).toString();
      const botMessagePlaceholder: Message = {
        id: botMessageId,
        role: 'model',
        content: '',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessagePlaceholder]
      }));

      const stream = sendMessageStream(userMessage.content);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        }));
      }

    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">IT Support Bot</h1>
                <p className="text-xs text-slate-500 font-medium">Automated Knowledge Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleAnalyzeChat}
              className="hidden sm:flex"
              disabled={chatState.messages.length < 2}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analyze Chat
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsKbEditorOpen(true)}
              className="hidden sm:flex"
            >
              Manage KB
            </Button>
            <button 
              className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsKbEditorOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {chatState.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          {chatState.isLoading && chatState.messages[chatState.messages.length - 1].role === 'user' && (
             <div className="flex w-full mb-6 justify-start">
                <div className="flex flex-row">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-slate-200 mr-3">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="flex items-center px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Describe your IT issue..."
            className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent resize-none max-h-32 shadow-sm text-slate-800 placeholder-slate-400"
            disabled={chatState.isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatState.isLoading}
            className="absolute right-2 bottom-2 p-2 bg-accent text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </footer>

      <KnowledgeBaseEditor 
        isOpen={isKbEditorOpen}
        onClose={() => setIsKbEditorOpen(false)}
        initialContent={kbContent}
        onSave={handleSaveKb}
      />

      <AnalysisModal 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysisText={analysisText}
        isLoading={isAnalysisLoading}
      />
    </div>
  );
};

export default App;