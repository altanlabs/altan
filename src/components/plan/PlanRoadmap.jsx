import { useState } from 'react';

import PlanProgress from './PlanProgress';
import { EmptyPlanState } from './PlanStates';
import TaskItem from './TaskItem';

const PlanRoadmap = ({ tasks, progress, onOpenSubthread }) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg overflow-hidden shadow-sm">
      <PlanProgress progress={progress} />

      {tasks.length > 0 ? (
        <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isExpanded={expandedTasks.has(task.id)}
              onToggleExpansion={toggleTaskExpansion}
              onOpenSubthread={onOpenSubthread}
            />
          ))}
        </div>
      ) : (
        <EmptyPlanState />
      )}
    </div>
  );
};

export default PlanRoadmap;
