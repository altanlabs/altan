import { useEffect, useState } from 'react';

const RunningTimer = ({ startTime, endTime, isRunning = true }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // If task is completed, calculate static elapsed time
    if (!isRunning && startTime && endTime) {
      const totalElapsed = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
      setElapsed(totalElapsed);
      return; // Don't set up interval for completed tasks
    }

    // For running tasks, calculate initial elapsed time from startTime to now
    const initialElapsed = startTime ? (Date.now() - new Date(startTime).getTime()) / 1000 : 0.2;
    setElapsed(initialElapsed);

    // Update every 100ms for smooth counting (only for running tasks)
    const interval = setInterval(() => {
      const newElapsed = startTime
        ? (Date.now() - new Date(startTime).getTime()) / 1000
        : (prev) => prev + 0.1;

      setElapsed(typeof newElapsed === 'function' ? newElapsed : newElapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, endTime, isRunning]);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <span className="text-sm font-mono font-medium text-blue-700 dark:text-blue-300 tabular-nums">
      {formatTime(elapsed)}
    </span>
  );
};

export default RunningTimer;
