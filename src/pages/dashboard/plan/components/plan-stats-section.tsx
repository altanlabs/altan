import { Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import { memo, useMemo, useEffect } from 'react';

import { fetchTasksByRoomId, selectTaskIdsByRoom, selectTaskById } from '@/redux/slices/tasks';
import { useDispatch, useSelector } from '@/redux/store';
import type { Task } from '@/services/types';

interface PlanStatsProps {
  roomId: string;
}

export const PlanStatsSection = memo<PlanStatsProps>(({ roomId }) => {
  const dispatch = useDispatch();

  // Fetch all tasks for the room
  useEffect(() => {
    if (roomId) {
      void dispatch(fetchTasksByRoomId(roomId));
    }
  }, [roomId, dispatch]);

  // Get all task IDs for the room
  const taskIds = useSelector((state) => selectTaskIdsByRoom(state, roomId));

  // Get all tasks
  const tasks = useSelector((state) => {
    return taskIds
      .map((id) => selectTaskById(state, id))
      .filter((t): t is Task => t !== null);
  });

  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;
    
    const tasksByDate = new Map<string, { completed: number; total: number }>();

    tasks.forEach((task) => {
      totalTasks++;
      
      if (task.status === 'completed') {
        completedTasks++;
        
        // Group by date for the chart
        if (task.updated_at) {
          const date = new Date(task.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          
          const existing = tasksByDate.get(date) || { completed: 0, total: 0 };
          tasksByDate.set(date, {
            completed: existing.completed + 1,
            total: existing.total + 1,
          });
        }
      } else if (task.status === 'in_progress') {
        inProgressTasks++;
      } else if (task.status === 'pending') {
        pendingTasks++;
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Sort dates - show all time
    const sortedDates = Array.from(tasksByDate.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([date, data]) => ({
        date,
        ...data,
      }));

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      tasksByDate: sortedDates,
    };
  }, [tasks]);

  const maxCompleted = Math.max(...stats.tasksByDate.map((d) => d.completed), 1);

  return (
    <div className="mb-5 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-medium">
              Total Tasks
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.totalTasks}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-medium">
              Completed
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.completedTasks}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-medium">
              Completion Rate
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.completionRate}%
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-medium">
              In Progress
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
            {stats.inProgressTasks}
          </div>
        </div>
      </div>

      {/* Tasks Completed Over Time Chart */}
      {stats.tasksByDate.length > 0 && (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              Tasks Completed Over Time
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              (All time)
            </span>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end gap-2 h-32">
            {stats.tasksByDate.map((item, index) => {
              const heightPercentage = (item.completed / maxCompleted) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] font-mono font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      {item.completed}
                    </span>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-t relative">
                      <div
                        className="w-full bg-neutral-900 dark:bg-neutral-100 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(heightPercentage, 8)}px` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-600 dark:text-neutral-400 font-mono text-center">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

PlanStatsSection.displayName = 'PlanStatsSection';

