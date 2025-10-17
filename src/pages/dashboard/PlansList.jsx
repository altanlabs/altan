import { memo, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Iconify from '../../components/iconify/Iconify';
import CustomMarkdown from '../../components/messages/CustomMarkdown';
import { 
  fetchPlansByRoomId, 
  selectPlansByRoom, 
  selectRoomPlansLoading, 
  selectRoomPlansError 
} from '../../redux/slices/tasks';

const PlansList = ({ roomId }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { altanerId } = useParams();
  
  const plans = useSelector(selectPlansByRoom(roomId));
  const isLoading = useSelector(selectRoomPlansLoading(roomId));
  const error = useSelector(selectRoomPlansError(roomId));

  useEffect(() => {
    if (roomId) {
      dispatch(fetchPlansByRoomId(roomId));
    }
  }, [roomId, dispatch]);

  // Calculate progress for each plan
  const plansWithProgress = useMemo(() => {
    return plans.map(plan => {
      const tasks = plan.tasks || [];
      const total = tasks.length;
      const completed = tasks.filter(task => {
        const status = task.status?.toLowerCase();
        return status === 'completed' || status === 'done';
      }).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...plan,
        progress: { completed, total, percentage }
      };
    });
  }, [plans]);

  const handlePlanClick = (planId) => {
    history.push(`/project/${altanerId}/plans/${planId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'running':
      case 'in_progress':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
      case 'pending':
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg p-8 max-w-md">
              <div className="flex items-center gap-3">
                <Iconify icon="mdi:loading" className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-base text-gray-600 dark:text-gray-400">Loading plans...</span>
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
                  <p className="text-base font-medium text-red-700 dark:text-red-300 mb-2">Failed to load plans</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden pb-2 px-2">
        <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg p-12 max-w-md text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Iconify icon="mdi:road-variant" className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Plans Yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start a conversation in the chat to create your first plan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden pb-2 px-2">
      <div className="flex flex-col h-full overflow-auto border border-divider rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto w-full p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Iconify
                icon="mdi:road-variant"
                className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0"
              />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Plans
              </h1>
            </div>
            <p className="ml-11 text-sm text-gray-600 dark:text-gray-400">
              View and manage all plans for this project
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plansWithProgress.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanClick(plan.id)}
                className="bg-white/90 dark:bg-[#1c1c1c]/90 border border-gray-200/30 dark:border-gray-700/30 rounded-2xl backdrop-blur-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-400/50 dark:hover:border-blue-500/50"
              >
                {/* Plan Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {plan.title || 'Untitled Plan'}
                    </h3>
                    {plan.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      <CustomMarkdown text={plan.description} />
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {plan.progress.completed} / {plan.progress.total} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${plan.progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Iconify icon="mdi:calendar" className="w-4 h-4" />
                      <span>Created {formatDate(plan.created_at)}</span>
                    </div>
                    {plan.estimated_minutes && (
                      <div className="flex items-center gap-1.5">
                        <Iconify icon="mdi:clock-outline" className="w-4 h-4" />
                        <span>{plan.estimated_minutes} min</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Button */}
                <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/30 dark:border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      View Plan
                    </span>
                    <Iconify 
                      icon="mdi:chevron-right" 
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PlansList);

