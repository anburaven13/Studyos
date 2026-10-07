import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, CheckCircle, Clock, LayoutList, PenTool, MessageSquare, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';

export default function ExamWorkspace() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('syllabus');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hi! I'm your Exam Coach. Based on your profile, you need to focus on Electricity today. Should we start with a quick concept review or practice questions?" }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setChatHistory([...chatHistory, { role: 'user', text: message }]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: "I recommend we start by reviewing Ohm's Law. Here is a quick breakdown..." 
      }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* LEFT PANE: Content & Progress */}
      <div className="flex-1 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/exams')} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold">Science Board Examination</h2>
              <p className="text-xs text-muted-foreground">Class 10 • CBSE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" /> 17 Days Left
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b overflow-x-auto hide-scrollbar">
          {['syllabus', 'progress', 'practice', 'notes'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><LayoutList className="w-4 h-4" /> Official Syllabus</h3>
                <span className="text-xs bg-muted px-2 py-1 rounded font-medium">78% Covered</span>
              </div>
              
              {/* Dummy Syllabus Tree */}
              <div className="space-y-3">
                <div className="border rounded-xl p-3">
                  <div className="font-semibold mb-2">Physics</div>
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Light: Reflection and Refraction</span>
                      <span className="text-muted-foreground text-xs">85% Mastery</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium text-amber-600 dark:text-amber-500">
                      <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-amber-500" /> Electricity</span>
                      <span className="text-xs">31% Mastery (PRIORITY)</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="font-semibold mb-2">Chemistry</div>
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Chemical Reactions</span>
                      <span className="text-muted-foreground text-xs">92% Mastery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab !== 'syllabus' && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <PenTool className="w-12 h-12 mb-4 opacity-20" />
              <p>This tab is currently under construction.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: AI Coach */}
      <div className="w-full md:w-96 flex flex-col bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-primary/5 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Exam Coach</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted rounded-tl-sm"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t bg-muted/20">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask anything..." 
              className="w-full bg-background border rounded-xl pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button 
              type="submit"
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary disabled:opacity-50 hover:bg-primary/10 rounded-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
