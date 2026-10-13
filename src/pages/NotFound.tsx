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
  Wifi, 
  Battery, 
  Compass,
  Sparkles
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
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const quickLinks = [
    { label: 'AI Tutor', path: '/app/tutor', icon: Bot },
    { label: 'Notes', path: '/app/notes', icon: BookOpen },
    { label: 'Planner', path: '/app/planner', icon: Calendar },
    { label: 'Exams', path: '/app/exams', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-white/20">
      <Helmet>
        <title>404 — Page Not Found | StudyOS</title>
        <meta name="description" content="The requested page could not be found." />
      </Helmet>

      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 mb-4">
        <Link to={homeDestination} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
            <Brain className="w-4 h-4 text-zinc-200" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Study<span className="text-zinc-500">OS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            iOS 26 Liquid Glass
          </span>
        </div>
      </header>

      {/* iOS 26 Phone Surface Container (402px wide) */}
      <motion.div
        className="w-full max-w-[402px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="ios-surface dark w-full rounded-[48px] border-[5px] border-zinc-800/90 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden flex flex-col justify-between p-6 min-h-[680px]">
          {/* Vibrant colorful gradient backdrop for liquid glass refraction */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Colorful fluid ambient gradients */}
            <div className="absolute -top-20 -left-16 w-72 h-72 bg-gradient-to-br from-rose-500/80 via-pink-600/70 to-indigo-600/80 rounded-full blur-[60px]" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-bl from-amber-400/80 via-orange-500/80 to-purple-600/70 rounded-full blur-[65px]" />
            <div className="absolute -bottom-20 left-4 w-72 h-72 bg-gradient-to-tr from-blue-600/80 via-cyan-400/70 to-emerald-500/70 rounded-full blur-[60px]" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </div>

          {/* iOS Status Bar */}
          <div className="flex items-center justify-between pt-1 px-3 text-xs text-white/90 font-medium">
            <span className="tracking-tight">9:41</span>
            {/* Dynamic Island */}
            <div className="w-24 h-5 bg-black/90 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Main Error Content */}
          <div className="my-auto py-8 text-center flex flex-col items-center">
            {/* Clear Liquid Glass Route Indicator */}
            <div
              className="ios-glass-clear inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 max-w-[320px] truncate"
              style={{
                color: '#fff',
                font: '600 12px/16px var(--ios-font, system-ui, sans-serif)',
              }}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="truncate">GET {location.pathname}</span>
              <span className="text-white/60 font-mono text-[10px]">&middot; 404</span>
            </div>

            {/* Stark Error Typography */}
            <h1
              className="text-7xl sm:text-8xl font-black tracking-tighter text-white drop-shadow-md select-none"
              style={{ font: '800 80px/88px var(--ios-font, system-ui, sans-serif)' }}
            >
              404
            </h1>

            <p className="text-base font-semibold text-white mt-2">
              Page Not Found
            </p>

            <p className="text-xs text-white/75 mt-1 max-w-[260px] leading-relaxed">
              This route does not exist in StudyOS or has been reorganized.
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-col gap-2.5 w-full pt-2">
            {/* Prominent Tinted Liquid Glass for Primary CTA */}
            <Link
              to={homeDestination}
              className="ios-glass-prominent flex items-center justify-center gap-2 w-full py-3.5 rounded-[22px] transition-transform active:scale-[0.98]"
              style={{
                font: '600 15px/20px var(--ios-font, system-ui, sans-serif)',
                color: '#fff',
              }}
            >
              <Home className="w-4 h-4" />
              <span>{user ? 'Return to Dashboard' : 'Return Home'}</span>
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
              className="ios-glass flex items-center justify-center gap-2 w-full py-3 rounded-[20px] transition-transform active:scale-[0.98]"
              style={{
                color: 'var(--ios-glass-label, #fff)',
                font: '600 14px/18px var(--ios-font, system-ui, sans-serif)',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
              <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono text-white/70">
                ESC
              </kbd>
            </button>

            {/* Quick Destination Tiles using Regular Liquid Glass */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="ios-glass p-2.5 rounded-[18px] flex items-center gap-2 transition-transform active:scale-95"
                    style={{
                      color: 'var(--ios-glass-label, #fff)',
                      font: '500 12px/16px var(--ios-font, system-ui, sans-serif)',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 text-white/90 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-3" />
          </div>
        </div>
      </motion.div>

      {/* Footer info */}
      <footer className="mt-6 text-center text-xs font-mono text-zinc-500">
        StudyOS &copy; {new Date().getFullYear()} &middot; Press [ESC] to go back or [H] for home
      </footer>
    </div>
  );
}
