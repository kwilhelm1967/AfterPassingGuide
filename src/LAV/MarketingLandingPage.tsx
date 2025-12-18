/**
 * Marketing Landing Page - Premium Sales-Focused Website
 * 
 * Exceptional marketing landing page with vibrant gradients and dynamic animations.
 * Designed to convert and sell - matching LPV/LLV excellence.
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  FileText, 
  MessageSquare, 
  ClipboardCheck,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Clock,
  Users,
  Download,
  Star,
  Sparkles,
  Award,
  CheckCircle,
} from 'lucide-react';

interface MarketingLandingPageProps {
  onGetStarted?: () => void;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Heart className="w-7 h-7" strokeWidth={1.75} />,
    title: 'Personalized Task Plans',
    description: 'Get a customized checklist organized by timeline—from the critical first 48 hours to long-term administrative tasks.',
    benefit: 'Save 20+ hours of research',
  },
  {
    icon: <FileText className="w-7 h-7" strokeWidth={1.75} />,
    title: 'Secure Document Management',
    description: 'Upload, organize, and securely store all important documents in one encrypted location.',
    benefit: 'Never lose track of paperwork',
  },
  {
    icon: <MessageSquare className="w-7 h-7" strokeWidth={1.75} />,
    title: 'Ready-to-Use Templates',
    description: 'Pre-written phone scripts, letters, and email templates for difficult conversations.',
    benefit: 'Know exactly what to say',
  },
  {
    icon: <ClipboardCheck className="w-7 h-7" strokeWidth={1.75} />,
    title: 'Executor Tools and Checklists',
    description: 'Comprehensive executor checklist and contact workbook to track progress.',
    benefit: 'Stay organized and maintain records',
  },
];

const VALUE_PROPOSITIONS = [
  { icon: <Zap className="w-5 h-5" strokeWidth={1.75} />, text: 'Save 50+ hours of research', highlight: true },
  { icon: <Users className="w-5 h-5" strokeWidth={1.75} />, text: 'Designed for executors and family members', highlight: false },
  { icon: <FileText className="w-5 h-5" strokeWidth={1.75} />, text: 'US-specific guidance for Social Security, VA, and more', highlight: false },
  { icon: <Clock className="w-5 h-5" strokeWidth={1.75} />, text: 'Timeline-based from first 48 hours to long-term', highlight: false },
];

const SECURITY_FEATURES = [
  '100% local storage — your data never leaves your device',
  'Fully encrypted — all sensitive information is protected',
  'Works completely offline — no internet required',
  'Zero tracking — no analytics, no telemetry',
  'Device-bound security — your data stays with you',
];

const STATS = [
  { value: '50+', label: 'Hours Saved', icon: <Clock className="w-5 h-5" /> },
  { value: '100+', label: 'Tasks', icon: <ClipboardCheck className="w-5 h-5" /> },
  { value: '25+', label: 'Templates', icon: <FileText className="w-5 h-5" /> },
];

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({ onGetStarted }) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-vault-dark to-slate-900 relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(201, 174, 102, 0.15) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(201,174,102,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="border-b border-white/10 bg-gradient-to-r from-vault-dark/95 via-vault-dark/98 to-vault-dark/95 backdrop-blur-md sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold to-amber-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform hover:rotate-3">
                <Heart className="w-5 h-5 text-vault-dark" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-base font-bold text-text-primary">Local Aftercare Vault</div>
                <div className="text-xs text-text-muted">Administrative guidance</div>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-accent-gold to-amber-500 hover:from-amber-500 hover:to-accent-gold text-vault-dark font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-accent-gold/50"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-accent-gold/20 to-amber-500/20 rounded-full mb-6 border border-accent-gold/40 shadow-lg animate-pulse">
              <Star className="w-4 h-4 text-accent-gold" fill="currentColor" />
              <span className="text-xs font-semibold text-accent-gold">14-Day Free Trial • No Credit Card</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              <span className="bg-gradient-to-r from-text-primary via-accent-gold to-text-primary bg-clip-text text-transparent animate-gradient">
                Administrative Guidance
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-gold via-amber-400 to-accent-gold bg-clip-text text-transparent animate-gradient">
                When You Need It Most
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary mb-4 max-w-3xl mx-auto leading-relaxed">
              A comprehensive organizational tool for families handling paperwork, notifications, and administrative tasks after a loss.
            </p>
            
            <p className="text-sm text-text-muted mb-8 max-w-2xl mx-auto">
              Get personalized checklists, secure document management, and ready-to-use templates—all stored securely on your device.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {STATS.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-card-bg/90 to-card-bg/70 rounded-xl border border-accent-gold/20 backdrop-blur-sm hover:border-accent-gold/50 hover:shadow-lg hover:shadow-accent-gold/20 transition-all transform hover:scale-105 animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-accent-gold">
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-xs text-text-muted font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-accent-gold via-amber-500 to-accent-gold bg-[length:200%_100%] hover:bg-[position:100%_0] text-vault-dark font-bold text-lg rounded-xl transition-all transform hover:scale-110 shadow-2xl hover:shadow-accent-gold/50 animate-pulse hover:animate-none"
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-accent-gold/50 text-accent-gold hover:bg-accent-gold/10 hover:border-accent-gold font-semibold rounded-xl transition-all transform hover:scale-105"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg">
                <Lock className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
                <span>100% Local</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg">
                <Shield className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg">
                <Zap className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
                <span>Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Comprehensive tools designed specifically for executors and families
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`bg-gradient-to-br from-card-bg/90 to-card-bg/70 rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer group backdrop-blur-sm ${
                  hoveredFeature === index
                    ? 'border-accent-gold shadow-2xl shadow-accent-gold/30 transform scale-[1.02] bg-gradient-to-br from-card-bg to-accent-gold/10'
                    : 'border-border-subtle hover:border-accent-gold/50 hover:shadow-xl'
                }`}
              >
                <div className={`text-accent-gold mb-5 transition-all duration-300 ${
                  hoveredFeature === index ? 'transform scale-110 rotate-6' : 'group-hover:scale-105'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${
                  hoveredFeature === index ? 'text-accent-gold' : 'text-text-primary group-hover:text-accent-gold'
                }`}>
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-accent-gold/10 to-amber-500/10 rounded-lg border border-accent-gold/20">
                  <Sparkles className="w-4 h-4 text-accent-gold" strokeWidth={2} />
                  <p className="text-xs font-semibold text-accent-gold">
                    {feature.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Propositions */}
        <section className="bg-gradient-to-br from-card-bg/50 to-vault-dark/50 border-y border-accent-gold/20 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">
                Why Choose Local Aftercare Vault?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {VALUE_PROPOSITIONS.map((prop, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-6 rounded-xl border-2 border-accent-gold/50 bg-gradient-to-br from-accent-gold/20 to-amber-500/20 shadow-lg transition-all hover:shadow-xl hover:border-accent-gold transform hover:scale-105"
                >
                  <div className="text-accent-gold flex-shrink-0 mt-0.5">
                    {prop.icon}
                  </div>
                  <p className="text-base leading-relaxed text-text-primary font-semibold">
                    {prop.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-br from-card-bg/90 to-card-bg/70 rounded-2xl p-10 border-2 border-accent-gold/20 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-gold/20 to-amber-500/20 flex items-center justify-center border border-accent-gold/30">
                <Shield className="w-6 h-6 text-accent-gold" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-text-primary">
                  Privacy and Security First
                </h2>
                <p className="text-base text-text-secondary mt-1">
                  Your sensitive information deserves the highest protection
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {SECURITY_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-vault-dark/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-sm text-text-secondary leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="cta" className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-br from-accent-gold/20 via-amber-500/15 to-accent-gold/20 rounded-3xl p-12 border-2 border-accent-gold/40 text-center shadow-2xl backdrop-blur-sm">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent-gold/30 rounded-full mb-6 border border-accent-gold/50">
              <Award className="w-5 h-5 text-accent-gold" strokeWidth={1.75} />
              <span className="text-sm font-bold text-accent-gold">Trusted by Families Nationwide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-5">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-accent-gold via-amber-500 to-accent-gold bg-[length:200%_100%] hover:bg-[position:100%_0] text-vault-dark font-bold text-xl rounded-xl transition-all transform hover:scale-110 shadow-2xl hover:shadow-accent-gold/50 mb-5"
            >
              <Download className="w-6 h-6" strokeWidth={2.5} />
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" strokeWidth={2.5} />
            </button>
            <p className="text-sm text-text-muted flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" strokeWidth={1.75} />
              <span>All data stored locally • No cloud • No tracking</span>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-accent-gold/20 py-10 bg-vault-dark/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center text-xs text-text-muted leading-relaxed">
              <p className="mb-2">
                <strong className="text-text-secondary font-semibold">Important:</strong> This application provides administrative guidance only. 
                It does not provide legal, financial, or medical advice.
              </p>
              <p className="text-text-secondary">
                For legal, financial, or tax matters, please consult appropriate professionals. 
                Guidance is focused on the United States.
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};
