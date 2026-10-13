import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, type Variants } from 'motion/react';
import { 
  Brain, 
  ArrowLeft, 
  Home, 
  BookOpen, 
  Calendar, 
  Bot, 
  GraduationCap, 
  ArrowUpRight,
  Compass
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const homeDestination = user ? '/app' : '/';

  // Keyboard navigation shortcuts (ESC/Backspace to go back, H to go home)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(homeDestination);
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        navigate(homeDestination);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, homeDestination]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  const quickLinks = [
    {
      label: 'Dashboard',
      path: '/app',
      desc: 'Overview & metrics',
      icon: Home,
    },
    {
      label: 'Notes',
      path: '/app/notes',
      desc: 'Notebooks & summaries',
      icon: BookOpen,
    },
    {
      label: 'AI Tutor',
      path: '/app/tutor',
      desc: '24/7 concept breakdown',
      icon: Bot,
    },
    {
      label: 'Planner',
      path: '/app/planner',
      desc: 'Schedule & deadlines',
      icon: Calendar,
    },
    {
      label: 'Exam Hub',
      path: '/app/exams',
      desc: 'Revisions & practice',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="ios-surface dark min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-white/20 relative overflow-hidden">
      <Helmet>
        <title>404 — Page Not Found | StudyOS</title>
        <meta name="description" content="The requested page could not be found." />
      </Helmet>

      {/* Subtle colorful backdrops behind glass so liquid glass refracts naturally */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-fuchsia-600/25 to-cyan-500/25 rounded-full blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[350px] bg-gradient-to-r from-blue-600/25 via-teal-500/20 to-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[#09090b]/40 backdrop-blur-[1px]" />
      </div>

      {/* Top Bar */}
      <header className="w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md px-6 py-4 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to={homeDestination} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
              <Brain className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Study<span className="text-zinc-500">OS</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="ios-glass-clear inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono"
              style={{ color: '#fff' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              STATUS 404
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <motion.div
          className="w-full max-w-xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stark 404 Display */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-block">
              <span
                className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-md select-none block"
                style={{ font: '800 clamp(72px, 14vw, 110px)/1 var(--ios-font, system-ui, sans-serif)' }}
              >
                404
              </span>
            </div>
          </motion.div>

          {/* Requested Path Badge using ios-glass-clear */}
          <motion.div variants={itemVariants} className="mb-6">
            <div
              className="ios-glass-clear inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono max-w-full truncate"
              style={{ color: '#fff' }}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-white/60">GET</span>
              <span className="text-white truncate font-medium">{location.pathname}</span>
              <span className="text-red-400 font-medium">-&gt; NOT_FOUND</span>
            </div>
          </motion.div>

          {/* Title & Description */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Page does not exist
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              The path you requested could not be resolved or may have been relocated in your workspace.
            </p>
          </motion.div>

          {/* Action Buttons using Liquid Glass */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            {/* Prominent Tinted Liquid Glass for Primary Action */}
            <Link
              to={homeDestination}
              className="ios-glass-prominent inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-transform active:scale-[0.98]"
              style={{
                color: '#fff',
                font: '600 14px/20px var(--ios-font, system-ui, sans-serif)',
              }}
            >
              <Home className="w-4 h-4" />
              <span>{user ? 'Return to Dashboard' : 'Return Home'}</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded font-mono">
                H
              </kbd>
            </Link>

            {/* Regular Liquid Glass for Secondary Action */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(homeDestination);
                }
              }}
              className="ios-glass inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-transform active:scale-[0.98]"
              style={{
                color: 'var(--ios-glass-label, #fff)',
                font: '600 14px/20px var(--ios-font, system-ui, sans-serif)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-white/10 text-white/70 rounded font-mono">
                ESC
              </kbd>
            </button>
          </motion.div>

          {/* Fast Route Directory using Liquid Glass */}
          <motion.div variants={itemVariants} className="border-t border-white/10 pt-8 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Direct Routes
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                WORKSPACE SHORTCUTS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="ios-glass p-3.5 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98]"
                    style={{
                      color: 'var(--ios-glass-label, #fff)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/90 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold text-white group-hover:text-white transition-colors"
                          style={{ font: '600 13px/18px var(--ios-font, system-ui, sans-serif)' }}
                        >
                          {item.label}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs font-mono text-zinc-500 relative z-10">
        StudyOS &copy; {new Date().getFullYear()} &middot; Press [ESC] to go back or [H] for home
      </footer>
    </div>
  );
}
