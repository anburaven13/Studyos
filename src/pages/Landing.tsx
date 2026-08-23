import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  useEffect(() => {
    // Animation fallback logic
    let frame1: number, frame2: number;
    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const appears = document.querySelectorAll('.appear');
        let isRunning = false;
        appears.forEach(el => {
          const anims = el.getAnimations();
          if (anims.some(a => a.playState === 'running' || a.playState === 'finished')) {
            isRunning = true;
          }
        });
        if (!isRunning) {
          appears.forEach(el => el.classList.add('is-in'));
          document.querySelector('.hero-photo')?.classList.add('is-in');
        }
      });
    });

    const handleAnimEnd = (e: Event) => {
      (e.target as HTMLElement).classList.add('is-in');
    };
    
    const elements = document.querySelectorAll('.appear, .hero-photo, .badge-star, .headline-line em');
    elements.forEach(el => el.addEventListener('animationend', handleAnimEnd, { once: true }));

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      elements.forEach(el => el.removeEventListener('animationend', handleAnimEnd));
    };
  }, []);

  const toggleMenu = () => {
    document.body.classList.toggle('menu-open');
    const burger = document.querySelector('.burger-btn');
    const isExpanded = burger?.getAttribute('aria-expanded') === 'true';
    burger?.setAttribute('aria-expanded', String(!isExpanded));
  };

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    document.querySelector('.burger-btn')?.setAttribute('aria-expanded', 'false');
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    const handleResize = () => {
      if (window.innerWidth >= 901) closeMenu();
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      closeMenu();
    };
  }, []);

  // Use a placeholder for the hero background until the user adds their Gemini image
  return (
    <div className="landing-container">
      <div className="grain"></div>
      <div className="hero-photo">
        <img src="/hero-bg.png" alt="StudyOS Hero" className="hero-bg-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
      <div className="page">
        <div className="menu-backdrop" onClick={closeMenu}></div>
        
        <header className="header">
          <Link to="/" className="logo appear appear--scale" aria-label="StudyOS">
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

          <nav id="site-nav" aria-label="Primary">
            <a href="#benefits" className="appear appear--scale" onClick={closeMenu}>Benefits</a>
            <a href="#how-it-works" className="appear appear--soft" onClick={closeMenu}>How It Works</a>
            <a href="#faqs" className="appear appear--scale" onClick={closeMenu}>FAQs</a>
            <a href="#pricing" className="appear appear--soft" onClick={closeMenu}>Pricing</a>
          </nav>

          <Link to="/login" className="btn btn-solid header-cta appear appear--scale">
            Start for Free
          </Link>

          <button className="burger-btn" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </header>

        <main className="hero" id="top">
          <div className="hero-copy">
            <div className="badge appear appear--pop">
              <svg viewBox="0 0 24 24" fill="white" className="badge-star">
                <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z"/>
              </svg>
              Operational AI Study Infrastructure
            </div>

            <h1>
              <span className="headline-line appear appear--mask">Train <em>AI tutors</em> on your</span>
              <span className="headline-line appear appear--mask">study notes in minutes.</span>
            </h1>

            <p className="lede appear appear--soft">
              Deploy adaptive AI tutors that learn, analyze, and scale your study workflow across all subjects.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-solid appear appear--btn">
                Start for Free
              </Link>
              <a href="#demo" className="btn btn-ghost hero-ghost appear appear--side">
                See it in action
              </a>
            </div>
          </div>
        </main>

        <footer className="stats">
          <div className="stat appear appear--stat">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#left-pill)" />
              <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#right-pill)" />
              <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
              <defs>
                <linearGradient id="left-pill" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62" />
                </linearGradient>
                <linearGradient id="right-pill" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.62" />
                </linearGradient>
              </defs>
            </svg>
            4.2M+ study notes analyzed
          </div>

          <div className="stat appear appear--stat">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
              <path d="M12 7.1v7.4 M8.15 12.35L12 16.2l3.85-3.85" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            92% reduction in study time
          </div>

          <div className="stat appear appear--stat">
            <svg viewBox="0 0 40 22" className="stat-icon-wide" width="38" height="21">
              <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
              <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
              <circle cx="9.3" cy="11.5" r="0.7" fill="#1a1a1a" />
              <circle cx="11.1" cy="11.5" r="0.7" fill="#1a1a1a" />
              <polygon points="6,9 7,7 9,9" fill="#f4f4f4" />
              <polygon points="14,9 13,7 11,9" fill="#f4f4f4" />
              
              <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
              <circle cx="18.5" cy="10" r="1.7" fill="#111" />
              <circle cx="21.9" cy="10" r="1.7" fill="#111" />
              <ellipse cx="20.2" cy="12" rx="1" ry="0.5" fill="#111" />
              <path d="M18 14 Q20.2 16 22.4 14" stroke="#111" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              
              <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
              <text x="30.2" y="15.1" fill="white" fontSize="12.5" fontWeight="700" fontFamily="Inter" textAnchor="middle">e</text>
            </svg>
            180+ student teams onboarded
          </div>
        </footer>
      </div>
    </div>
  );
}
