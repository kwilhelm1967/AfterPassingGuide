/**
 * Focus View - Calm, minimal landing screen
 * 
 * Shows only 3 stabilizing tasks to prevent overwhelm.
 * Designed for emotional safety and grounding, not task completion.
 * Return experience is calm and non-directive.
 */

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface FocusTask {
  id: string;
  title: string;
  supportingText: string;
}

interface FocusViewProps {
  onViewFullChecklist: () => void;
}

type UserState = 'first_visit' | 'incomplete' | 'completed_paused' | 'previewed_week1';

const FOCUS_TASKS: FocusTask[] = [
  {
    id: 'pause',
    title: 'Take a moment',
    supportingText: "There's no rush. It's okay to pause before doing anything else.",
  },
  {
    id: 'arrangements',
    title: 'Review funeral or cremation arrangements',
    supportingText: 'This may already be handled. Set it aside if so, or return to it later.',
  },
  {
    id: 'notify',
    title: 'Let close family or friends know',
    supportingText: "Start with one or two people you trust. Others can wait.",
  },
];

const WEEK_1_PREVIEW = [
  {
    id: 'memorial',
    title: 'Consider memorial or service details',
    supportingText: "This can be simple or postponed. There's no right approach.",
  },
  {
    id: 'mail',
    title: 'Review mail and messages',
    supportingText: "Just notice what's arriving. You don't need to respond to everything.",
  },
];

export const FocusView: React.FC<FocusViewProps> = ({ 
  onViewFullChecklist
}) => {
  // Tasks are static - no completion state needed
  const tasks = FOCUS_TASKS;

  // Determine user state on load
  const [userState] = useState<UserState>(() => {
    const hasVisited = localStorage.getItem('aftercare_has_visited');
    const savedState = localStorage.getItem('aftercare_user_state') as UserState | null;
    
    if (!hasVisited) {
      return 'first_visit';
    }
    return savedState || 'incomplete';
  });

  const [showWelcomeBack, setShowWelcomeBack] = useState(() => {
    const hasVisited = localStorage.getItem('aftercare_has_visited');
    return hasVisited === 'true';
  });

  const [showLookingAhead, setShowLookingAhead] = useState(false);
  const [welcomeBackVisible, setWelcomeBackVisible] = useState(false);

  // Mark as visited and fade in welcome back
  useEffect(() => {
    if (showWelcomeBack) {
      setTimeout(() => setWelcomeBackVisible(true), 50);
    }
    localStorage.setItem('aftercare_has_visited', 'true');
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
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-gold/15 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent-gold" />
            </div>
            <h1 className="text-lg font-semibold text-text-primary">
              Welcome back
            </h1>
          </div>
          
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            You can pick this up whenever you're ready. There's no rush.
          </p>

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
              <p className="text-[10px] text-text-muted">You can take more time</p>
            </div>
          </div>

          <p className="text-[10px] text-text-muted">
            Some items may never apply. That's okay.
          </p>
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
              <div className="w-10 h-10 bg-accent-gold/15 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-gold" />
              </div>
              <h1 className="text-lg font-semibold text-text-primary">
                Welcome back
              </h1>
            </div>
            <p className="text-text-secondary text-xs mb-2">
              You can pick this up whenever you're ready. There's no rush.
            </p>
            <span className="inline-block text-[10px] font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
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
            <p className="text-[10px] text-text-muted mb-3">
              Some items may never apply. That's okay.
            </p>
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
            Here are a few things that may come up soon. You don't need to do them now.
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
          <p className="text-[10px] text-text-muted mb-3">
            Some items may never apply. That's okay.
          </p>
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

  // Main Focus View
  return (
    <div className="max-w-xl mx-auto">
      {/* Welcome back overlay for returning users with incomplete tasks */}
      {showWelcomeBack && userState === 'incomplete' && (
        <div 
          className={`text-center mb-6 transition-opacity duration-300 ${
            welcomeBackVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-accent-gold/20 rounded-xl flex items-center justify-center border border-accent-gold/30">
              <Heart className="w-6 h-6 text-accent-gold" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            You can pick this up whenever you're ready.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        {!showWelcomeBack && (
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Here are a few things to focus on. Everything else can wait.
          </p>
        )}
        <span className="inline-block text-sm font-semibold text-accent-gold bg-accent-gold/20 border-2 border-accent-gold/50 px-4 py-2 rounded-full">
          First 48 Hours
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card-bg rounded-lg border border-accent-gold/30 hover:border-accent-gold/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-default"
          >
            <div className="flex items-start gap-3 p-3">
              <div className="flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-accent-gold/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary">
                  {task.title}
                </h3>
                <p className="text-[11px] mt-1 leading-snug text-text-secondary">
                  {task.supportingText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-text-muted mb-3">
          Some items may never apply. That's okay.
        </p>
        <button
          onClick={onViewFullChecklist}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-accent-gold/50 rounded-lg transition-all hover:bg-card-bg"
        >
          View full checklist
        </button>
      </div>
    </div>
  );
};
