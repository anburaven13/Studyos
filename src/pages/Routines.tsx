import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Edit, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

type Block = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: string;
};

type RoutineSchedule = {
  [key: string]: Block[];
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Routines() {
  const [schedule, setSchedule] = useState<RoutineSchedule | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [workingSchedule, setWorkingSchedule] = useState<RoutineSchedule | null>(null);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  
  const [autoWake, setAutoWake] = useState('07:00');
  const [autoSleep, setAutoSleep] = useState('22:00');
  const [autoType, setAutoType] = useState('school');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDayIndex = new Date().getDay();
  const todayName = currentDayIndex === 0 ? 'Sunday' : days[currentDayIndex - 1];

  useEffect(() => {
    const fetchRoutine = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const [schRes, progRes] = await Promise.all([
          fetch('/api/routines', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/routines/progress?date=${todayStr}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (schRes.ok) setSchedule(await schRes.json());
        if (progRes.ok) setProgress(await progRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoutine();
  }, [todayStr]);

  const toggleProgress = async (blockId: string) => {
    const newProgress = { ...progress, [blockId]: !progress[blockId] };
    setProgress(newProgress);
    
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/api/routines/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: todayStr, progress: newProgress })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const saveRoutine = async () => {
    if (!workingSchedule) return;
    
    // Sort blocks by start time before saving
    const sorted = { ...workingSchedule };
    Object.keys(sorted).forEach(day => {
      sorted[day].sort((a, b) => a.start.localeCompare(b.start));
    });

    setSchedule(sorted);
    setIsEditMode(false);

    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ schedule: sorted })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const enterEditMode = () => {
    setWorkingSchedule(schedule ? JSON.parse(JSON.stringify(schedule)) : null);
    setSelectedDay(todayName);
    setIsEditMode(true);
  };

  const addMinutes = (timeStr: string, mins: number) => {
    let [h, m] = timeStr.split(':').map(Number);
    m += mins;
    h += Math.floor(m / 60);
    m = m % 60;
    h = h % 24;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const generateRoutineLogic = (wake: string, sleep: string, type: string) => {
    let routine: Block[] = [];
    let current = wake;
    let baseId = Date.now();
    
    routine.push({ id: `gen-${baseId++}`, title: "Morning Routine & Breakfast", start: current, end: addMinutes(current, 60), type: "break" });
    current = addMinutes(current, 60);

    if (type === "school" || type === "college") {
        let schoolHours = type === "school" ? 360 : 240; 
        let schoolTitle = type === "school" ? "School" : "College Classes";
        
        routine.push({ id: `gen-${baseId++}`, title: schoolTitle, start: current, end: addMinutes(current, schoolHours), type: "school" });
        current = addMinutes(current, schoolHours);
        
        routine.push({ id: `gen-${baseId++}`, title: "Lunch & Rest", start: current, end: addMinutes(current, 60), type: "break" });
        current = addMinutes(current, 60);
        
        routine.push({ id: `gen-${baseId++}`, title: "Self Study Session 1", start: current, end: addMinutes(current, 120), type: "study" });
        current = addMinutes(current, 120);
        
        routine.push({ id: `gen-${baseId++}`, title: "Free Time / Relax", start: current, end: addMinutes(current, 90), type: "break" });
        current = addMinutes(current, 90);
        
        routine.push({ id: `gen-${baseId++}`, title: "Self Study Session 2", start: current, end: addMinutes(current, 120), type: "study" });
        current = addMinutes(current, 120);
        
        routine.push({ id: `gen-${baseId++}`, title: "Dinner", start: current, end: addMinutes(current, 60), type: "break" });
        current = addMinutes(current, 60);
        
        routine.push({ id: `gen-${baseId++}`, title: "Wind Down", start: current, end: sleep, type: "study" });
    } else {
        routine.push({ id: `gen-${baseId++}`, title: "Morning Deep Work", start: current, end: addMinutes(current, 180), type: "study" });
        current = addMinutes(current, 180);
        
        routine.push({ id: `gen-${baseId++}`, title: "Lunch & Break", start: current, end: addMinutes(current, 60), type: "break" });
        current = addMinutes(current, 60);
        
        routine.push({ id: `gen-${baseId++}`, title: "Afternoon Study", start: current, end: addMinutes(current, 180), type: "study" });
        current = addMinutes(current, 180);
        
        routine.push({ id: `gen-${baseId++}`, title: "Evening Relax", start: current, end: addMinutes(current, 90), type: "break" });
        current = addMinutes(current, 90);
        
        routine.push({ id: `gen-${baseId++}`, title: "Evening Study", start: current, end: addMinutes(current, 120), type: "study" });
        current = addMinutes(current, 120);
        
        routine.push({ id: `gen-${baseId++}`, title: "Dinner", start: current, end: addMinutes(current, 60), type: "break" });
        current = addMinutes(current, 60);
        
        routine.push({ id: `gen-${baseId++}`, title: "Wind Down", start: current, end: sleep, type: "study" });
    }
    
    routine.push({ id: `gen-${baseId++}`, title: "Sleep", start: sleep, end: wake, type: "sleep" });
    return routine;
  };

  const handleAutoGenerate = () => {
    const generated = generateRoutineLogic(autoWake, autoSleep, autoType);
    if (!workingSchedule) return;
    
    const newSchedule = { ...workingSchedule };
    days.forEach(day => {
      newSchedule[day] = JSON.parse(JSON.stringify(generated));
    });
    setWorkingSchedule(newSchedule);
    setIsAutoModalOpen(false);
  };

  if (!schedule) {
    return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'study': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'class': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'break': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sleep': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col relative">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Daily Routines</h1>
          <p className="text-muted-foreground mt-1">Structure your days for maximum productivity.</p>
        </div>
        {!isEditMode ? (
          <button 
            onClick={enterEditMode}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Weekly Routine</span>
          </button>
        ) : (
          <div className="flex space-x-4">
            <button 
              onClick={() => setIsAutoModalOpen(true)}
              className="bg-amber-500 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Generate</span>
            </button>
            <button 
              onClick={() => setIsEditMode(false)}
              className="bg-muted text-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
            <button 
              onClick={saveRoutine}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {!isEditMode ? (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Today's Routine ({todayName})</h2>
          </div>
          
          <div className="space-y-3">
            {schedule[todayName]?.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-sm">
                No routine set for today. Click "Edit Weekly Routine" to get started.
              </div>
            ) : (
              schedule[todayName]?.map(block => {
                const isChecked = progress[block.id];
                return (
                  <div key={block.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                    isChecked ? "bg-muted/30 opacity-60" : "bg-card shadow-sm hover:shadow-md"
                  )}>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => toggleProgress(block.id)} className={isChecked ? "text-primary" : "text-muted-foreground hover:text-primary"}>
                        {isChecked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div>
                        <p className={cn("font-medium", isChecked && "line-through")}>{block.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatTime(block.start)} - {formatTime(block.end)}</p>
                      </div>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border", getTypeColor(block.type))}>
                      {block.type}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 shrink-0">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedDay === day ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {workingSchedule?.[selectedDay]?.map((block, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-xl border bg-card">
                <input 
                  type="text" 
                  value={block.title}
                  onChange={(e) => {
                    const newSch = { ...workingSchedule };
                    newSch[selectedDay][index].title = e.target.value;
                    setWorkingSchedule(newSch);
                  }}
                  className="flex-1 p-2 rounded-md border bg-background text-sm"
                  placeholder="Activity Title"
                />
                <input 
                  type="time" 
                  value={block.start}
                  onChange={(e) => {
                    const newSch = { ...workingSchedule };
                    newSch[selectedDay][index].start = e.target.value;
                    setWorkingSchedule(newSch);
                  }}
                  className="w-28 p-2 rounded-md border bg-background text-sm"
                />
                <input 
                  type="time" 
                  value={block.end}
                  onChange={(e) => {
                    const newSch = { ...workingSchedule };
                    newSch[selectedDay][index].end = e.target.value;
                    setWorkingSchedule(newSch);
                  }}
                  className="w-28 p-2 rounded-md border bg-background text-sm"
                />
                <select 
                  value={block.type}
                  onChange={(e) => {
                    const newSch = { ...workingSchedule };
                    newSch[selectedDay][index].type = e.target.value;
                    setWorkingSchedule(newSch);
                  }}
                  className="w-32 p-2 rounded-md border bg-background text-sm"
                >
                  <option value="school">School/College</option>
                  <option value="study">Deep Study</option>
                  <option value="class">Tuition</option>
                  <option value="break">Break/Chill</option>
                  <option value="sleep">Sleep</option>
                </select>
                <button 
                  onClick={() => {
                    const newSch = { ...workingSchedule };
                    newSch[selectedDay].splice(index, 1);
                    setWorkingSchedule(newSch);
                  }}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newSch = { ...workingSchedule! };
                newSch[selectedDay].push({
                  id: `custom-${Date.now()}`,
                  title: "New Activity",
                  start: "12:00",
                  end: "13:00",
                  type: "study"
                });
                setWorkingSchedule(newSch);
              }}
              className="w-full p-3 rounded-xl border border-dashed border-primary/50 text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center"
            >
              + Add Time Block
            </button>
          </div>
        </div>
      )}

      {isAutoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-6 rounded-2xl shadow-xl w-full max-w-md border">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2 text-amber-500">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-xl font-semibold text-foreground">Auto-Generate Routine</h2>
              </div>
              <button onClick={() => setIsAutoModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                This will automatically generate an optimized routine for your entire week based on your wake and sleep times. This will replace your current schedule.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Wake up at</label>
                  <input type="time" value={autoWake} onChange={e=>setAutoWake(e.target.value)} className="w-full p-2 rounded-md border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sleep at</label>
                  <input type="time" value={autoSleep} onChange={e=>setAutoSleep(e.target.value)} className="w-full p-2 rounded-md border bg-background" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Daytime Activity</label>
                <select value={autoType} onChange={e=>setAutoType(e.target.value)} className="w-full p-2 rounded-md border bg-background">
                  <option value="school">School (6 hours)</option>
                  <option value="college">College (4 hours)</option>
                  <option value="study">Self Study (No Classes)</option>
                </select>
              </div>
              <button onClick={handleAutoGenerate} className="w-full bg-amber-500 text-white py-2 rounded-md font-medium hover:opacity-90 mt-4">
                Generate My Week
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
