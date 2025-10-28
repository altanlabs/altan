import { m } from 'framer-motion';
import React, { useMemo, memo } from 'react';

import { AgentOrbAvatar } from '../../../../components/agents/AgentOrbAvatar';
import Iconify from '../../../../components/iconify/Iconify';
import { agentColors } from '../../../../components/plan/planUtils';

const DemoPlanWidget = ({ plan, onApprove, showApproveButton = false }) => {
  const sortedTasks = useMemo(() => {
    if (!plan?.tasks) return [];
    return [...plan.tasks].sort((a, b) => (a.priority || 999) - (b.priority || 999));
  }, [plan]);

  const getTaskIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'mdi:check-circle';
      case 'running':
        return 'mdi:loading';
      default:
        return 'mdi:circle-outline';
    }
  };

  const getTaskIconColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[700px] mx-auto"
    >
      <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl backdrop-blur-lg overflow-hidden shadow-xl">
        {/* Plan Header */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Iconify
                  icon="mdi:road-variant"
                  className="w-6 h-6 text-blue-400 flex-shrink-0"
                />
                <h3 className="text-xl font-bold text-white truncate">
                  {plan.title || 'Untitled Plan'}
                </h3>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>

            {/* Approve Button - Top Right with Pulse Effect */}
            {showApproveButton && !plan.is_approved && (
              <div className="relative flex-shrink-0">
                {/* Pulsing glow ring */}
                <m.div
                  className="absolute inset-0 rounded-full bg-green-500/40 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: 'calc(100% + 16px)',
                    height: 'calc(100% + 16px)',
                    left: '-8px',
                    top: '-8px',
                  }}
                />

                <m.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={onApprove}
                  className="relative px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg flex items-center gap-2 transition-colors duration-200"
                >
                  <Iconify icon="mdi:check-circle" className="w-5 h-5" />
                  <span>Approve Plan</span>
                </m.button>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        {sortedTasks.length > 0 && (
          <div className="divide-y divide-gray-700/50">
            {sortedTasks.map((task, index) => (
              <m.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="px-6 py-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <Iconify
                    icon={getTaskIcon(task.status)}
                    className={`w-5 h-5 ${getTaskIconColor(task.status)} ${
                      task.status?.toLowerCase() === 'running' ? 'animate-spin' : ''
                    } flex-shrink-0`}
                  />

                  {/* Assigned Agent Avatar */}
                  {task.assigned_agent_name && agentColors[task.assigned_agent_name] && (
                    <div className="flex-shrink-0">
                      <AgentOrbAvatar
                        size={24}
                        agentId={task.assigned_agent_name}
                        colors={agentColors[task.assigned_agent_name]}
                        isStatic={task.status?.toLowerCase() !== 'running'}
                        agentState={task.status?.toLowerCase() === 'running' ? 'thinking' : null}
                      />
                    </div>
                  )}

                  {/* Task Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate" title={task.task_name}>
                      {task.task_name || 'Untitled Task'}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        )}
      </div>
    </m.div>
  );
};

export default memo(DemoPlanWidget);
