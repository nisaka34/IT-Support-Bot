import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import KnowledgeBaseEditor from './components/KnowledgeBaseEditor';
import AnalysisModal from './components/AnalysisModal';
import Button from './components/Button';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import { Message, ChatState, Language } from './types';
import { DEFAULT_KNOWLEDGE_BASE, WELCOME_MESSAGES, UI_TRANSLATIONS } from './constants';
import { initializeChat, sendMessageStream, analyzeConversation } from './services/geminiService';
import { db } from './services/database';

const App: React.FC = () => {
  // Navigation & Auth State
  const [view, setView] = useState<'chat' | 'admin-login' | 'admin-dashboard'>('chat');
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // Knowledge base state
  const [kbContent, setKbContent] = useState<string>(DEFAULT_KNOWLEDGE_BASE);
  const [isKbEditorOpen, setIsKbEditorOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Translations
  const t = UI_TRANSLATIONS[language];

  // Chat State
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [{
      id: 'welcome',
      role: 'model',
      content: WELCOME_MESSAGES[language],
      timestamp: new Date()
    }],
    isLoading: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    initializeChat(kbContent, language);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [chatState.messages, view, chatState.isLoading]);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    initializeChat(kbContent, newLang);
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      content: UI_TRANSLATIONS[newLang].systemUpdate,
      timestamp: new Date()
    };
    
    setChatState({
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          content: WELCOME_MESSAGES[newLang],
          timestamp: new Date()
        },
        systemMsg
      ],
      isLoading: false
    });
  };

  const handleSaveKb = (newContent: string) => {
    setKbContent(newContent);
    initializeChat(newContent, language);
    
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: 'model',
      content: t.systemUpdate,
      timestamp: new Date()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, systemMsg]
    }));
  };

  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    const msg = chatState.messages.find(m => m.id === messageId);
    if (msg) {
      db.saveFeedback({
        type,
        messageContent: msg.content
      });
    }

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

  const saveCurrentSession = () => {
    if (chatState.messages.length > 1) {
      db.saveChatSession({
        id: `SESSION-${Date.now()}`,
        timestamp: new Date().toISOString(),
        messages: chatState.messages
      });
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
    
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
    }

    try {
      const botMessageId = (Date.now() + 1).toString();
      const botMessagePlaceholder: Message = {
        id: botMessageId,
        role: 'model',
        content: '',
        timestamp: new Date(),
        groundingChunks: []
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessagePlaceholder]
      }));

      const stream = sendMessageStream(userMessage.content);
      let fullContent = '';
      let groundingData: any[] = [];

      for await (const chunk of stream) {
        if (chunk.type === 'text') {
          fullContent += chunk.data;
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: fullContent } 
                : msg
            )
          }));
        } else if (chunk.type === 'grounding') {
          groundingData = [...groundingData, ...chunk.data];
          setChatState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, groundingChunks: groundingData } 
                : msg
            )
          }));
        }
      }
      
      if (fullContent.length > 0) saveCurrentSession();

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

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setView('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setView('chat');
  };

  const handleAdminIconClick = () => {
    if (isAdmin) {
      setView('admin-dashboard');
    } else {
      setView('admin-login');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setView('chat')}
          >
            <div className="bg-accent/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{t.botName}</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  {view === 'chat' ? t.publicAssistant : t.adminPanel}
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <div className="relative inline-block text-left">
              <select 
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent cursor-pointer transition-all hover:bg-white"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            {isAdmin && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleLogout}
              >
                {t.logout}
              </Button>
            )}
            <button 
              className={`p-2 rounded-lg transition-colors ${view !== 'chat' ? 'bg-accent text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              onClick={handleAdminIconClick}
              title={t.adminAccess}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {view === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
              <div className="max-w-4xl mx-auto">
                {chatState.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} onFeedback={handleFeedback} />
                ))}
                {chatState.isLoading && (
                  <div className="flex w-full mb-8 justify-start">
                    <div className="flex flex-row">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm bg-white border border-slate-200 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex items-center px-6 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-accent/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <footer className="bg-white border-t border-slate-200 p-6">
              <div className="max-w-4xl mx-auto relative group">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t.inputPlaceholder}
                  className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent resize-none max-h-48 shadow-sm text-slate-800 placeholder-slate-400 transition-all group-hover:bg-white"
                  disabled={chatState.isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || chatState.isLoading}
                  className="absolute right-3 bottom-3 p-3 bg-accent text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </footer>
          </div>
        )}

        {view === 'admin-login' && (
          <div className="h-full flex items-center justify-center p-4">
            <LoginForm 
              onSuccess={handleLoginSuccess} 
              onCancel={() => setView('chat')} 
            />
          </div>
        )}

        {view === 'admin-dashboard' && (
          <div className="h-full overflow-y-auto p-6 bg-slate-50">
            <AdminDashboard 
              onManageKB={() => setIsKbEditorOpen(true)}
              onAnalyzeChat={handleAnalyzeChat}
              messageCount={chatState.messages.length}
            />
          </div>
        )}
      </main>

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