import { Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import { memo, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { TextShimmer } from '../../components/aceternity/text/text-shimmer.tsx';
import Iconify from '../../components/iconify/Iconify';
import CustomMarkdown from '../../components/messages/CustomMarkdown';
import { switchToThread } from '../../redux/slices/room';
import { fetchPlan, selectPlanById, selectPlanLoading, selectPlanError, setPlan } from '../../redux/slices/tasks';
import { useDispatch, useSelector } from '../../redux/store';

const Plan = ({ planId }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const plan = useSelector(selectPlanById(planId));
  const isLoading = useSelector(selectPlanLoading(planId));
  const error = useSelector(selectPlanError(planId));
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  // Agent avatar mapping
  const agentAvatars = {
    Database:
      'https://api.altan.ai/platform/media/3f19f77d-7144-4dc0-a30d-722e6eebf131?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Genesis:
      'https://api.altan.ai/platform/media/a4ac5478-b3ae-477d-b1eb-ef47e710de7c?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Flow: 'https://api.altan.ai/platform/media/11bbbc50-3e4b-4465-96d2-e8f316e92130?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Interface:
      'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
    Cloud:
      'https://api.altan.ai/platform/media/56a7aab7-7200-4367-856b-df82b6fa3eee?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
    Functions:
      'https://api.altan.ai/platform/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  };

  useEffect(() => {
    if (planId && !plan && !isLoading && !error) {
      dispatch(fetchPlan(planId));
    }
  }, [planId, plan, isLoading, error, dispatch]);

  // Sort tasks by priority
  const sortedTasks = useMemo(() => {
    if (!plan?.tasks || plan.tasks.length === 0) return [];

    const statusPriority = {
      running: 1,
      ready: 2,
      'to-do': 3,
      todo: 3,
      pending: 3,
      completed: 4,
      done: 4,
    };

    return [...plan.tasks].sort((a, b) => {
      const priorityA = statusPriority[a.status?.toLowerCase()] || 5;
      const priorityB = statusPriority[b.status?.toLowerCase()] || 5;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // If same status, sort by priority field
      return (a.priority || 999) - (b.priority || 999);
    });
  }, [plan?.tasks]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!sortedTasks || sortedTasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = sortedTasks.filter((task) => {
      const status = task.status?.toLowerCase();
      return status === 'completed' || status === 'done';
    }).length;

    const total = sortedTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [sortedTasks]);

  const handleOpenSubthread = (task) => {
    if (task.subthread_id) {
      dispatch(
        switchToThread({
          threadId: task.subthread_id,
          threadName: task.task_name || 'Task Thread',
        }),
      );
    }
  };

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

  const handleClose = () => {
    history.goBack();
  };

  const handleApprovePlan = async (approve) => {
    if (!plan) return;

    setIsApproving(true);
    setApproveError(null);

    try {
      await axios.post(`https://cagi.altan.ai/plans/${planId}/approve`, {
        approve,
      });

      // Update plan in Redux
      const updatedPlan = {
        ...plan,
        is_approved: approve,
        status: approve ? 'approved' : plan.status,
      };

      dispatch(setPlan({ plan: updatedPlan }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve plan';
      setApproveError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

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
        return 'text-green-600 dark:text-green-400';
      case 'ready':
        return 'text-amber-600 dark:text-amber-400';
      case 'running':
        return 'text-blue-600 dark:text-blue-400';
      case 'to-do':
      case 'todo':
      case 'pending':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getTaskTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'text-gray-600 dark:text-gray-400 line-through';
      case 'ready':
        return 'text-amber-700 dark:text-amber-300 font-medium';
      case 'to-do':
      case 'todo':
      case 'pending':
      case 'running':
        return 'text-gray-900 dark:text-gray-100';
      default:
        return 'text-gray-900 dark:text-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg p-8 max-w-md">
              <div className="flex items-center gap-3">
                <Iconify icon="mdi:loading" className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-base text-gray-600 dark:text-gray-400">Loading plan...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl backdrop-blur-lg p-8 max-w-md">
              <div className="flex flex-col items-center gap-3 text-center">
                <Iconify icon="mdi:alert-circle" className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-base font-medium text-red-700 dark:text-red-300 mb-2">Failed to load plan</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="w-full h-full relative overflow-hidden pb-2 px-2">
      <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl">
        <div className="max-w-5xl mx-auto w-full p-6">
          {/* Header with Close Button */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Iconify
                  icon="mdi:road-variant"
                  className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0"
                />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {plan.title || 'Untitled Plan'}
                </h1>
              </div>
              {plan.description && (
                <div className="ml-11 text-sm">
                  <CustomMarkdown text={plan.description} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Approve Button - Only show if not approved */}
              {!plan.is_approved && (
                <Tooltip title="Approve Plan">
                  <button
                    onClick={() => handleApprovePlan(true)}
                    disabled={isApproving}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <div className="flex items-center gap-2">
                        <Iconify icon="mdi:loading" className="w-4 h-4 animate-spin" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Iconify icon="mdi:check-circle" className="w-4 h-4" />
                        <span>Approve Plan</span>
                      </div>
                    )}
                  </button>
                </Tooltip>
              )}
              {/* Close Button */}
              <Tooltip title="Close Plan View">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Iconify icon="mdi:close" className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Show error if approve fails */}
          {approveError && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-700 dark:text-red-300">
              {approveError}
            </div>
          )}
          {/* Roadmap */}
          <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Roadmap</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {progress.completed} of {progress.total} completed
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{progress.percentage}%</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            {sortedTasks.length > 0 ? (
              <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                {sortedTasks.map((task) => {
                const isExpanded = expandedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    className="transition-colors duration-150"
                  >
                    <div
                      className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 cursor-pointer"
                      onClick={() => toggleTaskExpansion(task.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Expand/Collapse Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <Iconify
                            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                            className="w-5 h-5 text-gray-400 transition-transform duration-200"
                          />
                        </div>

                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                          <Iconify
                            icon={getTaskIcon(task.status)}
                            className={`w-5 h-5 ${getTaskIconColor(task.status)} ${
                              task.status?.toLowerCase() === 'running' ? 'animate-spin' : ''
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Task Name and Agent */}
                          <div className="flex items-center gap-2">
                            {task.assigned_agent_name && agentAvatars[task.assigned_agent_name] && (
                              <Tooltip title={`Assigned to: ${task.assigned_agent_name}`}>
                                <img
                                  src={agentAvatars[task.assigned_agent_name]}
                                  alt={task.assigned_agent_name}
                                  className="w-6 h-6 rounded-full border border-white/30 dark:border-gray-600/50 shadow-sm"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </Tooltip>
                            )}
                            {task.status?.toLowerCase() === 'running' ? (
                              (() => {
                                try {
                                  const taskName = task?.task_name;
                                  const safeTaskName =
                                    taskName !== null && taskName !== undefined && taskName !== ''
                                      ? String(taskName).trim()
                                      : 'Running task...';

                                  if (!safeTaskName || safeTaskName.length === 0) {
                                    return (
                                      <span className="text-base font-medium">
                                        Running task...
                                      </span>
                                    );
                                  }

                                  return (
                                    <TextShimmer
                                      className="text-base font-medium"
                                      duration={2}
                                    >
                                      {safeTaskName}
                                    </TextShimmer>
                                  );
                                } catch (error) {
                                  // eslint-disable-next-line no-console
                                  console.error('TextShimmer error in Plan:', error, task);
                                  return (
                                    <span className="text-base font-medium">
                                      Task Error
                                    </span>
                                  );
                                }
                              })()
                            ) : (
                              <Typography
                                variant="body1"
                                className={`font-medium text-base ${getTaskTextStyle(task.status)}`}
                              >
                                {task.task_name || 'Untitled Task'}
                              </Typography>
                            )}
                          </div>

                          {/* Task Metadata - Always Visible */}
                          {!isExpanded && (
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {task.summary && (
                                <span className="truncate max-w-md">{task.summary}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* View Live Conversation Button */}
                        {task.subthread_id && (
                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSubthread(task);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group ${
                                task.status?.toLowerCase() === 'running'
                                  ? 'bg-blue-50/50 dark:bg-blue-900/10 shadow-sm'
                                  : 'bg-white/50 dark:bg-gray-800/50'
                              }`}
                            >
                              <Iconify
                                icon="mdi:chat-processing-outline"
                                className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110 ${
                                  task.status?.toLowerCase() === 'running' ? 'animate-pulse' : ''
                                }`}
                              />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                {task.status?.toLowerCase() === 'running' ? 'View Live' : 'View Chat'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-6 pb-4 pl-20 bg-gray-50/30 dark:bg-gray-800/20">
                        {/* Task Description */}
                        {task.task_description && (
                          <div className="mb-3 text-sm">
                            <CustomMarkdown text={task.task_description} />
                          </div>
                        )}

                        {/* Task Metadata */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {task.summary && (
                            <span className="truncate max-w-md">{task.summary}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <Iconify icon="mdi:road-variant" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No items in this roadmap</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Plan);
