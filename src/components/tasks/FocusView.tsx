/**
 * Focus View - Calm, minimal landing screen
 * 
 * Shows a small set of stabilizing tasks to prevent overwhelm.
 * Designed for emotional safety and grounding, not task completion.
 * Return experience is calm and non-directive.
 */

import React, { useState, useEffect } from 'react';
import { Heart, Pause, CalendarCheck, Users, Baby, FileSearch } from 'lucide-react';
import { safeGetItem, safeSetItem } from '../../utils/safeStorage';
import { TitleBar } from '../common/TitleBar';

interface FocusTask {
  id: string;
  title: string;
  supportingText: string;
  icon: React.ReactNode;
}

interface FocusViewProps {
  onViewFullChecklist: () => void;
}

type UserState = 'first_visit' | 'incomplete' | 'completed_paused' | 'previewed_week1';

const FOCUS_TASKS: FocusTask[] = [
  {
    id: 'pause',
    title: 'Take a moment',
    supportingText: "Take a breath before doing anything else.",
    icon: <Pause className="w-5 h-5 text-accent-gold" strokeWidth={1.5} />,
  },
  {
    id: 'arrangements',
    title: 'Review funeral or cremation arrangements',
    supportingText: "Check whether funeral or cremation wishes were documented. If final wishes were recorded in a Local Legacy Vault, start there. A funeral home can guide you through the next steps when you're ready.",
    icon: <CalendarCheck className="w-5 h-5 text-accent-gold" strokeWidth={1.5} />,
  },
  {
    id: 'notify',
    title: 'Let close family or friends know',
    supportingText: "Start with one or two people you trust. If trusted contacts are listed in a Local Legacy Vault, use that as a guide.",
    icon: <Users className="w-5 h-5 text-accent-gold" strokeWidth={1.5} />,
  },
  {
    id: 'dependents',
    title: 'Make sure dependents or pets are cared for',
    supportingText: 'Short-term arrangements are fine while things settle.',
    icon: <Baby className="w-5 h-5 text-accent-gold" strokeWidth={1.5} />,
  },
  {
    id: 'documents',
    title: 'Note where important personal documents are located',
    supportingText: "You're only identifying where things are for now. If a Local Legacy Vault exists, documents and locations may already be listed.",
    icon: <FileSearch className="w-5 h-5 text-accent-gold" strokeWidth={1.5} />,
  },
];

const WEEK_1_PREVIEW = [
  {
    id: 'memorial',
    title: 'Consider memorial or service details',
    supportingText: "Simple or postponed.",
  },
  {
    id: 'mail',
    title: 'Review mail and messages',
    supportingText: "Notice what's arriving.",
  },
];

