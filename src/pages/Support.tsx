import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';
import './Landing.css'; // Reuse landing page header styles

export default function Support() {
  return (
    <div className="landing-container min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Support | StudyOS</title>
        <meta name="description" content="Get help and support for StudyOS." />
      </Helmet>
      
      <header className="header" style={{ position: 'relative', background: 'transparent' }}>
        <Link to="/" className="logo" aria-label="StudyOS">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <g transform="rotate(-30 12 12)">
              <circle cx="7.3" cy="3.2" r="1.45" />
              <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
              <circle cx="16.7" cy="20.8" r="1.45" />
            </g>
          </svg>
          Study<span className="logo-suffix">OS</span>
        </Link>
        <nav id="site-nav" className="hidden md:flex">
          <Link to="/faq">FAQ</Link>
          <Link to="/support">Support</Link>
        </nav>
        <Link to="/login" className="btn btn-solid header-cta">
          Login
        </Link>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">How can we help?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our support team is here to assist you with any questions or issues you might have while using StudyOS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Email Support Card */}
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-3">Email Support</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              Send us an email anytime. We typically respond within 24-48 hours on business days.
            </p>
            <a 
              href="mailto:atudyos.notification@gmail.com" 
              className="bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity w-full"
            >
              atudyos.notification@gmail.com
            </a>
          </div>

          {/* FAQ Card */}
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-3">Check the FAQ</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              Find quick answers to the most common questions about features, pricing, and accounts.
            </p>
            <Link 
              to="/faq" 
              className="bg-muted text-foreground font-medium py-3 px-6 rounded-lg hover:bg-muted/80 transition-colors w-full border border-border"
            >
              Browse FAQs
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
