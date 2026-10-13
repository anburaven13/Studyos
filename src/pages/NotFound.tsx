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
  ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
          navigate(user ? '/app' : '/');
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        navigate(user ? '/app' : '/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, user]);

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

  const homeDestination = user ? '/app' : '/';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <Helmet>
        <title>404 — Page Not Found | StudyOS</title>
        <meta name="description" content="The requested page could not be found." />
      </Helmet>

      {/* Top Bar */}
      <header className="w-full border-b border-zinc-800/80 bg-[#09090b] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to={homeDestination} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
              <Brain className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Study<span className="text-zinc-500">OS</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              STATUS 404
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          className="w-full max-w-xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stark 404 Display */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-block">
              <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-zinc-200 select-none block">
                404
              </span>
            </div>
          </motion.div>

          {/* Requested Path Badge */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 max-w-full truncate">
              <span className="text-zinc-500">GET</span>
              <span className="text-zinc-200 truncate">{location.pathname}</span>
              <span className="text-red-400 font-medium">-&gt; 404 NOT_FOUND</span>
            </div>
          </motion.div>

          {/* Title & Description */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mb-2">
              Page does not exist
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
              The path you requested could not be resolved or may have been relocated in your workspace.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              to={homeDestination}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" />
              {user ? 'Return to Dashboard' : 'Return Home'}
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-zinc-200 text-zinc-700 rounded font-mono">
                H
              </kbd>
            </Link>

            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(homeDestination);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 text-sm font-medium active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 rounded font-mono">
                ESC
              </kbd>
            </button>
          </motion.div>

          {/* Fast Route Directory */}
          <motion.div variants={itemVariants} className="border-t border-zinc-800/80 pt-8 text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Direct Routes
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                WORKSPACE SHORTCUTS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs font-mono text-zinc-600">
        StudyOS &copy; {new Date().getFullYear()} &middot; System Route Resolver
      </footer>
    </div>
  );
}
