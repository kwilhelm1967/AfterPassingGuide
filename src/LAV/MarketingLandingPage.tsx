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
  Shield,
  Lock,
  Zap,
  Clock,
  Users,
  Download,
  CheckCircle,
  UserCheck,
  Share2,
  ChevronDown,
  ChevronRight,
  Folder,
  Phone,
  Archive,
  Tag,
  RefreshCw,
} from 'lucide-react';

interface MarketingLandingPageProps {
  onGetStarted?: () => void;
  /** Opens the Local Legacy Vault purchase flow (same as in the LLV app). Used for "Get Local Legacy Vault" only. */
  onPurchaseLocalLegacyVault?: () => void;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Heart className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Personalized Task Plans',
    description: 'A timeline-based checklist from the first 48 hours through long-term tasks.',
  },
  {
    icon: <FileText className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Secure Document Management',
    description: 'Upload, organize, and store documents in one encrypted place.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Ready-to-Use Templates',
    description: 'Pre-written scripts and templates for calls and written notifications.',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Executor Tools and Checklists',
    description: 'Executor checklist and contact workbook to track progress.',
  },
  {
    icon: <UserCheck className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Contact & Beneficiary Tracking',
    description: 'Track who to notify, beneficiaries, and key contacts in one workbook.',
  },
  {
    icon: <Share2 className="w-6 h-6 feature-card-icon" strokeWidth={1.75} />,
    title: 'Export & Share',
    description: 'Export your plan and documents to PDF for family or professionals.',
  },
];

/* Value differentiation only — no privacy/trust claims (those stay in Privacy and Security First) */
const VALUE_PROPOSITIONS = [
  { icon: <Clock className="w-4 h-4" strokeWidth={1.75} />, text: 'Timeline-based guidance from the first 48 hours through long-term settlement' },
  { icon: <Users className="w-4 h-4" strokeWidth={1.75} />, text: 'Designed specifically for executors and family members' },
  { icon: <FileText className="w-4 h-4" strokeWidth={1.75} />, text: 'US-specific administrative guidance for common agencies and institutions' },
  { icon: <ClipboardCheck className="w-4 h-4" strokeWidth={1.75} />, text: 'Flexible checklist model — mark items done or not applicable' },
];

/* Order: left col then right col (grid flows row-by-row: 0,1 = row1, 2,3 = row2, 4,5 = row3) */
const SECURITY_FEATURES = [
  '100% local storage. Data never leaves your device.',
  'Fully encrypted at rest on your device.',
  'Works completely offline.',
  'Zero tracking. No analytics. No telemetry.',
  'Device-bound encryption.',
  'No accounts. No cloud sync.',
];

const LANDING_FAQS: { q: string; a: string }[] = [
  { q: 'What is the AfterPassing Guide?', a: 'The AfterPassing Guide is an organizational tool that helps families manage paperwork, notifications, and administrative tasks after a loss. It provides checklists, document organization, templates, and executor tools in one place.' },
  { q: 'Is this legal or financial advice?', a: 'No. The AfterPassing Guide provides administrative and organizational guidance only. It does not replace attorneys, accountants, or medical professionals.' },
  { q: 'Who is this for?', a: 'Anyone helping manage affairs after a death, including spouses, adult children, executors, trustees, and caregivers.' },
  { q: 'Is my data stored online?', a: 'No. All data is stored locally on your device unless you choose to export it.' },
  { q: 'Does the app require internet access?', a: 'No. The app works offline. Internet access is only needed if you open external resource links.' },
  { q: 'Can I use this without a Local Legacy Vault?', a: 'Yes. The AfterPassing Guide works on its own. If you use a Local Legacy Vault, certain data can appear automatically, but it is not required.' },
  { q: 'Can multiple people use the same data?', a: 'The app is designed for one device at a time. You can share information by exporting the Estate Binder PDF.' },
  { q: 'What is the Estate Binder?', a: 'The Estate Binder is a downloadable PDF summary that includes selected checklist items, notes, documents list, and contacts for professional handoff.' },
  { q: 'Can I edit templates before using them?', a: 'Yes. Templates are meant to be adapted. You can copy, edit, and personalize them.' },
  { q: 'Can I back up my data?', a: 'Yes. You can export a full backup file and restore it later if needed.' },
  { q: 'Can I delete everything and start over?', a: 'Yes. The Reset Data option clears AfterPassing Guide data on this device.' },
];

