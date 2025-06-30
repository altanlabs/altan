import { memo } from 'react';

import ExecutionsChart from '../../../sections/@dashboard/jobs/ExecutionsChart';
import { groupItemsByTime } from '../../../utils/groupby';

const ExecutionsByDayRenderer = (params) => {
  const { data } = params;

  const executions = data?.executions?.items
    ? groupItemsByTime(data.executions.items, 'daily')
    : [];

  const generateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange = [];
    while (start <= end) {
      dateRange.push(new Date(start).toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }
    return dateRange;
  };

  // Initialize earliestDate to today if there are no executions
  const today = new Date().toISOString().split('T')[0];
  const earliestDate =
    executions.length > 0
      ? executions.reduce((min, e) => (e?.x < min ? e?.x : min), executions[0].x)
      : today;

  const fullDateRange = generateDateRange(earliestDate, today);

  const filledExecutions = fullDateRange.map((date) => {
    const existingExecution = executions.find((e) => e.x === date);
    return existingExecution || { x: date, y: 0 };
  });

  return <ExecutionsChart executions={filledExecutions} />;
};

export default memo(ExecutionsByDayRenderer);
