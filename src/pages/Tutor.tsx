import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Settings, Paperclip, Loader2, Trash2, LineChart, X, FileText, Image as ImageIcon } from 'lucide-react';
import { openMathGrapher } from '../components/math/InteractiveGrapher';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { simulateAiResponse, extractTextFromDocument, extractTextFromMultipleDocuments } from '../lib/aiService';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachmentUrl?: string;
  attachmentUrls?: string[];
};

type AttachedMedia = {
  id: string;
  file: File;
  url: string;
  name: string;
  type: string;
};

export default function Tutor() {
  const { user, token } = useAuth();
  const userContext = user?.class_level && user?.board ? `${user.class_level} - ${user.board}` : undefined;

  const DEFAULT_GREETING: Message = {
    id: '1',
    role: 'ai',
    content: "Hello! I'm your StudyOS AI Tutor. I can help explain difficult concepts, solve math problems, or test your knowledge. What would you like to study today?"
  };

  const getStorageKey = useCallback(() => (user?.id ? `tutor_messages_${user.id}` : 'tutor_messages'), [user?.id]);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const userKey = user?.id ? `tutor_messages_${user.id}` : 'tutor_messages';
      const saved = localStorage.getItem(userKey) || localStorage.getItem('tutor_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [{
      id: '1',
      role: 'ai',
      content: "Hello! I'm your StudyOS AI Tutor. I can help explain difficult concepts, solve math problems, or test your knowledge. What would you like to study today?"
    }];
  });
  const [_isLoadingHistory, setIsLoadingHistory] = useState(false);
  const isInitialSyncDone = useRef(false);
  const [input, setInput] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('prompt') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('prompt')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const [isTyping, setIsTyping] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedMedia[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<'google' | 'nvidia'>(() => {
    const saved = localStorage.getItem('ai_provider');
    if (saved === 'groq') return 'google';
    return (saved as 'google' | 'nvidia') || 'google';
  });
  const [model, setModel] = useState<string>(
    localStorage.getItem('ai_model') || 'auto'
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem('nvidia_key') || '');

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('nvidia_key', apiKey);
    localStorage.setItem('ai_model', model);
  }, [provider, apiKey, model]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Always save to localStorage immediately on every change so messages NEVER disappear
  useEffect(() => {
    const key = getStorageKey();
    try {
      localStorage.setItem(key, JSON.stringify(messages));
      localStorage.setItem('tutor_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [messages, user?.id, getStorageKey]);

  // Two-way smart cloud sync with MongoDB
  useEffect(() => {
    if (!token) return;

    fetch(`/api/tutor/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) return [];
        try {
          return await r.json();
        } catch {
          return [];
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 1) {
            setMessages(prev => {
              // If local has more messages than cloud (e.g. typed offline), push local to cloud
              if (prev.length > data.length) {
                fetch(`/api/tutor/history`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ messages: prev })
                }).catch(err => console.error('Cloud push error', err));
                return prev;
              }
              // Cloud has more/equal messages: update local
              return data;
            });
          } else if (data.length <= 1) {
            // Cloud has no chat yet, but user has existing local chat! Push local to cloud
            setMessages(prev => {
              if (prev.length > 1) {
                fetch(`/api/tutor/history`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ messages: prev })
                }).catch(err => console.error('Cloud upload error', err));
              }
              return prev;
            });
          }
        }
        setIsLoadingHistory(false);
        isInitialSyncDone.current = true;
      })
      .catch(e => {
        console.error('Failed to load history from cloud', e);
        setIsLoadingHistory(false);
        isInitialSyncDone.current = true;
      });
  }, [token]);

  // Auto-save changes to cloud after initial sync is established
  useEffect(() => {
    if (!token || !isInitialSyncDone.current) return;
    if (messages.length <= 1) return;

    const timer = setTimeout(() => {
      fetch(`/api/tutor/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages })
      }).catch(e => console.error('Failed to save history to cloud', e));
    }, 600);

    return () => clearTimeout(timer);
  }, [messages, token]);

  const addFilesToAttachments = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const validNewFiles: AttachedMedia[] = [];
    list.forEach((file, i) => {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        validNewFiles.push({
          id: `media-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}`,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          type: file.type
        });
      }
    });

    if (validNewFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validNewFiles]);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    addFilesToAttachments(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = useCallback((event: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const pastedFiles: File[] = [];

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }
    }

    if (pastedFiles.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          pastedFiles.push(file);
        }
      }
    }

    if (pastedFiles.length > 0) {
      event.preventDefault();
      addFilesToAttachments(pastedFiles);
    }
  }, [addFilesToAttachments]);

  // Window-level paste listener so user can paste screenshot anywhere while viewing the Tutor page
  useEffect(() => {
    const windowPasteListener = (e: ClipboardEvent) => {
      // If user is pasting files/images, intercept it
      if (e.clipboardData && (e.clipboardData.files.length > 0 || Array.from(e.clipboardData.items).some(i => i.type.startsWith('image/')))) {
        handlePaste(e);
      }
    };
    window.addEventListener('paste', windowPasteListener);
    return () => window.removeEventListener('paste', windowPasteListener);
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToAttachments(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles(prev => {
      const match = prev.find(item => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.url);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userContent = input.trim() || 'Please analyze the attached image(s) / document(s).';
    const currentAttachedFiles = [...attachedFiles];

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userContent,
      attachmentUrl: currentAttachedFiles[0]?.url,
      attachmentUrls: currentAttachedFiles.map(f => f.url)
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      const aiMessages = [...newMessages];
      if (currentAttachedFiles.length > 0) {
        setIsParsing(true);
        const extractedText = await extractTextFromMultipleDocuments(currentAttachedFiles.map(f => f.file));
        const fileNames = currentAttachedFiles.map(f => f.name).join(', ');
        aiMessages[aiMessages.length - 1] = {
          ...userMessage,
          content: `[Attached Context from ${fileNames}:\n${extractedText}]\n\nUser Question: ${userContent}`
        };
        setIsParsing(false);
      }

      const providerInfo = {
        provider,
        apiKey: provider === 'nvidia' ? apiKey : undefined,
        model: provider === 'nvidia' ? 'nvidia/nemotron-3-ultra-550b-a55b' : model
      };

      const aiResponseContent = await simulateAiResponse(aiMessages, undefined, userContext, providerInfo);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponseContent };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Send Error:', err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "Sorry, I encountered an error while processing that." }]);
      setIsParsing(false);
    }
    setIsTyping(false);
  };

  const handleClearChat = async () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      const reset = [DEFAULT_GREETING];
      setMessages(reset);
      const key = getStorageKey();
      try {
        localStorage.setItem(key, JSON.stringify(reset));
        localStorage.setItem('tutor_messages', JSON.stringify(reset));
      } catch (e) {}

      if (token) {
        try {
          await fetch(`/api/tutor/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ messages: reset, clear: true })
          });
        } catch (e) {
          console.error('Failed to clear cloud history', e);
        }
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground mt-1">Your personal 24/7 teaching assistant.</p>
        </div>
        <div className="flex-1" />
        <button 
          onClick={() => openMathGrapher()}
          className="flex items-center space-x-1.5 px-3 py-2 border rounded-md hover:bg-muted text-indigo-400 border-indigo-500/20 bg-indigo-500/5 transition-colors text-sm font-medium"
          title="Open Interactive Math Grapher"
        >
          <LineChart className="w-4 h-4" />
          <span className="hidden sm:inline">Math Grapher</span>
        </button>
        <button 
          onClick={handleClearChat}
          className="p-2 border rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 border rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="AI Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 p-6 border rounded-2xl bg-card shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold mb-4">Model Settings</h3>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">AI Provider</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full p-2.5 bg-background border rounded-lg text-sm outline-none focus:border-primary"
              >
                <option value="google">Google / Gemini (Default)</option>
                <option value="nvidia">Nvidia Nemotron (NVIDIA NIM)</option>
              </select>
            </div>
            
            {provider === 'google' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Model Selection</label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg text-sm outline-none focus:border-primary"
                >
                  <option value="auto">Auto (Smart Fallback Selection - Recommended)</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Fastest)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Most Reliable)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (High)</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
                  <option value="gemma-4-31b-it">Gemma 4 31B</option>
                  <option value="gemma-4-26b-a4b-it">Gemma 4 26B MoE</option>
                  <option value="gemma-4-4b-it">Gemma 4 4B</option>
                </select>
              </div>
            )}
            
            {provider === 'nvidia' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">NVIDIA API Key</label>
                <input 
                  type="password"
                  placeholder="nvapi-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2.5 bg-background border rounded-lg text-sm outline-none focus:border-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Using model: <span className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">nvidia/nemotron-3-ultra-550b-a55b</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div 
        className={cn(
          "flex-1 border rounded-2xl bg-card shadow-sm flex flex-col overflow-hidden relative transition-all",
          isDragging && "ring-2 ring-primary ring-offset-2 bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-2xl pointer-events-none">
            <Paperclip className="w-10 h-10 text-primary animate-bounce mb-2" />
            <p className="text-base font-semibold text-foreground">Drop images or PDFs here</p>
            <p className="text-xs text-muted-foreground">They will be attached to your question</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex space-x-4", msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : '')}>
              <div className={cn("w-8 h-8 flex-shrink-0 rounded flex items-center justify-center mt-1", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className={cn("max-w-[80%] rounded-xl p-4 text-sm leading-relaxed", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border')}>
                {msg.role === 'user' ? (
                  <div className="flex flex-col gap-2">
                    {msg.attachmentUrls && msg.attachmentUrls.length > 0 ? (
                      <div className={cn(
                        "grid gap-2 mb-1",
                        msg.attachmentUrls.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
                      )}>
                        {msg.attachmentUrls.map((url, idx) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="block overflow-hidden rounded-lg border border-primary/20 hover:opacity-90 transition-opacity bg-black/10"
                            title="Click to view full image"
                          >
                            <img src={url} alt={`Attachment ${idx + 1}`} className="max-h-48 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : msg.attachmentUrl ? (
                      <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="block max-w-[220px] rounded-lg overflow-hidden border border-primary/20">
                        <img src={msg.attachmentUrl} alt="User attachment" className="max-h-48 w-full object-contain" />
                      </a>
                    ) : null}
                    <span>{msg.content}</span>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-border">
                    <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]}>{msg.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex space-x-4">
              <div className="w-8 h-8 flex-shrink-0 rounded bg-muted flex items-center justify-center mt-1">
                <Bot className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="rounded-xl p-4 bg-muted/50 border flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150" />
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        <div className="p-4 border-t bg-background flex flex-col gap-3">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pb-1">
              {attachedFiles.map((att) => (
                <div 
                  key={att.id} 
                  className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 shadow-sm flex items-center p-1.5 gap-2 pr-7 max-w-[220px]"
                >
                  {att.type.startsWith('image/') ? (
                    <img src={att.url} alt={att.name} className="h-11 w-11 object-cover rounded-lg border border-border/50 shrink-0" />
                  ) : (
                    <div className="h-11 w-11 flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase shrink-0">
                      <FileText className="w-4 h-4 mb-0.5" />
                      PDF
                    </div>
                  )}
                  <div className="flex flex-col text-xs min-w-0">
                    <span className="font-medium truncate text-foreground text-[11px]">{att.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(att.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm transition-colors"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {attachedFiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => setAttachedFiles([])}
                  className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded transition-colors"
                >
                  Clear all ({attachedFiles.length})
                </button>
              )}
            </div>
          )}
          <div className="flex flex-row items-stretch sm:items-center gap-3 w-full">
            <input 
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-muted hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground rounded-xl transition-colors flex-shrink-0 flex items-center justify-center"
              title="Upload Images or PDFs (Multiple supported)"
              disabled={isParsing}
            >
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Paperclip className="w-5 h-5" />}
            </button>
            <div className="flex-1 relative">
              <input 
                type="text"
                className="w-full bg-muted/50 border border-transparent focus:border-border rounded-xl px-4 py-3 outline-none text-sm transition-colors placeholder:text-muted-foreground/70"
                placeholder={attachedFiles.length > 0 ? "Ask about attached file(s) or paste more images (Ctrl+V)..." : "Ask a question or paste images (Ctrl+V)..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button 
              type="button"
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isTyping || isParsing}
              className="w-12 h-12 flex-shrink-0 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity shadow-sm"
              title="Send message"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
