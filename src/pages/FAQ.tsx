import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './Landing.css'; // Reuse landing page header styles

const faqs = [
  {
    question: "Is StudyOS free to use?",
    answer: "Yes! You can sign up and start using StudyOS for free. We offer a generous free tier that allows you to manage your homework and try out our AI tutor."
  },
  {
    question: "How does the AI Note-Taker work?",
    answer: "You can upload your PDFs, paste text, or even snap a photo of your textbook. Our AI instantly reads the content, summarizes it, and can automatically generate flashcards and quizzes for you to study."
  },
  {
    question: "Can I use StudyOS on my phone?",
    answer: "Absolutely! StudyOS is designed to work perfectly on your phone's browser, and we also offer a dedicated mobile app experience so you can study on the go."
  },
  {
    question: "Is my data secure?",
    answer: "We take your privacy very seriously. Your notes, files, and personal data are encrypted and securely stored. We never sell your data to third parties."
  },
  {
    question: "What is 'Knowledge DNA'?",
    answer: "Knowledge DNA is our unique analytics system. As you study and take quizzes, StudyOS tracks which topics you are struggling with and builds a visual 'DNA' profile. This allows the AI to automatically schedule review sessions focused exactly on your weakest subjects."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="dark landing-container min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>FAQ | StudyOS</title>
        <meta name="description" content="Frequently Asked Questions about StudyOS - The All-in-One AI Study Planner." />
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

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">Everything you need to know about StudyOS.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-lg hover:bg-muted/30 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2 text-muted-foreground leading-relaxed border-t border-border/50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Link to="/support" className="btn btn-solid">
            Contact Support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
