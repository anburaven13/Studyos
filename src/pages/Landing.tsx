import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/layout/Footer';
import { Sparkles, Brain, BookOpen, Target, Activity, ArrowRight, Zap, Shield, Smartphone } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-50 overflow-x-hidden font-sans selection:bg-purple-500/30">
      <Helmet>
        <title>StudyOS | The Next-Gen AI Study Planner</title>
        <meta name="description" content="StudyOS is the ultimate AI student planner. Train AI tutors on your notes, generate flashcards, and organize your academic life." />
      </Helmet>
      
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* The original beautiful network background */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
          <img src="/hero-bg.webp" alt="" className="w-full h-full object-cover" />
        </div>
        
        {/* Ambient glows */}
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800A_1px,transparent_1px),linear-gradient(to_bottom,#8080800A_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Study<span className="text-white/40">OS</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</Link>
              <Link to="/support" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Support</Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
                Log in
              </Link>
              <Link to="/login" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                Start for Free
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-grow pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 pt-20 flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>StudyOS 2.0 is now live</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] max-w-5xl">
              <span className="block text-slate-200">Crush your exams with</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent pb-2">
                an AI tutor that knows you.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
              Upload your messy notes, PDFs, and deadlines. StudyOS automatically organizes your homework, tracks your weak points, and acts as your personal 24/7 tutor.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                Start Studying Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white text-lg font-medium rounded-full hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center">
                Explore Features
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required • Free forever tier available</p>

            {/* Bento Grid Features */}
            <div id="features" className="w-full max-w-6xl mt-32 pt-16">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Everything you need to succeed.</h2>
                <p className="text-lg text-slate-400">Powerful features designed to drastically cut down your study time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large Card */}
                <div className="md:col-span-2 group relative overflow-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Smart Homework Tracker</h3>
                  <p className="text-slate-400 leading-relaxed max-w-md">
                    Never miss a deadline again. Manage your assignments, tests, and homework with an intelligent AI that automatically plans out your daily study schedule based on your syllabus.
                  </p>
                </div>

                {/* Tall Card */}
                <div className="md:col-span-1 md:row-span-2 group relative overflow-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors flex flex-col">
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Brain className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Context-Aware Tutor</h3>
                  <p className="text-slate-400 leading-relaxed flex-grow">
                    Imagine having a 24/7 tutor that has deep context on every single note, PDF, and class you've ever taken. Ask any question and get perfectly tailored explanations.
                  </p>
                </div>

                {/* Normal Card 1 */}
                <div className="md:col-span-1 group relative overflow-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Note-Taking</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Instantly generate flashcards, summaries, and extract text from photos of your textbook or PDFs.
                  </p>
                </div>

                {/* Normal Card 2 */}
                <div className="md:col-span-1 group relative overflow-hidden bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Knowledge DNA</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Track your revision progress with confidence meters to focus exactly on your weakest subjects.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="w-full max-w-4xl mx-auto mt-32 mb-10">
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden text-center shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] pointer-events-none"></div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight relative z-10">
                  Ready to stop stressing?
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">
                  Join thousands of students who are already using StudyOS to crush their exams and reclaim their free time.
                </p>
                <Link to="/login" className="inline-flex items-center justify-center bg-white text-black font-bold text-lg py-4 px-10 rounded-full hover:bg-slate-200 hover:scale-105 transition-all shadow-xl relative z-10">
                  Create your free account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

          </div>
        </main>
        
        {/* Pass custom className to Footer to remove its default container margins if needed, 
            but standard Footer should fit well if it just has border-t border-white/10 */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-md">
          <Footer />
        </div>
      </div>
    </div>
  );
}
