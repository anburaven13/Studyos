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


      </div>
    </div>
  );
}
