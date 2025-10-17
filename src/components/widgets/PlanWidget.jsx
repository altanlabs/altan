import { Tooltip, Typography } from '@mui/material';
import axios from 'axios';
import { memo, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { switchToThread } from '../../redux/slices/room';
import {
  fetchPlan,
  selectPlanById,
  selectPlanLoading,
  selectPlanError,
  setPlan,
} from '../../redux/slices/tasks';
import { useDispatch, useSelector } from '../../redux/store';
import Iconify from '../iconify/Iconify';

const PlanWidget = ({ planId }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const plan = useSelector(selectPlanById(planId));
  const isLoading = useSelector(selectPlanLoading(planId));
  const error = useSelector(selectPlanError(planId));
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

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

  const handleViewFullPlan = () => {
    // Extract altanerId from current pathname
    const match = location.pathname.match(/\/project\/([^/]+)/);
    const altanerId = match ? match[1] : null;

    if (!altanerId || !planId) {
      return;
    }

    // Navigate to plans route with explicit empty search to clear query params
    history.push({
      pathname: `/project/${altanerId}/plans/${planId}`,
      search: '', // Explicitly clear all query params
    });
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

      // If approving, automatically open the full plan view
      if (approve) {
        handleViewFullPlan();
      }
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
      <div className="w-full max-w-[700px] mx-auto my-4">
        <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg p-4">
          <div className="flex items-center gap-2">
            <Iconify
              icon="mdi:loading"
              className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading plan...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[700px] mx-auto my-4">
        <div className="bg-red-50/90 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl backdrop-blur-lg p-4">
          <div className="flex items-center gap-2">
            <Iconify
              icon="mdi:alert-circle"
              className="w-5 h-5 text-red-600 dark:text-red-400"
            />
            <span className="text-sm text-red-700 dark:text-red-300">Failed to load plan</span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="w-full max-w-[700px] mx-auto my-4">
      <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg overflow-hidden shadow-sm">
        {/* Plan Header */}
        <div className="px-4 py-3 border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Iconify
                  icon="mdi:format-list-checks"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {plan.title || 'Untitled Plan'}
                </h3>
              </div>
              {plan.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {plan.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {plan.is_approved && (
                <Tooltip title="Plan Approved">
                  <Iconify
                    icon="mdi:check-decagram"
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                  />
                </Tooltip>
              )}
              {/* View Full Plan Button */}
              <Tooltip title="View Full Plan">
                <button
                  onClick={handleViewFullPlan}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <div className="flex items-center gap-1.5">
                    <Iconify
                      icon="mdi:arrow-expand"
                      className="w-3.5 h-3.5"
                    />
                    <span>View Full</span>
                  </div>
                </button>
              </Tooltip>
              {/* Approve Button - Only show if not approved */}
              {!plan.is_approved && (
                <Tooltip title="Approve Plan">
                  <button
                    onClick={() => handleApprovePlan(true)}
                    disabled={isApproving}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <div className="flex items-center gap-1.5">
                        <Iconify
                          icon="mdi:loading"
                          className="w-3.5 h-3.5 animate-spin"
                        />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Iconify
                          icon="mdi:check-circle"
                          className="w-3.5 h-3.5"
                        />
                        <span>Approve</span>
                      </div>
                    )}
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
          {/* Show error if approve fails */}
          {approveError && (
            <div className="mt-2 px-2 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded text-xs text-red-700 dark:text-red-300">
              {approveError}
            </div>
          )}
        </div>

        {/* Tasks List */}
        {sortedTasks.length > 0 && (
          <div className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="px-4 py-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors duration-150"
              >
                <div className="flex items-center gap-2">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <Iconify
                      icon={getTaskIcon(task.status)}
                      className={`w-4 h-4 ${getTaskIconColor(task.status)} ${
                        task.status?.toLowerCase() === 'running' ? 'animate-spin' : ''
                      }`}
                    />
                  </div>

                  {/* Assigned Agent Avatar */}
                  {task.assigned_agent_name && agentAvatars[task.assigned_agent_name] && (
                    <div className="flex-shrink-0">
                      <Tooltip title={`Assigned to: ${task.assigned_agent_name}`}>
                        <img
                          src={agentAvatars[task.assigned_agent_name]}
                          alt={task.assigned_agent_name}
                          className="w-5 h-5 rounded-full border border-white/30 dark:border-gray-600/50 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Tooltip>
                    </div>
                  )}

                  {/* Task Name */}
                  <div className="flex-1 min-w-0">
                    <Typography
                      variant="body2"
                      className={`font-medium truncate text-sm ${getTaskTextStyle(task.status)}`}
                      title={task.task_name}
                    >
                      {task.task_name || 'Untitled Task'}
                    </Typography>
                  </div>

                  {/* Open Thread Button */}
                  {task.subthread_id && (
                    <div className="flex-shrink-0">
                      <Tooltip title={`Open task thread: ${task.task_name}`}>
                        <button
                          onClick={() => handleOpenSubthread(task)}
                          className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors group"
                        >
                          <Iconify
                            icon="mdi:open-in-new"
                            className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                          />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PlanWidget);