/** Local Legacy Vault purchase URL — same as in the Local Legacy Vault app. */
const LLV_PURCHASE_URL = 'https://locallegacyvault.com/pricing.html#pricing';

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({ onPurchaseLocalLegacyVault }) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  /** Scroll to pricing; do not enter app until after purchase. */
  const handleGetStarted = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  /** Open Local Legacy Vault purchase (same process as in LLV app). */
  const handlePurchaseLocalLegacyVault = () => {
    if (onPurchaseLocalLegacyVault) {
      onPurchaseLocalLegacyVault();
      return;
    }
    const url = (import.meta as any).env?.VITE_LLV_PURCHASE_URL || LLV_PURCHASE_URL;
    const api = (window as any).electronAPI;
    if (api?.openExternal) {
      api.openExternal(url).then((ok: boolean) => {
        if (!ok) window.open(url, '_blank', 'noopener,noreferrer');
      }).catch(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-vault-dark relative overflow-hidden">

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="border-b border-border-subtle bg-vault-dark/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <Heart className="w-5 h-5 text-text-secondary" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-base font-bold text-text-primary">AfterPassing Guide</div>
                <div className="text-xs text-text-muted">Administrative guidance</div>
              </div>
            </div>
            <button
              onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              View FAQs
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-8 py-12 relative">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight text-text-primary">
              Administrative Guidance
              <br />
              <span className="text-text-secondary font-semibold">When You Need It Most</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary mb-4 max-w-3xl mx-auto leading-relaxed">
              A comprehensive organizational tool for families handling paperwork, notifications, and administrative tasks after a loss.
            </p>
            
            <p className="text-sm text-text-muted mb-10 max-w-2xl mx-auto">
              Get personalized checklists, secure document management, and ready-to-use templates—all stored securely on your device.
            </p>

            {/* Single CTA — one path, no hesitation */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleGetStarted}
                className="px-10 py-4 bg-accent-gold text-vault-dark font-medium text-base rounded-lg hover:bg-accent-gold-hover transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg border border-border-subtle">
                <Lock className="w-4 h-4 text-text-secondary" strokeWidth={1.75} />
                <span>100% Local</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg border border-border-subtle">
                <Shield className="w-4 h-4 text-text-secondary" strokeWidth={1.75} />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card-bg/50 rounded-lg border border-border-subtle">
                <Zap className="w-4 h-4 text-text-secondary" strokeWidth={1.75} />
                <span>Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section — 6-card grid, restrained copy */}
        <section id="features" className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold mb-3 text-text-primary">
              Everything You Need in One Place
            </h2>
            <p className="text-base text-text-secondary max-w-2xl mx-auto">
              Core tools for organizing tasks, documents, and contacts after a loss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {FEATURES.map((feature, index) => (
              <button
                key={index}
                type="button"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={handleGetStarted}
                className={`w-full text-left rounded-xl p-6 border transition-all duration-200 cursor-pointer flex flex-col min-h-[180px] bg-card-bg/75 border-border-subtle hover:border-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:ring-offset-2 focus:ring-offset-vault-dark ${
                  hoveredFeature === index ? 'border-text-muted/50' : ''
                }`}
              >
                <div className={`mb-3 transition-colors duration-200 ${hoveredFeature === index ? 'text-accent-gold' : 'text-text-secondary'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-text-primary leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mt-auto">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Privacy and Security First — trust anchor only; own section, checkmark icons */}
        <section id="security" className="max-w-[1200px] mx-auto px-8 py-12 scroll-mt-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-text-muted flex-shrink-0" strokeWidth={1.75} />
            <h2 className="text-2xl font-semibold text-text-primary">
              Privacy and Security First
            </h2>
          </div>
          <ul className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-x-12 sm:gap-y-2 w-full max-w-4xl mx-auto">
            {SECURITY_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 py-1">
                <CheckCircle className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-text-secondary leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Thin divider + new chapter: Why Choose — value differentiation only (no privacy repeat) */}
        <div className="border-t border-border-subtle/60" />
        <section className="max-w-[1200px] mx-auto px-8 py-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary text-center">
            Why Choose AfterPassing Guide?
          </h2>
          <ul className="flex flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5 max-w-2xl mx-auto">
            {VALUE_PROPOSITIONS.map((prop, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-text-muted flex-shrink-0 mt-0.5" aria-hidden>
                  {prop.icon}
                </span>
                <span className="text-sm md:text-base text-text-secondary leading-relaxed">
                  {prop.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing — simple, transparent, one-time */}
        <section id="pricing" className="max-w-[1200px] mx-auto px-8 py-12 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-[34px] font-semibold text-text-primary mb-2">
              Simple, transparent pricing.
            </h2>
            <p className="text-sm text-text-muted">
              One-time purchase. No subscriptions. No tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Left – AfterPassing Guide (neutral border; secondary CTA) */}
            <div className="bg-card-bg/80 rounded-xl border border-border-subtle p-6 flex flex-col flex-1 min-h-0">
              <h3 className="text-lg font-semibold text-text-primary">AfterPassing Guide</h3>
              <p className="text-sm text-text-muted mt-1">Administrative guidance for the critical weeks after a loss.</p>
              <p className="mt-5 text-2xl font-semibold text-text-primary">$49 one-time</p>
              <div className="mt-5 flex-1 flex flex-col min-h-0">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Includes:</p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Personalized, timeline-based executor checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>First 48 hours through long-term administrative guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Folder className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Secure document organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Key contacts and beneficiary tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Ready-to-use call scripts and letter templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Download className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Exportable estate binder (PDF)</span>
                  </li>
                </ul>
                <p className="text-[11px] text-text-muted/70 mt-4">
                  100% local • Encrypted • Offline • No tracking
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-border-subtle flex-shrink-0">
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 px-4 border-2 border-border-subtle text-text-primary font-medium rounded-lg hover:bg-card-bg-hover transition-colors"
                >
                  Buy AfterPassing Guide
                </button>
                <p className="text-[11px] text-text-muted/80 mt-2 text-center">
                  One-time purchase. No subscription.
                </p>
              </div>
            </div>

            {/* Right – Local Legacy Vault (primary: gold outline, primary CTA) */}
            <div className="bg-card-bg/80 rounded-xl border-2 border-accent-gold/40 p-7 flex flex-col flex-1 min-h-0 relative">
              <div className="absolute top-4 right-4 text-[10px] font-medium text-accent-gold bg-accent-gold/10 px-2 py-1 rounded">
                Includes AfterPassing Guide ($49 value)
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Local Legacy Vault</h3>
              <p className="text-sm text-text-muted mt-1">Your complete personal and family organization system — fully local.</p>
              <p className="mt-5 text-2xl font-semibold text-text-primary">$129 one-time</p>
              <div className="mt-5 flex-1 flex flex-col min-h-0">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Includes everything in AfterPassing Guide, plus:</p>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <Archive className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Long-term legacy and estate organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Secure vault for life, financial, and personal records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Family-ready structure for future access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Tag className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Advanced document categorization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-text-muted/70 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <span>Ongoing personal organization beyond after-passing needs</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-5 border-t border-border-subtle flex-shrink-0">
                <button
                  onClick={handlePurchaseLocalLegacyVault}
                  className="w-full py-3 px-4 bg-accent-gold text-vault-dark font-medium rounded-lg hover:bg-accent-gold-hover transition-colors"
                >
                  Get Local Legacy Vault
                </button>
                <p className="text-[11px] text-text-muted/80 mt-2 text-center">
                  Best value for families. One-time purchase.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-text-muted/60 mt-8 max-w-xl mx-auto">
            All data is stored locally on your device. No subscriptions. No cloud storage. No tracking.
          </p>
        </section>

        {/* FAQs */}
        <section id="faqs" className="max-w-[1200px] mx-auto px-8 py-12 scroll-mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold mb-3 text-text-primary">FAQs</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Common questions about the AfterPassing Guide</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-2">
            {LANDING_FAQS.map((faq, index) => (
              <div key={index} className="border border-border-subtle rounded-xl overflow-hidden bg-card-bg/50">
                <button
                  type="button"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-card-bg-hover/50 transition-colors"
                >
                  <span className="text-text-primary font-medium">{faq.q}</span>
                  {expandedFAQ === index ? (
                    <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA — decisive, calm, final */}
        <section id="cta" className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="bg-card-bg/80 rounded-xl py-9 px-8 md:py-10 md:px-10 border border-border-subtle text-center">
            <h2 className="text-2xl font-semibold text-text-primary mb-3">
              Ready to Get Organized?
            </h2>
            <p className="text-lg text-text-secondary mb-6 max-w-2xl mx-auto">
              Administrative guidance, stored securely on your device.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-accent-gold text-vault-dark font-medium text-base rounded-lg hover:bg-accent-gold-hover transition-colors mb-4"
            >
              Get Started
            </button>
            <p className="text-[11px] text-text-muted/60 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              <span>All data stored locally · No cloud · No tracking</span>
            </p>
          </div>
        </section>

        {/* Tagline + Footer — same structure and classes as leg/terms.html, privacy.html, eula.html, etc. */}
        <p className="footer-tagline">Built for privacy. Designed for real life.</p>
        <footer className="page-footer">
          <div className="footer-inner">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="name">AfterPassing Guide</div>
                <div className="tagline">Administrative guidance. No legal or financial advice.</div>
                <p>A local, offline tool for organizing administrative tasks after a loss.</p>
                <p>Part of the Local Legacy Vault ecosystem.</p>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="/leg/security.html">Security and Privacy</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#faqs">FAQs</a></li>
                  <li><a href="#pricing">Local Legacy Vault</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#user-guide">User Guide</a></li>
                  <li><a href="#official-resources">Official Resources (US)</a></li>
                  <li><a href="#support">Contact Support</a></li>
                </ul>
              </div>
              <div className="footer-col footer-trust">
                <h4>Trust and Privacy</h4>
                <ul>
                  <li>100% Local Storage</li>
                  <li>Fully Encrypted</li>
                  <li>Offline by Design</li>
                  <li>No Tracking</li>
                  <li>No accounts. No cloud sync.</li>
                </ul>
              </div>
            </div>
            <p className="footer-legal">Administrative guidance only. This application does not provide legal, financial, tax, or medical advice. Guidance is based on common U.S. processes and may vary by state. Consult qualified professionals for decisions.</p>
            <div className="footer-bottom">
              <span>© 2026 AfterPassing Guide <span style={{ opacity: 0.85 }}>· Built for offline use</span></span>
              <span className="footer-bottom-links">
                <a href="/leg/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <a href="/leg/terms.html" target="_blank" rel="noopener noreferrer">Terms</a>
                <a href="/leg/disclaimer.html" target="_blank" rel="noopener noreferrer">Disclaimer</a>
                <a href="/leg/eula.html" target="_blank" rel="noopener noreferrer">EULA</a>
                <a href="/leg/refund.html" target="_blank" rel="noopener noreferrer">Refund</a>
                <a href="/leg/security.html" target="_blank" rel="noopener noreferrer">Security Overview</a>
              </span>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
};
