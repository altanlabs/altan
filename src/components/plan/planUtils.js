// Agent avatar mapping
export const agentAvatars = {
  Database:
    'https://api.altan.ai/platform/media/3f19f77d-7144-4dc0-a30d-722e6eebf131?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Genesis:
    'https://api.altan.ai/platform/media/a4ac5478-b3ae-477d-b1eb-ef47e710de7c?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Flow: 'https://api.altan.ai/platform/media/11bbbc50-3e4b-4465-96d2-e8f316e92130?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Interface:
    'https://api.altan.ai/platform/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7',
  Cloud:
    'https://api.altan.ai/platform/media/56a7aab7-7200-4367-856b-df82b6fa3eee?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
  Services:
    'https://api.altan.ai/platform/media/22ed3f84-a15c-4050-88f0-d33cc891dc50?account_id=9d8b4e5a-0db9-497a-90d0-660c0a893285',
};

// Status priority for sorting
export const statusPriority = {
  running: 1,
  ready: 2,
  'to-do': 3,
  todo: 3,
  pending: 3,
  completed: 4,
  done: 4,
};

// Task icon helpers
export const getTaskIcon = (status) => {
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

export const getTaskIconColor = (status) => {
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

export const getTaskTextStyle = (status) => {
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

// Sort tasks by priority
export const sortTasksByPriority = (tasks) => {
  if (!tasks || tasks.length === 0) return [];

  return [...tasks].sort((a, b) => {
    const priorityA = statusPriority[a.status?.toLowerCase()] || 5;
    const priorityB = statusPriority[b.status?.toLowerCase()] || 5;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // If same status, sort by priority field
    return (a.priority || 999) - (b.priority || 999);
  });
};

// Calculate progress
export const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = tasks.filter((task) => {
    const status = task.status?.toLowerCase();
    return status === 'completed' || status === 'done';
  }).length;

  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
};

// Calculate estimated time for incomplete tasks
// Each task is estimated at 2.5 minutes
export const calculateEstimatedTime = (tasks) => {
  if (!tasks || tasks.length === 0) return null;

  const incompleteTasks = tasks.filter((task) => {
    const status = task.status?.toLowerCase();
    return status !== 'completed' && status !== 'done';
  }).length;

  if (incompleteTasks === 0) return null;

  const totalMinutes = incompleteTasks * 2.5;

  // Format the time nicely
  if (totalMinutes < 60) {
    return `~${totalMinutes.toFixed(1)} min`;
  } else {
    const hours = totalMinutes / 60;
    return `~${hours.toFixed(1)} hr`;
  }
};
