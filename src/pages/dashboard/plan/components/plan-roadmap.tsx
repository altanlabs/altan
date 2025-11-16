import { AnimatePresence, m } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, ListTodo, X } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';

import {
  selectPlanDescription,
  selectPlanProgress,
  selectPlanStats,
  selectPlanTitle,
  selectSortedPlanTaskIds,
  selectTaskStatus,
} from '@/redux/slices/tasks';
import { useSelector } from '@/redux/store';

import type { TaskStatusFilter } from '../types';
import { TaskListItem } from './task-list-item';
import { isTaskCompleted } from '../utils/plan-status';

interface PlanRoadmapProps {
  planId: string;
  onOpenSubthread?: ((taskId: string, threadId: string) => void) | undefined;
  statusFilter: TaskStatusFilter;
  onStatusFilterChange: (filter: TaskStatusFilter) => void;
}

export const PlanRoadmap = memo<PlanRoadmapProps>(
  ({ planId, onOpenSubthread, statusFilter, onStatusFilterChange }: PlanRoadmapProps) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Use cached selectors directly
    const allTaskIds = useSelector((state) => selectSortedPlanTaskIds(state, planId), shallowEqual);
    const progress = useSelector((state) => selectPlanProgress(state, planId));
    const stats = useSelector((state) => selectPlanStats(state, planId));
    const title = useSelector((state) => selectPlanTitle(state, planId));
    const description = useSelector((state) => selectPlanDescription(state, planId));

    const { inProgress, pending, estimatedTime } = stats;

    // Filter tasks based on status filter - use selector with memoization callback
    const filteredTaskIds = useSelector(
      (state) => {
        const taskIds = selectSortedPlanTaskIds(state, planId);
        if (!statusFilter) return taskIds;
        
        return taskIds.filter((taskId) => {
          const status = selectTaskStatus(state, taskId);
          
          if (statusFilter === 'completed') {
            return isTaskCompleted(status);
          }
          if (statusFilter === 'in_progress') {
            return status === 'in_progress';
          }
          if (statusFilter === 'pending') {
            return status === 'pending';
          }
          if (statusFilter === 'failed') {
            return status === 'failed';
          }
          return true;
        });
      },
      shallowEqual
    );

    // Use either filtered or all task IDs
    const taskIds = statusFilter ? filteredTaskIds : allTaskIds;

    // Handle scroll detection - find scrolling parent
    useEffect(() => {
      const findScrollParent = (element: HTMLElement | null): HTMLElement | null => {
        if (!element) return null;
        
        const { overflow, overflowY } = window.getComputedStyle(element);
        if (overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') {
          return element;
        }
        
        return findScrollParent(element.parentElement);
      };

      const scrollParent = findScrollParent(componentRef.current);
      if (!scrollParent) return;

      const handleScroll = (): void => {
        setIsScrolled(scrollParent.scrollTop > 20);
      };

      scrollParent.addEventListener('scroll', handleScroll);
      return () => scrollParent.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMetricClick = (filter: TaskStatusFilter): void => {
      onStatusFilterChange(statusFilter === filter ? null : filter);
    };

    return (
      <div className="relative" ref={componentRef}>
        {/* Sticky Header Container */}
        <m.div
          className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-950 pb-4 space-y-3"
          layout
          transition={{ duration: 0.25, ease: 'easeInOut', layout: { duration: 0.25 } }}
        >
          {/* Stats Row Container */}
          <m.div
            layout
            className={`transition-all duration-400 ${
              isScrolled 
                ? 'flex items-center gap-3' 
                : 'grid grid-cols-4 gap-3'
            }`}
          >
            {/* Title & Description - Only visible when scrolled */}
            <AnimatePresence>
              {isScrolled && (
                <m.div
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex-1 min-w-0 pr-4"
                >
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                      {description}
                    </p>
                  )}
                </m.div>
              )}
            </AnimatePresence>

            {/* Stats Container */}
            <m.div
              layout
              className={`grid gap-2 ${
                isScrolled ? 'grid-cols-4 flex-shrink-0' : 'col-span-4 grid-cols-4 gap-3'
              }`}
            >
              {/* Total */}
              <m.button
                layout
                layoutId="stat-total"
                onClick={() => handleMetricClick(null)}
                disabled={!statusFilter}
                transition={{ duration: 0.2, ease: 'easeInOut', layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm text-left transition-all ${
                  !statusFilter ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer'
                } ${isScrolled ? 'px-2 py-1.5' : 'px-4 py-3'}`}
              >
                <m.div layout className={`flex items-center gap-1.5 ${isScrolled ? 'mb-0.5' : 'mb-1'}`}>
                  <ListTodo className={`text-neutral-600 dark:text-neutral-400 transition-all ${isScrolled ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
                  <m.span
                    layout
                    className={`font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 transition-all ${
                      isScrolled ? 'text-[8px]' : 'text-[10px]'
                    }`}
                  >
                    Total
                  </m.span>
                </m.div>
                <m.div
                  layout
                  className={`font-bold text-neutral-900 dark:text-neutral-100 font-mono transition-all ${
                    isScrolled ? 'text-base' : 'text-2xl'
                  }`}
                >
                  {progress.total}
                </m.div>
              </m.button>

              {/* Completed */}
              <m.button
                layout
                layoutId="stat-completed"
                onClick={() => handleMetricClick('completed')}
                transition={{ duration: 0.2, ease: 'easeInOut', layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm text-left transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer ${
                  statusFilter === 'completed' ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : ''
                } ${isScrolled ? 'px-2 py-1.5' : 'px-4 py-3'}`}
              >
                <m.div layout className={`flex items-center gap-1.5 ${isScrolled ? 'mb-0.5' : 'mb-1'}`}>
                  <CheckCircle2 className={`text-neutral-600 dark:text-neutral-400 transition-all ${isScrolled ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
                  <m.span
                    layout
                    className={`font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 transition-all ${
                      isScrolled ? 'text-[8px]' : 'text-[10px]'
                    }`}
                  >
                    Done
                  </m.span>
                </m.div>
                <m.div
                  layout
                  className={`font-bold text-neutral-900 dark:text-neutral-100 font-mono transition-all ${
                    isScrolled ? 'text-base' : 'text-2xl'
                  }`}
                >
                  {progress.completed}
                </m.div>
              </m.button>

              {/* Active */}
              <m.button
                layout
                layoutId="stat-active"
                onClick={() => handleMetricClick('in_progress')}
                transition={{ duration: 0.2, ease: 'easeInOut', layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm text-left transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer ${
                  statusFilter === 'in_progress' ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : ''
                } ${isScrolled ? 'px-2 py-1.5' : 'px-4 py-3'}`}
              >
                <m.div layout className={`flex items-center gap-1.5 ${isScrolled ? 'mb-0.5' : 'mb-1'}`}>
                  <Loader2 className={`text-neutral-600 dark:text-neutral-400 transition-all ${isScrolled ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
                  <m.span
                    layout
                    className={`font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 transition-all ${
                      isScrolled ? 'text-[8px]' : 'text-[10px]'
                    }`}
                  >
                    Active
                  </m.span>
                </m.div>
                <m.div
                  layout
                  className={`font-bold text-neutral-900 dark:text-neutral-100 font-mono transition-all ${
                    isScrolled ? 'text-base' : 'text-2xl'
                  }`}
                >
                  {inProgress}
                </m.div>
              </m.button>

              {/* Pending */}
              <m.button
                layout
                layoutId="stat-pending"
                onClick={() => handleMetricClick('pending')}
                transition={{ duration: 0.2, ease: 'easeInOut', layout: { duration: 0.2 } }}
                className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm text-left transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer ${
                  statusFilter === 'pending' ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : ''
                } ${isScrolled ? 'px-2 py-1.5' : 'px-4 py-3'}`}
              >
                <m.div layout className={`flex items-center gap-1.5 ${isScrolled ? 'mb-0.5' : 'mb-1'}`}>
                  <Circle className={`text-neutral-600 dark:text-neutral-400 transition-all ${isScrolled ? 'w-2.5 h-2.5' : 'w-4 h-4'}`} />
                  <m.span
                    layout
                    className={`font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 transition-all ${
                      isScrolled ? 'text-[8px]' : 'text-[10px]'
                    }`}
                  >
                    Pending
                  </m.span>
                </m.div>
                <m.div
                  layout
                  className={`font-bold text-neutral-900 dark:text-neutral-100 font-mono transition-all ${
                    isScrolled ? 'text-base' : 'text-2xl'
                  }`}
                >
                  {pending}
                </m.div>
              </m.button>
            </m.div>
          </m.div>

          {/* Progress Bar */}
          <m.div
            layout
            transition={{ duration: 0.2, ease: 'easeInOut', layout: { duration: 0.2 } }}
            className={`overflow-hidden ${
              isScrolled 
                ? '' 
                : 'bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-3 shadow-sm'
            }`}
          >
            {/* Label and percentage - Only shown when not scrolled */}
            <AnimatePresence>
              {!isScrolled && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="flex items-center justify-between mb-2.5"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Overall Progress
                  </span>
                  <div className="flex items-center gap-3">
                    {estimatedTime && (
                      <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        EST. {estimatedTime}
                      </span>
                    )}
                    <span className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                      {progress.percentage}%
                    </span>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Progress bar - Thin line when scrolled, thicker when not */}
            <m.div
              layout
              className={`relative bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden ${
                isScrolled ? 'h-1' : 'h-2.5'
              }`}
            >
              <m.div
                className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
              
              {/* Inline percentage when scrolled */}
              <AnimatePresence>
                {isScrolled && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <span className="text-[9px] font-bold font-mono text-neutral-900 dark:text-neutral-100 bg-neutral-50/90 dark:bg-neutral-950/90 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {progress.percentage}%
                    </span>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </m.div>

          {/* Filter Badge */}
          <AnimatePresence>
            {statusFilter && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 rounded-md text-xs font-semibold"
              >
                <span>Filtering: {statusFilter.replace('_', ' ').toUpperCase()}</span>
                <button
                  onClick={() => onStatusFilterChange(null)}
                  className="hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden shadow-sm mt-4">
          <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
              Task Breakdown ({taskIds.length}{statusFilter ? ` of ${allTaskIds.length}` : ''})
            </h3>
          </div>

          {taskIds.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <div>
                {taskIds.map((taskId, index) => (
                  <m.div
                    key={taskId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <TaskListItem
                      taskId={taskId}
                      index={index}
                      onOpenSubthread={onOpenSubthread}
                    />
                  </m.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="px-4 py-16 text-center"
            >
              <Circle className="w-10 h-10 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {statusFilter ? `No ${statusFilter.replace('_', ' ')} tasks` : 'No tasks in this plan'}
              </p>
            </m.div>
          )}
        </div>
      </div>
    );
  },
);

PlanRoadmap.displayName = 'PlanRoadmap';

