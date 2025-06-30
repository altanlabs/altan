import { groupBy } from 'lodash';

const groupItemsByTime = (items, period, sumKey = null, transformFn = (value) => value) => {
  const grouped = groupBy(items, (client) => {
    const date = new Date(client.date_creation);
    switch (period) {
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'weekly':
        const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        return `${firstDayOfWeek.getFullYear()}-${String(firstDayOfWeek.getMonth() + 1).padStart(2, '0')}-${String(firstDayOfWeek.getDate()).padStart(2, '0')}`;
      case 'yearly':
        return `${date.getFullYear()}`;
      default: // daily
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  });

  return Object.keys(grouped)
    .map((date) => {
      if (sumKey) {
        // Apply the transformation function while summing the values for the given key
        const total = grouped[date]?.reduce((sum, item) => sum + transformFn(item[sumKey] || 0), 0);
        return { x: date, y: total };
      }
      return { x: date, y: grouped[date]?.length };
    })
    .sort((a, b) => new Date(a.x) - new Date(b.x));
};

export { groupItemsByTime };
