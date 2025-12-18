/**
 * Product Landing Page - In-App Welcome Screen
 * 
 * Clean, focused welcome screen for users opening the application.
 * Tight, professional design with clear value proposition.
 */

import React from 'react';
import { 
  Heart, 
  FileText, 
  MessageSquare, 
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Heart className="w-6 h-6" strokeWidth={1.75} />,
    title: 'Personalized Task Plan',
    description: 'Timeline-based guidance from first 48 hours to long-term tasks.',
  },
  {
    icon: <FileText className="w-6 h-6" strokeWidth={1.75} />,
    title: 'Document Management',
    description: 'Upload and organize important documents securely.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" strokeWidth={1.75} />,
    title: 'Script Templates',
    description: 'Ready-to-use templates for difficult conversations.',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" strokeWidth={1.75} />,
    title: 'Executor Tools',
    description: 'Comprehensive checklists and contact tracking.',
  },
];

const BENEFITS = [
  'Fully local — your data stays on your device',
  'Works completely offline',
  'Encrypted local storage',
  'Zero tracking or data collection',
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="h-screen bg-vault-dark flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-4xl w-full h-full flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-8 flex-shrink-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-gold mb-4">
            <Heart className="w-8 h-8 text-vault-dark" strokeWidth={1.75} />
          </div>
          
          <h1 className="text-4xl font-semibold text-text-primary mb-3">
            Local Aftercare Vault
          </h1>
          
          <p className="text-base text-text-secondary mb-1 max-w-xl mx-auto">
            Administrative guidance for those navigating loss
          </p>
          
          <p className="text-xs text-text-muted max-w-lg mx-auto">
            This application provides administrative guidance only. It does not provide legal, financial, or medical advice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-3 mb-6 flex-1 overflow-hidden min-h-0">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="bg-card-bg rounded-lg p-4 border border-border-subtle hover:bg-card-bg-hover transition-colors overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-accent-gold mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="text-sm font-medium text-text-primary mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security & CTA */}
        <div className="flex-shrink-0 space-y-4">
          {/* Security */}
          <div className="bg-card-bg rounded-lg p-4 border border-border-subtle">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-accent-gold" strokeWidth={1.75} />
              <h3 className="text-sm font-medium text-text-primary">Privacy & Security</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="text-xs text-text-secondary">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onGetStarted}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onGetStarted();
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent-gold hover:bg-accent-gold-hover text-vault-dark font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-vault-dark"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            
            <p className="mt-3 text-xs text-text-muted flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              Your data is stored locally and never leaves your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