export const FocusView: React.FC<FocusViewProps> = ({ 
  onViewFullChecklist
}) => {
  // Tasks are static - no completion state needed
  const tasks = FOCUS_TASKS;

  // Determine user state on load (safe localStorage - can throw when disabled/private)
  const [userState] = useState<UserState>(() => {
    const hasVisited = safeGetItem('aftercare_has_visited');
    const savedState = safeGetItem('aftercare_user_state');
    const validStates: UserState[] = ['first_visit', 'incomplete', 'completed_paused', 'previewed_week1'];
    
    if (!hasVisited) {
      return 'first_visit';
    }
    return (savedState && validStates.includes(savedState as UserState)) ? savedState as UserState : 'incomplete';
  });

  const [showWelcomeBack, setShowWelcomeBack] = useState(() => {
    const hasVisited = safeGetItem('aftercare_has_visited');
    return hasVisited === 'true';
  });

  const [showLookingAhead, setShowLookingAhead] = useState(false);
  const [welcomeBackVisible, setWelcomeBackVisible] = useState(false);

  // Mark as visited and fade in welcome back
  useEffect(() => {
    if (showWelcomeBack) {
      setTimeout(() => setWelcomeBackVisible(true), 50);
    }
    safeSetItem('aftercare_has_visited', 'true');
  }, [showWelcomeBack]);

  const dismissWelcomeBack = () => {
    setWelcomeBackVisible(false);
    setTimeout(() => setShowWelcomeBack(false), 300);
  };

  const handleReviewWhatsNext = () => {
    setShowLookingAhead(true);
    dismissWelcomeBack();
  };

  const handleStayHere = () => {
    dismissWelcomeBack();
  };

  // Returning user who completed and paused - show choice
  if (showWelcomeBack && userState === 'completed_paused') {
    return (
      <div className="max-w-xl mx-auto">
        <div 
          className={`text-center transition-opacity duration-300 ${
            welcomeBackVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div>
              <Heart className="w-5 h-5 text-accent-gold" />
            </div>
            <h1 className="text-[20px] font-semibold text-text-primary">
              Welcome
            </h1>
          </div>
          {/* Two equal options */}
          <div className="flex justify-center gap-3 mb-4">
            <div className="text-center">
              <button
                onClick={handleReviewWhatsNext}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all mb-1"
              >
                Review what's next
              </button>
              <p className="text-[10px] text-text-muted">A few things that may come up soon</p>
            </div>
            <div className="text-center">
              <button
                onClick={handleStayHere}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all mb-1"
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Returning user who previewed Week 1 - show Week 1 Focus View
  if (showWelcomeBack && userState === 'previewed_week1') {
    return (
      <div className="max-w-xl mx-auto">
        <div 
          className={`transition-opacity duration-300 ${
            welcomeBackVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Welcome back header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div>
                <Heart className="w-5 h-5 text-accent-gold" />
              </div>
              <h1 className="text-[20px] font-semibold text-text-primary">
                Welcome
              </h1>
            </div>
            <span className="inline-block mt-2 text-[10px] font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
              Week 1
            </span>
          </div>

          {/* Week 1 items */}
          <div className="space-y-2">
            {WEEK_1_PREVIEW.map((item) => (
              <div
                key={item.id}
                className="bg-card-bg rounded-lg border border-accent-gold/30 hover:border-accent-gold/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-default p-3"
              >
                <h3 className="text-sm font-medium text-text-primary">
                  {item.title}
                </h3>
                <p className="text-[11px] mt-1 leading-snug text-text-secondary">
                  {item.supportingText}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <button
              onClick={() => {
                dismissWelcomeBack();
                onViewFullChecklist();
              }}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all"
            >
              View full checklist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Looking Ahead view
  if (showLookingAhead) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-5">
          <h1 className="text-lg font-semibold text-text-primary mb-2">
            Looking ahead
          </h1>
          <p className="text-text-secondary text-xs leading-relaxed">
            Here are a few things that may come up soon.
          </p>
          <span className="inline-block mt-2 text-[10px] font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
            Week 1
          </span>
        </div>

        <div className="space-y-2">
          {WEEK_1_PREVIEW.map((item) => (
            <div
              key={item.id}
              className="bg-card-bg rounded-lg border border-accent-gold/30 hover:border-accent-gold/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-default p-3"
            >
              <h3 className="text-sm font-medium text-text-primary">
                {item.title}
              </h3>
              <p className="text-[11px] mt-1 leading-snug text-text-secondary">
                {item.supportingText}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowLookingAhead(false)}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all"
            >
              Go back
            </button>
            <button
              onClick={onViewFullChecklist}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all"
            >
              View full checklist
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Focus View — 3-column layout with soft animation
  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Welcome back overlay for returning users with incomplete tasks */}
      {showWelcomeBack && userState === 'incomplete' && (
        <div 
          className={`text-center mb-8 transition-opacity duration-300 ${
            welcomeBackVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div>
              <Heart className="w-7 h-7 text-accent-gold" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-[22px] font-semibold text-text-primary mb-2 tracking-tight">
            Welcome
          </h2>
        </div>
      )}

      {/* Header — flat zone: subtle gradient, bottom inner shadow, thin gold rule */}
      <div className="page-header-zone text-center mb-6 flex flex-col items-center">
        {!showWelcomeBack && (
          <p className="text-sm text-text-secondary leading-relaxed mb-3 max-w-md">
            Here are a few things to focus on. Everything else can wait.
          </p>
        )}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            The first few days
          </h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-sm text-text-muted mt-1.5 font-normal max-w-md">
          There's no deadline here. This is simply a place to begin.
        </p>
      </div>

      {/* Tasks — grid, staggered soft entrance, hover reaction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="focus-card-enter group bg-[var(--color-background-card)] rounded-xl border border-[var(--color-border-subtle)] hover:border-accent-gold/40 transition-all duration-300 ease-out hover:shadow-lg hover:shadow-accent-gold/5 hover:scale-[1.02] cursor-default overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4 p-5">
              <div className="flex-shrink-0 mt-0.5">
                {task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary leading-snug">
                  {task.title}
                </h3>
                <p className="text-sm mt-2 leading-relaxed text-text-secondary">
                  {task.supportingText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center">
        <button
          onClick={onViewFullChecklist}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-text-primary bg-[var(--color-background-card)] border border-[var(--color-border-subtle)] hover:border-accent-gold/50 rounded-xl transition-all hover:shadow-md min-w-[200px]"
        >
          View full checklist
        </button>
      </div>
    </div>
  );
};
