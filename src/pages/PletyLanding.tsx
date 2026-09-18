import React, { useState, useEffect, useRef } from 'react';

const FadeInUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
};

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Features', id: 'features' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer text-white" onClick={() => scrollTo('about')}>
          <Logo />
          <span className="text-xl font-bold tracking-tight">Plety</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <button className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/5 transition-colors">
            Get started
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none p-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0 py-0 border-transparent'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-gray-300 hover:text-white text-base font-medium py-2"
            >
              {link.label}
            </button>
          ))}
          <button className="bg-[#1F1F22] text-white text-sm font-medium px-6 py-3 rounded-full border border-white/5 mt-2">
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
};

const DummyLogo = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 text-gray-500 font-bold text-xl px-8 flex-shrink-0">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
    {name}
  </div>
);

const Marquee = () => {
  const brands = ['Springfield', 'Orbitc', 'Cloud', 'Amster', 'Nexus'];
  // Duplicate array 4 times for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="w-full mt-24">
      <p className="text-sm text-gray-500 font-medium mb-8 text-center">Trusted by industry leaders</p>
      <div
        className="overflow-hidden w-full"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="flex w-max animate-marquee">
          {duplicatedBrands.map((brand, i) => (
            <DummyLogo key={i} name={brand} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-10 object-cover min-w-full min-h-full opacity-90"
      >
        <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black -z-10" />

      <FadeInUp>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm mx-auto w-max">
          ✨ Announcing API 2.0
        </div>
      </FadeInUp>

      <FadeInUp delay={100}>
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center max-w-4xl mx-auto px-4">
          The intelligence layer <br className="hidden md:block" />
          for clear <span className="font-serif italic font-normal">decisions.</span>
        </h1>
      </FadeInUp>

      <FadeInUp delay={200}>
        <p className="text-[16px] text-gray-400 max-w-2xl text-center mx-auto mb-10 px-4">
          Our platform integrates seamlessly into your stack to deliver real-time understanding, not just predictions.
        </p>
      </FadeInUp>

      <FadeInUp delay={300}>
        <div className="flex flex-row items-center gap-4">
          <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
            Get started
          </button>
          <button className="bg-[#1F1F22] text-white px-6 py-3 rounded-full text-sm font-medium border border-white/5 hover:bg-[#2A2A2D] transition-colors">
            Learn more
          </button>
        </div>
      </FadeInUp>

      <FadeInUp delay={400}>
        <Marquee />
      </FadeInUp>
    </section>
  );
};

const Feature1 = () => {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <FadeInUp>
          <div>
            <div className="text-yellow-400 text-sm font-medium mb-4">✨ AI chat</div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              Where speed meets intelligent conversation.
            </h2>
            <p className="text-gray-400 text-base mb-8">
              A conversational AI assistant that understands your questions, provides intelligent answers, and helps you get things done fast from casual chats to complex tasks.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              Get started
            </button>
          </div>
        </FadeInUp>

        <FadeInUp delay={200}>
          <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative h-[500px] flex items-end">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 object-cover w-full h-full -z-10"
            >
              <source src="https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20 -z-10" />

            <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-full shadow-2xl">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300 whitespace-nowrap">Create image</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300 whitespace-nowrap">Summarize text</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-300 whitespace-nowrap">Analyze data</span>
              </div>
              <div className="flex items-center bg-black/50 border border-white/5 rounded-xl px-4 py-3">
                <span className="text-gray-400 text-sm flex-1">Ask anything...</span>
                <div className="flex items-center gap-3 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                  <div className="w-px h-4 bg-white/10"></div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};

const Feature2 = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto w-full">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <FadeInUp delay={200}>
          <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative h-[500px] flex items-center justify-center order-2 lg:order-1">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 object-cover w-full h-full -z-10"
            >
              <source src="https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20 -z-10" />

            <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center pl-1 hover:scale-105 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
                <div>
                  <div className="text-white text-sm font-medium">11:06 AM – Chris</div>
                  <div className="flex gap-1 mt-2 items-end h-4">
                    {[4, 8, 12, 16, 12, 8, 14, 10, 6, 4].map((h, i) => (
                      <div key={i} className="w-1 bg-white/40 rounded-full" style={{ height: `${h}px` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                "So the main goal for Q3 is to accelerate our user onboarding flow. We noticed a significant drop-off at step 2, and we need to streamline that process..."
              </p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp order-1 lg:order-2>
          <div className="order-1 lg:order-2">
            <div className="text-green-400 text-sm font-medium mb-4">✨ AI transcription</div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              Turn speech into text with speed and precision.
            </h2>
            <p className="text-gray-400 text-base mb-8">
              Automatically convert speech into accurate, editable text in real time. Perfect for meetings, interviews, voice notes, and more, powered by advanced speech recognition technology.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              Get started
            </button>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "Is my data safe and secure?", a: "Yes, we use industry-standard encryption to protect your data. Your privacy and security are our top priorities." },
    { q: "How accurate is the AI transcription?", a: "Our transcription engine boasts a 99% accuracy rate across multiple accents and languages, utilizing state-of-the-art neural networks." },
    { q: "Can I integrate Plety with my existing tools?", a: "Absolutely. We offer a robust API and native integrations with Slack, Microsoft Teams, Zoom, and Google Workspace." },
    { q: "Do you offer custom enterprise pricing?", a: "Yes, we have custom plans for large teams that include dedicated support, custom SLAs, and advanced administrative controls." },
    { q: "How do I get started?", a: "Simply sign up for a free account, connect your first data source, and start exploring the intelligence layer within minutes." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6 max-w-3xl mx-auto w-full">
      <FadeInUp>
        <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center tracking-tight">We've got answers</h2>
        <div className="border border-white/10 rounded-xl bg-transparent overflow-hidden">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`${idx !== faqs.length - 1 ? 'border-b border-white/10' : ''}`}>
              <button
                className="w-full text-left py-6 px-6 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="text-base text-white font-medium">{faq.q}</span>
                <span className={`text-white transition-transform duration-300 flex-shrink-0 ${openIndex === idx ? 'rotate-45' : 'rotate-0'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              <div 
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: openIndex === idx ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-400 text-sm pb-6 px-6">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FadeInUp>
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="contact" className="relative z-0 pt-32 pb-10 px-6 border-t border-white/5 w-full">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 object-cover w-full h-full opacity-40 -z-10"
      >
        <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black -z-10" />

      <FadeInUp>
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-5xl font-semibold mb-8">
            Ready to automate <span className="font-serif italic font-normal">everything?</span>
          </h2>
          <div className="flex flex-row items-center justify-center gap-4">
            <button className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
              Get started
            </button>
            <button className="bg-[#1F1F22] text-white px-6 py-3 rounded-full text-sm font-medium border border-white/5 hover:bg-[#2A2A2D] transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </FadeInUp>

      <FadeInUp delay={200}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
            <div className="col-span-1">
              <div className="flex items-center gap-2 text-white mb-4">
                <Logo />
                <span className="text-xl font-bold tracking-tight">Plety</span>
              </div>
              <p className="text-sm text-gray-400">Speed, scale, and smarts — deployed.</p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-white font-medium mb-1">Product</span>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Changelog</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-white font-medium mb-1">Legal</span>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">404</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-white font-medium mb-1">Connect</span>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">YouTube</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Twitter / X</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-8">
            <p>
              © 2026 Plety. All rights reserved <span className="mx-1">•</span> by <span className="text-gray-300">Re-text</span> <span className="mx-1">•</span> Made in <span className="text-gray-300">Gemini</span>
            </p>
          </div>
        </div>
      </FadeInUp>
    </footer>
  );
};

export default function PletyLanding() {
  return (
    <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden selection:bg-white/20 selection:text-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          html { scroll-behavior: smooth; }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          /* Hide scrollbar for chips container */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `
      }} />
      <Navbar />
      <main>
        <Hero />
        <Feature1 />
        <Feature2 />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
