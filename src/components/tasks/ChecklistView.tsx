/**
 * Checklist View - Calm expansion from Focus View
 * 
 * This is a map, not a control panel.
 * Designed for orientation without overwhelm.
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Filter,
  ArrowLeft,
  Check,
  Circle,
  Minus,
  Pause,
  Info,
} from 'lucide-react';
import { AftercarePlan, AftercareTask, TaskPhase, TaskStatus } from '../../types';
import { getPhaseInfo } from '../../services/taskGenerationEngine';
import { TitleBar } from '../common/TitleBar';

interface ChecklistViewProps {
  plan: AftercarePlan;
  onPlanUpdate: (plan: AftercarePlan) => void;
  onReturnToFocus: () => void;
}

const PHASES: TaskPhase[] = ['FIRST_48_HOURS', 'WEEK_1', 'WEEKS_2_6', 'DAYS_60_90', 'LONG_TERM'];
const MAX_VISIBLE_TASKS = 6;
const STATUS_GUIDE_HIDDEN_KEY = 'checklist_status_guide_hidden';

export const ChecklistView: React.FC<ChecklistViewProps> = ({ 
  plan, 
  onPlanUpdate, 
  onReturnToFocus 
}) => {
  // Collapse sections by default after first visit; first time only First 48 Hours expanded
  const [expandedPhases, setExpandedPhases] = useState<Set<TaskPhase>>(() => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('checklist_has_visited') === 'true') {
        return new Set();
      }
    } catch (_) {}
    return new Set(['FIRST_48_HOURS']);
  });
  React.useEffect(() => {
    try {
      localStorage.setItem('checklist_has_visited', 'true');
    } catch (_) {}
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAllInPhase, setShowAllInPhase] = useState<Set<TaskPhase>>(new Set());
  const [showStatusGuide, setShowStatusGuide] = useState(false);
  const [statusGuideLinkHidden, setStatusGuideLinkHidden] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(STATUS_GUIDE_HIDDEN_KEY) === 'true';
    } catch { return false; }
  });
  const statusGuideRef = useRef<HTMLDivElement>(null);

  const hideStatusGuidePermanently = useCallback(() => {
    try {
      localStorage.setItem(STATUS_GUIDE_HIDDEN_KEY, 'true');
      setStatusGuideLinkHidden(true);
      setShowStatusGuide(false);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!showStatusGuide) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusGuideRef.current && !statusGuideRef.current.contains(e.target as Node)) {
        setShowStatusGuide(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusGuide]);
  
  // Properly initialize ref with all phase keys to avoid access-before-set issues
  const phaseRefs = useRef<Record<TaskPhase, HTMLDivElement | null>>(
    PHASES.reduce((acc, phase) => ({ ...acc, [phase]: null }), {} as Record<TaskPhase, HTMLDivElement | null>)
  );

  const togglePhase = useCallback((phase: TaskPhase) => {
    const wasExpanded = expandedPhases.has(phase);
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
    // Scroll into view when expanding
    if (!wasExpanded) {
      setTimeout(() => {
        phaseRefs.current[phase]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, []);

  const toggleTaskExpand = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const handleStatusChange = useCallback((task: AftercareTask, newStatus: TaskStatus) => {
    const updatedTasks = plan.tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: newStatus, completedAt: newStatus === 'DONE' ? new Date().toISOString() : undefined }
        : t
    );
    onPlanUpdate({
      ...plan,
      tasks: updatedTasks,
      lastUpdatedAt: new Date().toISOString(),
    });
  }, [plan, onPlanUpdate]);

  // Memoize tasks grouped by phase
  const tasksByPhase = useMemo(() => {
    const grouped: Record<TaskPhase, AftercareTask[]> = {
      FIRST_48_HOURS: [],
      WEEK_1: [],
      WEEKS_2_6: [],
      DAYS_60_90: [],
      LONG_TERM: [],
    };
    plan.tasks.forEach(task => {
      if (grouped[task.phase]) {
        grouped[task.phase].push(task);
      }
    });
    return grouped;
  }, [plan.tasks]);

  // Progress: Handled and Not needed count as addressed; Leave for now and Taking care of this do not
  const progressCount = useMemo(() => {
    const addressed = plan.tasks.filter(t => t.status === 'DONE' || t.status === 'NOT_APPLICABLE');
    return { count: addressed.length, total: plan.tasks.length };
  }, [plan.tasks]);

  const getVisibleTasks = useCallback((phaseTasks: AftercareTask[], phase: TaskPhase) => {
    let filtered = hideCompleted 
      ? phaseTasks.filter(t => t.status !== 'DONE' && t.status !== 'NOT_APPLICABLE')
      : phaseTasks;
    
    if (!showAllInPhase.has(phase) && filtered.length > MAX_VISIBLE_TASKS) {
      return { tasks: filtered.slice(0, MAX_VISIBLE_TASKS), hasMore: true, total: filtered.length };
    }
    return { tasks: filtered, hasMore: false, total: filtered.length };
  }, [hideCompleted, showAllInPhase]);

  // Separate first phase from others
  const firstPhase = 'FIRST_48_HOURS' as TaskPhase;
  const otherPhases = PHASES.filter(p => p !== firstPhase);

  const isFirstPhase = (p: TaskPhase) => p === 'FIRST_48_HOURS';

  const renderPhaseCard = (phase: TaskPhase) => {
    const phaseTasks = tasksByPhase[phase];
    const isExpanded = expandedPhases.has(phase);
    const phaseInfo = getPhaseInfo(phase);
    const { tasks: visibleTasks, hasMore, total } = getVisibleTasks(phaseTasks, phase);
    const primary = isFirstPhase(phase);

    if (phaseTasks.length === 0) return null;

    return (
      <div 
        key={phase}
        ref={el => { phaseRefs.current[phase] = el; }}
        className={primary
          ? 'rounded-xl border border-accent-gold/25 overflow-hidden bg-card-bg/80'
          : 'rounded-lg border border-white/5 overflow-hidden bg-card-bg/40'
        }
      >
        {/* Phase Header */}
        <button
          onClick={() => togglePhase(phase)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePhase(phase);
            }
          }}
          aria-expanded={isExpanded}
          aria-controls={`phase-${phase}-content`}
          aria-label={primary ? `${phaseInfo.label} phase` : `${phaseInfo.label} phase, ${phaseTasks.length} items`}
          className={`w-full flex items-center justify-between text-left transition-colors ${
            primary
              ? 'px-5 py-4 hover:bg-white/[0.03]'
              : 'px-4 py-2.5 hover:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className={primary ? 'w-5 h-5 text-accent-gold' : 'w-4 h-4 text-text-muted'} />
            ) : (
              <ChevronRight className={primary ? 'w-5 h-5 text-accent-gold' : 'w-4 h-4 text-text-muted'} />
            )}
            <div>
              <h3 className={primary
                ? 'font-medium text-base text-accent-gold'
                : 'font-normal text-sm text-text-muted'
              }>{phaseInfo.label}</h3>
              {!isExpanded && !primary && (
                <p className="text-xs text-text-muted/80 mt-0.5">{phaseTasks.length} items</p>
              )}
            </div>
          </div>
          {isExpanded && !primary && (
            <span className="text-xs text-text-muted/80">{phaseTasks.length} items</span>
          )}
        </button>

        {/* Phase Content - Only when expanded */}
        {isExpanded && (
          <div id={`phase-${phase}-content`} className={primary ? 'border-t border-accent-gold/15' : 'border-t border-white/5'} role="region" aria-label={`${phaseInfo.label} tasks`}>
            {/* Tasks */}
            <div className="divide-y divide-border-subtle">
              {visibleTasks.map((task) => {
                const isTaskExpanded = expandedTasks.has(task.id);
                const status = task.status;
                // Status behavior: Leave=normal+pause, Taking=brighter+dot, Handled=dimmed+check, Not needed=dimmed+italic, subtext hidden. Never strikethrough.
                const titleClasses = {
                  NOT_STARTED: 'text-text-primary font-normal',
                  IN_PROGRESS: 'text-text-primary font-medium',
                  DONE: 'text-text-primary/85 font-normal',
                  NOT_APPLICABLE: 'text-text-primary/70 font-normal italic',
                }[status];
                const descClasses = {
                  NOT_STARTED: 'text-sm text-text-secondary leading-relaxed',
                  IN_PROGRESS: 'text-sm text-text-secondary leading-relaxed',
                  DONE: 'text-sm text-text-secondary leading-relaxed opacity-80',
                  NOT_APPLICABLE: 'text-sm text-text-secondary leading-relaxed opacity-0 pointer-events-none h-0 overflow-hidden', // hidden
                }[status];
                const showSubtext = status !== 'NOT_APPLICABLE';
                
                return (
                  <div key={task.id} className="px-4 py-3">
                    {/* Task Row */}
                    <button
                      onClick={() => toggleTaskExpand(task.id)}
                      className="w-full flex items-start gap-3 text-left"
                    >
                      {/* Expand/collapse arrow */}
                      <div className="flex-shrink-0 mt-0.5">
                        {isTaskExpanded ? (
                          <ChevronDown className="w-4 h-4 text-accent-gold" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-text-muted" />
                        )}
                      </div>

                      {/* Status indicator: pause (leave), progress dot (taking), check (handled), minus (not needed) */}
                      <div className="flex-shrink-0 w-5 flex items-start justify-center mt-0.5">
                        {status === 'NOT_STARTED' && <Pause className="w-2.5 h-2.5 text-text-muted mt-1" strokeWidth={2} />}
                        {status === 'IN_PROGRESS' && <Circle className="w-2 h-2 fill-accent-gold/70 text-accent-gold/70 mt-1" strokeWidth={2.5} />}
                        {status === 'DONE' && <Check className="w-3.5 h-3.5 text-text-muted mt-1" strokeWidth={2} />}
                        {status === 'NOT_APPLICABLE' && <Minus className="w-3.5 h-3.5 text-text-muted mt-1" strokeWidth={2} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm ${titleClasses}`}>
                          {task.title}
                        </h4>
                      </div>
                    </button>

                    {/* Expanded: Description and Status selector */}
                    {isTaskExpanded && (
                      <div className="mt-3 ml-7 space-y-3">
                        {task.description && showSubtext && (
                          status === 'DONE' ? (
                            <details className="group/details">
                              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary list-none py-0.5">
                                What this is
                              </summary>
                              <p className="mt-1 text-sm text-text-secondary leading-relaxed opacity-80">{task.description}</p>
                            </details>
                          ) : (
                            <p className={descClasses}>{task.description}</p>
                          )
                        )}
                        
                        {/* Status — one selectable at a time; immediate, quiet; subtle selected state for all */}
                        {task.title !== 'Take care of yourself' && task.title !== 'Take a moment' && (
                          <div className="flex flex-wrap gap-1.5 pt-2" role="group" aria-label={`Status options for ${task.title}`}>
                            {(['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'NOT_APPLICABLE'] as const).map((s) => {
                              const label = { NOT_STARTED: 'Leave for now', IN_PROGRESS: 'Taking care of this', DONE: 'Handled', NOT_APPLICABLE: 'Not needed' }[s];
                              const isPressed = task.status === s;
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleStatusChange(task, s);
                                  }}
                                  aria-pressed={isPressed}
                                  aria-label={`Mark ${task.title} as ${label.toLowerCase()}`}
                                  className={`px-2.5 py-1.5 text-[11px] font-normal rounded transition-colors cursor-pointer border ${
                                    isPressed
                                      ? 'bg-white/8 text-text-primary border-white/15'
                                      : 'bg-transparent text-text-muted hover:bg-white/5 hover:text-text-primary border-transparent'
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show more button */}
            {hasMore && (
              <div className="px-4 py-3 border-t border-border-subtle">
                <button
                  onClick={() => setShowAllInPhase(prev => {
                    const next = new Set(prev);
                    next.add(phase);
                    return next;
                  })}
                  className="text-sm text-accent-gold hover:underline"
                >
                  Show {total - visibleTasks.length} more items
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header — flat zone: subtle gradient, bottom inner shadow, thin gold rule */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="page-header-zone flex flex-col items-center text-center flex-1 min-w-0 relative">
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-semibold text-text-primary">Checklist</h1>
            <TitleBar className="mt-1.5" />
          </div>
          <p className="text-text-muted text-sm mt-1.5">A place to start.</p>
          {plan.tasks.length > 0 && (
            <div className="w-full max-w-xs mt-2 mx-auto">
              <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-gold/70 rounded-full transition-all"
                  style={{ width: `${progressCount.total ? (progressCount.count / progressCount.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!statusGuideLinkHidden && (
            <div className="relative" ref={statusGuideRef}>
              <button
                type="button"
                onClick={() => setShowStatusGuide(prev => !prev)}
                className="inline-flex items-center gap-1 text-text-muted text-xs hover:text-text-secondary transition-colors py-2 px-1"
                aria-expanded={showStatusGuide}
                aria-haspopup="true"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Status guide</span>
              </button>
              {showStatusGuide && (
                <div
                  className="absolute right-0 top-full mt-1.5 z-20 w-64 p-3 bg-card-bg border border-border-subtle rounded-lg shadow-lg text-left"
                  role="dialog"
                  aria-label="Status guide"
                >
                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="flex items-start gap-2">
                      <Pause className="w-4 h-4 shrink-0 mt-0.5 text-text-muted" />
                      <span><strong className="text-text-primary font-medium">Leave for now.</strong> Stays active; not counted as addressed.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 shrink-0 mt-0.5 rounded-full bg-accent-gold/60 border border-accent-gold/40" />
                      <span><strong className="text-text-primary font-medium">Taking care of this.</strong> In progress; not counted as addressed.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-text-muted" />
                      <span><strong className="text-text-primary font-medium">Handled.</strong> Collapses by default; counts as addressed.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Minus className="w-4 h-4 shrink-0 mt-0.5 text-text-muted" />
                      <span><strong className="text-text-primary font-medium">Not needed.</strong> Muted; not counted against progress.</span>
                    </div>
                  </div>
                  <p className="text-text-muted text-xs mt-2.5 border-t border-border-subtle pt-2">
                    Handled and Not needed count as addressed. Leave for now and Taking care of this do not.
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowStatusGuide(false)}
                      className="text-xs text-accent-gold hover:underline"
                    >
                      Got it
                    </button>
                    <button
                      type="button"
                      onClick={hideStatusGuidePermanently}
                      className="text-xs text-text-muted hover:text-text-secondary"
                    >
                      Don't show again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            className="p-2 text-text-muted/70 hover:text-text-muted rounded transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters - Only visible when toggled */}
      {showFilters && (
        <div className="mb-4 p-3 bg-card-bg rounded-lg border border-border-subtle">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-accent-gold focus:ring-accent-gold"
            />
            <span className="text-sm text-text-secondary">Hide completed items</span>
          </label>
          {statusGuideLinkHidden && (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(STATUS_GUIDE_HIDDEN_KEY);
                  setStatusGuideLinkHidden(false);
                } catch (_) {}
              }}
              className="mt-2 text-sm text-text-muted hover:text-text-secondary"
            >
              Show status guide
            </button>
          )}
        </div>
      )}

      {/* Sections */}
      {plan.tasks.length === 0 ? (
        <div className="text-center py-8 bg-card-bg/50 rounded-xl border border-white/5">
          <p className="text-text-secondary mb-2">No guidance items yet</p>
          <p className="text-text-muted text-sm">
            Go to Settings to update your situation and generate personalized guidance.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* The first few days — full width, primary */}
          {tasksByPhase.FIRST_48_HOURS.length > 0 && renderPhaseCard('FIRST_48_HOURS')}
          {/* Other sections — single column, visually quieter */}
          <div className="space-y-6">
            {otherPhases.map(phase => tasksByPhase[phase].length > 0 ? renderPhaseCard(phase) : null)}
          </div>
        </div>
      )}

      {/* Footer: Return to Focus */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <button
          onClick={onReturnToFocus}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Focus View
        </button>
      </div>
    </div>
  );
};
