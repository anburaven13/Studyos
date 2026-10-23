import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  Bot, 
  Target, 
  Calendar, 
  CheckSquare, 
  FolderGit2, 
  MessageSquare, 
  Dna, 
  Settings, 
  PlusCircle, 
  Sparkles, 
  SunMoon, 
  LineChart,
  ArrowRight,
  X
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  onOpenMathGrapher?: () => void;
}

interface DialItem {
  id: string;
  num: string;
  label: string;
  fullTitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  angle: number; // degrees
  action: () => void;
  keywords: string[];
}

export default function CommandPalette({ onOpenMathGrapher }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [hoveredTile, setHoveredTile] = useState<DialItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 8 Pure Monochrome Radial Items
  const dialItems: DialItem[] = useMemo(() => [
    {
      id: 'tutor',
      num: '1',
      label: 'AI Tutor',
      fullTitle: 'AI Tutor 24/7 Chat',
      desc: 'Ask homework, syllabus, and study questions',
      icon: Bot,
      angle: -90, // Top / 12 o'clock
      action: () => navigate('/app/tutor'),
      keywords: ['tutor', 'ai', 'chat', 'ask', 'question', 'help', 'doubt']
    },
    {
      id: 'math',
      num: '2',
      label: 'Math Grapher',
      fullTitle: 'Interactive Math & Function Grapher',
      desc: 'Plot 2D mathematical curves with dynamic parameter sliders',
      icon: LineChart,
      angle: -45, // Top-Right / 1:30
      action: () => {
        if (onOpenMathGrapher) {
          onOpenMathGrapher();
        } else {
          window.dispatchEvent(new CustomEvent('studyos:open-math-grapher'));
        }
      },
      keywords: ['math', 'grapher', 'graph', 'plot', 'formula', 'curve', 'sine', 'stem', 'mafs']
    },
    {
      id: 'notes',
      num: '3',
      label: 'Notes & FSRS',
      fullTitle: 'Notes & Spaced Repetition',
      desc: 'Study notes and smart FSRS flashcard reviews',
      icon: BookOpen,
      angle: 0, // Right / 3 o'clock
      action: () => navigate('/app/notes'),
      keywords: ['notes', 'flashcards', 'fsrs', 'review', 'deck', 'cards', 'spaced']
    },
    {
      id: 'routines',
      num: '4',
      label: 'Routines',
      fullTitle: 'Daily Routines & Habits',
      desc: 'Track consistent daily study streaks and routines',
      icon: CheckSquare,
      angle: 45, // Bottom-Right / 4:30
      action: () => navigate('/app/routines'),
      keywords: ['routines', 'habits', 'streak', 'daily', 'checklist', 'routine']
    },
    {
      id: 'exams',
      num: '5',
      label: 'Exam Hub',
      fullTitle: 'Exams & Timetables',
      desc: 'Exam dates, countdowns, and Last-Minute Mode',
      icon: Target,
      angle: 90, // Bottom / 6 o'clock
      action: () => navigate('/app/exams'),
      keywords: ['exam', 'exams', 'hub', 'countdown', 'test', 'last-minute', 'schedule']
    },
    {
      id: 'planner',
      num: '6',
      label: 'Planner',
      fullTitle: 'Weekly Study Planner',
      desc: 'Schedule study blocks and track homework assignments',
      icon: Calendar,
      angle: 135, // Bottom-Left / 7:30
      action: () => navigate('/app/planner'),
      keywords: ['planner', 'calendar', 'homework', 'timetable', 'week', 'schedule']
    },
    {
      id: 'workspace',
      num: '7',
      label: 'Workspace',
      fullTitle: 'PDF Workspace Q&A',
      desc: 'Extract knowledge and chat with uploaded textbooks and PDFs',
      icon: FolderGit2,
      angle: 180, // Left / 9 o'clock
      action: () => navigate('/app/workspace'),
      keywords: ['workspace', 'pdf', 'document', 'upload', 'textbook', 'syllabus']
    },
    {
      id: 'genome',
      num: '8',
      label: 'Genome',
      fullTitle: 'Knowledge Genome & Analytics',
      desc: 'Visualize cognitive mastery, retention scores, and learning stats',
      icon: Dna,
      angle: 225, // Top-Left / 10:30
      action: () => navigate('/app/genome'),
      keywords: ['genome', 'dna', 'stats', 'analytics', 'mastery', 'knowledge', 'progress']
    }
  ], [navigate, onOpenMathGrapher]);

  // Additional searchable actions
  const extraActions = useMemo(() => [
    {
      id: 'theme',
      label: 'Toggle Dark / Light Theme',
      desc: `Switch theme mode (currently ${theme})`,
      icon: SunMoon,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      keywords: ['theme', 'dark', 'light', 'mode', 'color']
    },
    {
      id: 'settings',
      label: 'Settings',
      desc: 'Manage account, username, and security profile',
      icon: Settings,
      action: () => navigate('/app/settings'),
      keywords: ['settings', 'account', 'profile', 'username', 'security', 'password']
    },
    {
      id: 'messages',
      label: 'Messages',
      desc: 'Peer messaging and academic file attachments',
      icon: MessageSquare,
      action: () => navigate('/app/messages'),
      keywords: ['messages', 'chat', 'friends', 'dm', 'peer', 'social']
    },
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      desc: 'Main StudyOS productivity home',
      icon: LayoutDashboard,
      action: () => navigate('/app'),
      keywords: ['dashboard', 'home', 'overview', 'main']
    },
    {
      id: 'add-exam',
      label: 'Add Exam / Countdown',
      desc: 'Quickly create a new exam countdown',
      icon: PlusCircle,
      action: () => navigate('/app/exams'),
      keywords: ['add', 'new', 'exam', 'create']
    }
  ], [navigate, setTheme, theme]);

  // Filtered results when typing in search
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const matches: Array<{
      id: string;
      title: string;
      desc: string;
      icon: React.ComponentType<{ className?: string }>;
      action: () => void;
    }> = [];

    // Search dial items
    dialItems.forEach((item) => {
      if (
        item.fullTitle.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      ) {
        matches.push({
          id: item.id,
          title: item.fullTitle,
          desc: item.desc,
          icon: item.icon,
          action: item.action
        });
      }
    });

    // Search extra actions
    extraActions.forEach((item) => {
      if (
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      ) {
        matches.push({
          id: item.id,
          title: item.label,
          desc: item.desc,
          icon: item.icon,
          action: item.action
        });
      }
    });

    return matches;
  }, [search, dialItems, extraActions]);

  const executeAction = (action: () => void) => {
    setOpen(false);
    setSearch('');
    setHoveredTile(null);
    action();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // 1. Close on ESC key
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          setSearch('');
          setHoveredTile(null);
          return;
        }
      }

      // 2. Toggle on Ctrl+K, Cmd+K, Ctrl+P, Cmd+P
      const isK = e.key === 'k' || e.key === 'K' || e.code === 'KeyK';
      const isP = e.key === 'p' || e.key === 'P' || e.code === 'KeyP';
      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && (isK || isP)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => {
          if (!prev) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return !prev;
        });
        return;
      }

      // 3. Number hotkeys 1-8 when open and not typing query
      if (open && !search.trim()) {
        const digit = parseInt(e.key, 10);
        if (digit >= 1 && digit <= dialItems.length) {
          e.preventDefault();
          const targetItem = dialItems[digit - 1];
          if (targetItem) {
            executeAction(targetItem.action);
          }
        }
      }
    };

    const handleCustomOpen = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    const handleCustomClose = () => {
      setOpen(false);
      setSearch('');
      setHoveredTile(null);
    };

    window.addEventListener('keydown', down, { capture: true });
    window.addEventListener('studyos:open-command-palette', handleCustomOpen);
    window.addEventListener('studyos:close-command-palette', handleCustomClose);

    return () => {
      window.removeEventListener('keydown', down, { capture: true });
      window.removeEventListener('studyos:open-command-palette', handleCustomOpen);
      window.removeEventListener('studyos:close-command-palette', handleCustomClose);
    };
  }, [open, search, dialItems]);

  if (!open) return null;

  // Center-to-tile radial distance: 135px desktop, 105px mobile
  const radius = isMobile ? 105 : 135;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      {/* =========================================================================
          TIER 1: BASELAYER (The Vibrant Backdrop)
          A color-rich ambient light field that provides luminous chromatic photons
          for the liquid glass layers to refract, bend, and pull through.
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep ambient backdrop blur */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[40px]" />
        
        {/* Dynamic Chromatic Spectral Fields (Apple VisionOS / macOS Ambient Physics) */}
        <div className="absolute top-[28%] left-[32%] w-[460px] h-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-600/35 via-purple-600/30 to-pink-500/25 blur-[120px] mix-blend-screen opacity-70" />
        <div className="absolute bottom-[28%] right-[32%] w-[480px] h-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-gradient-to-bl from-cyan-500/30 via-blue-600/25 to-emerald-500/20 blur-[130px] mix-blend-screen opacity-65" />
        
        {/* Peripheral optical vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* SVG Physics Definitions: Optical Refractive Displacement Mesh */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="apple-liquid-glass-lens" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="glassWarp" />
            <feDisplacementMap in="SourceGraphic" in2="glassWarp" scale="3" xChannelSelector="R" yChannelSelector="G" result="refractedLight" />
          </filter>
        </defs>
      </svg>

      {/* Main Glass HUD Container */}
      <div 
        className="relative z-10 flex flex-col items-center w-full max-w-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            TOP SEARCH BAR (Liquid Glass Capsule)
            ========================================================================= */}
        <div className="w-full max-w-md mx-auto mb-5 flex items-center px-4 py-2.5 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-[42px] backdrop-saturate-[220%] backdrop-contrast-[110%] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-all focus-within:border-white/[0.25] focus-within:bg-white/[0.04]">
          <Search className="w-4 h-4 text-white/70 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page, or question..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-white/40 text-white font-normal"
            autoFocus
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-white/50 hover:text-white text-xs transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setOpen(false)}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.12] text-[10px] font-mono text-white/80 hover:text-white transition-all cursor-pointer active:scale-95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
              title="Close (Esc)"
              aria-label="Close command palette"
            >
              <span>ESC</span>
              <X className="w-3 h-3 opacity-70" />
            </button>
          )}
        </div>

        {/* =========================================================================
            VIEW 1: SEARCH RESULTS (When query is active)
            ========================================================================= */}
        {search.trim().length > 0 ? (
          <div className="w-full max-w-lg bg-black/40 border border-white/[0.12] rounded-2xl backdrop-blur-[42px] backdrop-saturate-[220%] p-2 max-h-[380px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]">
            {filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => executeAction(item.action)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center px-4 py-3 rounded-xl text-left transition-all cursor-pointer",
                        isSelected 
                          ? "bg-white/[0.10] border border-white/[0.20] scale-[1.01] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]" 
                          : "hover:bg-white/[0.04] border border-transparent text-white/70"
                      )}
                    >
                      <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.12] mr-3.5 text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <p className="text-xs text-white/50 truncate">{item.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40 ml-2" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center px-4">
                <p className="text-sm text-white/60 mb-3">No direct matching commands found.</p>
                <button
                  onClick={() => executeAction(() => navigate(`/app/tutor?prompt=${encodeURIComponent(search)}`))}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white text-sm font-medium transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Ask AI Tutor: "{search}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              VIEW 2: CONTINUOUS APPLE LIQUID GLASS RADIAL DIAL RING
              ========================================================================= */
          <div className="relative flex items-center justify-center w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]">
            {/* The Continuous Liquid Glass Annular Guide Ring */}
            <div className="absolute inset-0 m-auto w-[290px] h-[290px] sm:w-[370px] sm:h-[370px] rounded-full border border-white/[0.10] bg-white/[0.015] backdrop-blur-[42px] backdrop-saturate-[220%] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.04)] pointer-events-none">
              {/* Internal Concentric Precision Chamfers */}
              <div className="absolute inset-2 rounded-full border border-white/[0.06] pointer-events-none" />
              <div className="absolute inset-[32%] rounded-full border border-white/[0.10] pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)]" />
            </div>

            {/* Sub-Pixel Fine Crosshair Axes */}
            <div className="absolute w-[0.5px] h-[280px] sm:h-[360px] bg-gradient-to-b from-transparent via-white/[0.15] to-transparent pointer-events-none" />
            <div className="absolute h-[0.5px] w-[280px] sm:w-[360px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

            {/* Central Optical Lens Hub with Cross (Click or ESC to Exit) */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/[0.14] bg-white/[0.02] backdrop-blur-[44px] backdrop-saturate-[240%] backdrop-contrast-[112%] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),inset_0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col items-center justify-center cursor-pointer group hover:border-white/[0.28] hover:scale-105 transition-all duration-200 active:scale-95"
              title="Click or press ESC to close"
              aria-label="Exit Command Dial"
            >
              {/* Directional 12% Specularity Rim Highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />

              {/* Optical Convex Rim Ring */}
              <div className="absolute inset-1 rounded-full border border-white/[0.08] pointer-events-none" />

              {hoveredTile ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-150 px-1 relative z-10 text-white">
                  <hoveredTile.icon className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5 text-white stroke-[1.8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  <span className="text-[10px] font-mono font-bold tracking-tight text-white/95 truncate max-w-[70px]">
                    [{hoveredTile.num}] OPEN
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center group-hover:scale-105 transition-transform duration-200 relative z-10">
                  <X className="w-6 h-6 sm:w-7 sm:h-7 text-white/95 group-hover:text-white group-hover:rotate-90 transition-all duration-300 stroke-[1.8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  <span className="text-[9px] font-mono tracking-widest text-white/60 group-hover:text-white uppercase mt-0.5 font-semibold">
                    ESC
                  </span>
                </div>
              )}
            </button>

            {/* 8 Pure Liquid Glass Segmented Slides (True Optical Refractive Meshes) */}
            {dialItems.map((tile, index) => {
              const angleRad = (tile.angle * Math.PI) / 180;
              const x = Math.round(Math.cos(angleRad) * radius);
              const y = Math.round(Math.sin(angleRad) * radius);
              const Icon = tile.icon;
              const isHovered = hoveredTile?.id === tile.id;

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => executeAction(tile.action)}
                  onMouseEnter={() => setHoveredTile(tile)}
                  onMouseLeave={() => setHoveredTile(null)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  className={cn(
                    "absolute z-20 flex flex-col items-center justify-center overflow-hidden",
                    "w-16 h-16 sm:w-[88px] sm:h-[88px] p-2 rounded-2xl",
                    // TIER 4: Precise 0.5px-1px Sub-Pixel Hairline Border
                    "border border-white/[0.12] hover:border-white/[0.28]",
                    // TIER 2: Deep Gaussian Refraction (42px blur, 240% saturation boost)
                    "bg-white/[0.02] hover:bg-white/[0.05]",
                    "backdrop-blur-[42px] backdrop-saturate-[240%] backdrop-contrast-[112%]",
                    // TIER 4: 8-15% White Specularity Rim Highlight (NO Drop Shadows)
                    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                    "transition-all duration-200 cursor-pointer group text-white",
                    isHovered 
                      ? "scale-[1.04] border-white/[0.35] bg-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.10)] z-40" 
                      : ""
                  )}
                  title={`${tile.fullTitle} (Press ${tile.num})`}
                >
                  {/* TIER 4: Directional Simulated Specular Highlight (12% Opacity Rim) */}
                  <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none rounded-t-2xl" />

                  {/* Refractive Optical Curvature Ring (Physical Edge Warp) */}
                  <div className="absolute inset-1 rounded-xl border border-white/[0.06] pointer-events-none" />

                  {/* Hotkey Number Pill: Dynamic Vibrancy blend */}
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 rounded-full bg-white/[0.08] text-[9px] font-mono font-bold text-white/90 flex items-center justify-center border border-white/[0.15] group-hover:text-white group-hover:border-white/[0.30] z-20 shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.15)]">
                    {tile.num}
                  </span>

                  {/* TIER 3: Top Layer Icon (High-Contrast Sharp Vibrancy) */}
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform group-hover:scale-110 relative z-10 stroke-[1.8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]" />

                  {/* TIER 3: Typography (Razor-Sharp Top Layer) */}
                  <span className="text-[9px] sm:text-[10px] font-medium text-white/95 group-hover:text-white text-center mt-1 truncate max-w-full px-0.5 leading-tight relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                    {tile.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Detail Bar below Dial (Liquid Glass Pill) */}
        <div className="mt-3 text-center min-h-[32px] px-4 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.02] backdrop-blur-[42px] backdrop-saturate-[220%] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.05)] text-xs text-white/70">
          {hoveredTile ? (
            <p className="text-white animate-in fade-in duration-100">
              <span className="font-semibold text-white">[{hoveredTile.num}] {hoveredTile.fullTitle}:</span>{' '}
              <span className="text-white/70">{hoveredTile.desc}</span>
            </p>
          ) : (
            <p className="space-x-3 text-[11px] font-mono text-white/70">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.12] text-white">1-8</kbd> to jump</span>
              <span>•</span>
              <span>Click <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.12] text-white">ESC</kbd> to exit</span>
              <span>•</span>
              <span>Type to search</span>
            </p>
          )}
        </div>

        {/* Quick Action Glass Buttons */}
        <div className="mt-3 flex items-center space-x-2">
          {extraActions.slice(0, 3).map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => executeAction(act.action)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.12] text-xs text-white/80 hover:text-white transition-all backdrop-blur-[40px] cursor-pointer active:scale-95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]"
              >
                <Icon className="w-3.5 h-3.5 text-white stroke-[1.8]" />
                <span className="hidden sm:inline font-normal">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Programmatic helper to open command palette
 */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('studyos:open-command-palette'));
}

/**
 * Programmatic helper to close command palette
 */
export function closeCommandPalette() {
  window.dispatchEvent(new CustomEvent('studyos:close-command-palette'));
}
