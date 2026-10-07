import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, AlertTriangle, BookOpen, Brain, Play, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function ExamHub() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/exam-mode/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const defaultData = {
    status: 'AT RISK',
    readiness: 67,
    syllabus_coverage: 78,
    mastery: 61,
    revision: 42,
    days_left: 17,
    exams: [
      { id: 1, name: 'Science Board Examination', subject: 'Science' }
    ],
    today_plan: [
      { subject: 'Mathematics', minutes: 45 },
      { subject: 'Science', minutes: 60 },
      { subject: 'English', minutes: 30 },
      { subject: 'Revision', minutes: 20 }
    ],
    ai_priority: {
      topic: 'Electricity',
      mastery: 31,
      recommended_minutes: 45
    }
  };

  const data = dashboardData?.status ? { ...defaultData, ...dashboardData } : defaultData;

  const primaryExam = data.exams?.[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Exam Mode</h1>
          <p className="text-muted-foreground mt-1 font-medium">
            {user?.board || 'CBSE'} • {user?.class_level || 'Class 10'}
          </p>
        </div>
        {primaryExam && (
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{primaryExam.name}</div>
              <div className="font-bold">{data.days_left} DAYS LEFT</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Readiness Column */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Target className="w-32 h-32" />
          </div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Exam Readiness</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-black">{data.readiness}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${data.readiness}%` }}></div>
          </div>
          
          <div className="space-y-3 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Syllabus</span>
              <span>{data.syllabus_coverage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mastery</span>
              <span>{data.mastery}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revision</span>
              <span>{data.revision}%</span>
            </div>
          </div>
        </div>

        {/* AI Priority */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-4 font-semibold uppercase tracking-wider text-sm">
            <AlertTriangle className="w-4 h-4" /> AI Priority Focus
          </div>
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">⚠ {data.ai_priority.topic}</h3>
              <p className="text-muted-foreground mb-4 font-medium">
                Your mastery is only {data.ai_priority.mastery}%. This is a high-yield topic and requires your immediate attention.
              </p>
              <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-500/10">
                <Brain className="w-4 h-4 text-amber-600" /> {data.ai_priority.recommended_minutes} minutes recommended
              </div>
            </div>
            
            <div className="flex flex-col gap-2 min-w-[160px]">
              <button 
                onClick={() => navigate(`/app/exams/${primaryExam?.id || 'new'}`)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> Start Studying
              </button>
              <button className="w-full bg-background hover:bg-muted text-foreground border px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
                Practice Questions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Plan */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" /> Today's Adaptive Plan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {data.today_plan.map((item: any, idx: number) => (
            <div key={idx} className="bg-card border rounded-2xl p-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">{item.minutes}m</span>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2">{item.subject}</h3>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
