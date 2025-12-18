/**
 * Checklist View - Calm expansion from Focus View
 * 
 * This is a map, not a control panel.
 * Designed for orientation without overwhelm.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { AftercarePlan, AftercareTask, TaskPhase, TaskStatus } from '../../types';
import { getPhaseInfo } from '../../services/taskGenerationEngine';

interface ChecklistViewProps {
  plan: AftercarePlan;
  onPlanUpdate: (plan: AftercarePlan) => void;
  onReturnToFocus: () => void;
}

const PHASES: TaskPhase[] = ['FIRST_48_HOURS', 'WEEK_1', 'WEEKS_2_6', 'DAYS_60_90', 'LONG_TERM'];
const MAX_VISIBLE_TASKS = 6;

export const ChecklistView: React.FC<ChecklistViewProps> = ({ 
  plan, 
  onPlanUpdate, 
  onReturnToFocus 
}) => {
  // Only First 48 Hours expanded by default
  const [expandedPhases, setExpandedPhases] = useState<Set<TaskPhase>>(
    new Set(['FIRST_48_HOURS'])
  );
  const [showFilters, setShowFilters] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAllInPhase, setShowAllInPhase] = useState<Set<TaskPhase>>(new Set());
  
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

  const renderPhaseCard = (phase: TaskPhase) => {
    // Use memoized tasksByPhase instead of filtering on every render
    const phaseTasks = tasksByPhase[phase];
    const isExpanded = expandedPhases.has(phase);
    const phaseInfo = getPhaseInfo(phase);
    const { tasks: visibleTasks, hasMore, total } = getVisibleTasks(phaseTasks, phase);

    if (phaseTasks.length === 0) return null;

    return (
      <div 
        key={phase}
        ref={el => { phaseRefs.current[phase] = el; }}
        className="bg-card-bg rounded-xl border border-border-subtle overflow-hidden"
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
          aria-label={`${phaseInfo.label} phase, ${phaseTasks.length} items`}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-card-bg-hover transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-accent-gold" />
            ) : (
              <ChevronRight className="w-5 h-5 text-text-muted" />
            )}
            <div>
              <h3 className={`font-medium text-base ${
                phase === 'FIRST_48_HOURS' ? 'text-accent-gold' : 'text-text-primary'
              }`}>{phaseInfo.label}</h3>
              {!isExpanded && (
                <p className="text-sm text-text-muted">{phaseTasks.length} items</p>
              )}
            </div>
          </div>
          {isExpanded && (
            <span className="text-sm text-text-muted">{phaseTasks.length} items</span>
          )}
        </button>

        {/* Phase Content - Only when expanded */}
        {isExpanded && (
          <div id={`phase-${phase}-content`} className="border-t border-border-subtle" role="region" aria-label={`${phaseInfo.label} tasks`}>
            {/* Tasks */}
            <div className="divide-y divide-border-subtle">
              {visibleTasks.map((task) => {
                const isTaskExpanded = expandedTasks.has(task.id);
                const isAddressed = task.status === 'DONE' || task.status === 'NOT_APPLICABLE';
                
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

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium ${
                          isAddressed ? 'text-text-muted/60 line-through' : 'text-text-primary'
                        }`}>
                          {task.title}
                        </h4>
                      </div>
                    </button>

                    {/* Expanded: Description and Status selector */}
                    {isTaskExpanded && (
                      <div className="mt-3 ml-7 space-y-3">
                        {task.description && (
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        
                        {/* Status Buttons - Hidden for "Take care of yourself" and "Take a moment" tasks */}
                        {task.title !== 'Take care of yourself' && task.title !== 'Take a moment' && (
                          <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label={`Status options for ${task.title}`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'NOT_STARTED');
                              }}
                              aria-pressed={task.status === 'NOT_STARTED'}
                              aria-label={`Mark ${task.title} as not started`}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                task.status === 'NOT_STARTED'
                                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
                                  : 'bg-slate-700/50 text-text-secondary hover:bg-slate-700 border border-border-subtle'
                              }`}
                            >
                              Not Started
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'IN_PROGRESS');
                              }}
                              aria-pressed={task.status === 'IN_PROGRESS'}
                              aria-label={`Mark ${task.title} as in progress`}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                task.status === 'IN_PROGRESS'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-700/50 text-text-secondary hover:bg-slate-700 border border-border-subtle'
                              }`}
                            >
                              In Progress
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'DONE');
                              }}
                              aria-pressed={task.status === 'DONE'}
                              aria-label={`Mark ${task.title} as done`}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                task.status === 'DONE'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                  : 'bg-slate-700/50 text-text-secondary hover:bg-slate-700 border border-border-subtle'
                              }`}
                            >
                              Done
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, 'NOT_APPLICABLE');
                              }}
                              aria-pressed={task.status === 'NOT_APPLICABLE'}
                              aria-label={`Mark ${task.title} as not applicable`}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                task.status === 'NOT_APPLICABLE'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                  : 'bg-slate-700/50 text-text-secondary hover:bg-slate-700 border border-border-subtle'
                              }`}
                            >
                              Not Applicable
                            </button>
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Full Aftercare Checklist</h1>
          <p className="text-text-muted text-sm">You don't need to do everything. This is here so nothing gets missed.</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
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
        </div>
      )}

      {/* Two Column Layout */}
      {plan.tasks.length === 0 ? (
        <div className="text-center py-12 bg-card-bg rounded-xl border border-border-subtle">
          <p className="text-text-secondary mb-2">No guidance items yet</p>
          <p className="text-text-muted text-sm">
            Go to Settings to update your situation and generate personalized guidance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {/* Left Column - First 48 Hours */}
          <div>
            {renderPhaseCard(firstPhase)}
          </div>

          {/* Right Column - Other Phases */}
          <div className="space-y-3">
            {otherPhases.map(phase => renderPhaseCard(phase))}
          </div>
        </div>
      )}

      {/* Legal Footer - Centered */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-text-secondary">
          Not everything here will apply to your situation. Skip anything that doesn't.
        </p>
        <p className="text-xs text-text-muted">
          This tool provides organizational guidance only. For legal, financial, or medical advice, please consult a qualified professional.
        </p>
      </div>

      {/* Return to Focus */}
      <div className="mt-4">
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
