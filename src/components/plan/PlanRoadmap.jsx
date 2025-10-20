import { memo, useState, useCallback } from 'react';

import PlanProgress from './PlanProgress';
import { EmptyPlanState } from './PlanStates';
import TaskItem from './TaskItem';

const PlanRoadmap = memo(({ tasks, progress, onOpenSubthread }) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const toggleTaskExpansion = useCallback((taskId, task) => {
    // Don't allow collapsing running tasks
    if (task?.status?.toLowerCase() === 'running') {
      return;
    }

    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg overflow-hidden shadow-sm">
      <PlanProgress progress={progress} />

      {tasks.length > 0 ? (
        <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
          {tasks.map((task) => {
            // Running tasks are always expanded
            const isRunning = task.status?.toLowerCase() === 'running';
            const isExpanded = isRunning || expandedTasks.has(task.id);

            return (
              <TaskItem
                key={task.id}
                task={task}
                isExpanded={isExpanded}
                onToggleExpansion={(taskId) => toggleTaskExpansion(taskId, task)}
                onOpenSubthread={onOpenSubthread}
              />
            );
          })}
        </div>
      ) : (
        <EmptyPlanState />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if tasks array or progress changed
  return (
    prevProps.tasks === nextProps.tasks &&
    prevProps.progress.completed === nextProps.progress.completed &&
    prevProps.progress.total === nextProps.progress.total
  );
});

PlanRoadmap.displayName = 'PlanRoadmap';

export default PlanRoadmap;
