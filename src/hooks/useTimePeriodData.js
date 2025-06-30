import { useState, useEffect } from 'react';

const useTimePeriodData = (filteredMembers, allSessions, timePeriod) => {
  const [data, setData] = useState({
    current: { members: null, sessions: null },
    previous: { members: null, sessions: null },
    percentageDiff: { members: null, sessions: null },
  });

  const generateDateRange = (startDate, endDate) => {
    const dateRange = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
  };

  const getTimePeriodDates = (period, isPrevious = false) => {
    let startDate, endDate;

    endDate = isPrevious ? new Date(new Date().setHours(0, 0, 0, 0)) : new Date();
    startDate = new Date(endDate);

    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - (isPrevious ? 2 : 1));
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - (isPrevious ? 14 : 7));
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - (isPrevious ? 2 : 1));
        break;
      default:
        throw new Error('Invalid time period');
    }

    return { startDate, endDate };
  };

  const calculatePercentageDifference = (current, previous) => {
    if (previous === null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  useEffect(() => {
    const { startDate, endDate } = getTimePeriodDates(timePeriod);
    const { startDate: prevStartDate, endDate: prevEndDate } = getTimePeriodDates(timePeriod, true);

    const dateRange = generateDateRange(startDate, endDate);
    const prevDateRange = generateDateRange(prevStartDate, prevEndDate);

    const mapDataToDateRange = (data, dateRange) => {
      const mappedData = dateRange.map((date) => {
        // Extract data for this particular date
        const dayData = data.filter((item) => {
          const itemDate = new Date(item.date_creation);
          return itemDate >= date && itemDate < new Date(date.getTime() + 86400000);
        });
        return { date, count: dayData.length };
      });
      return mappedData;
    };

    const currentMembersMapped = mapDataToDateRange(filteredMembers, dateRange);
    const previousMembersMapped = mapDataToDateRange(filteredMembers, prevDateRange);
    const currentSessionsMapped = mapDataToDateRange(allSessions, dateRange);
    const previousSessionsMapped = mapDataToDateRange(allSessions, prevDateRange);

    const aggregateData = (mappedData) => mappedData.reduce((sum, item) => sum + item.count, 0);

    const currentMembersCount = aggregateData(currentMembersMapped);
    const previousMembersCount = aggregateData(previousMembersMapped);
    const currentSessionsCount = aggregateData(currentSessionsMapped);
    const previousSessionsCount = aggregateData(previousSessionsMapped);

    setData({
      current: { members: currentMembersCount, sessions: currentSessionsCount },
      previous: { members: previousMembersCount, sessions: previousSessionsCount },
      percentageDiff: {
        members: calculatePercentageDifference(currentMembersCount, previousMembersCount),
        sessions: calculatePercentageDifference(currentSessionsCount, previousSessionsCount),
      },
    });
  }, [timePeriod, filteredMembers, allSessions]);

  return data;
};

export default useTimePeriodData;
