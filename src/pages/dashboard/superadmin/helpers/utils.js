export const getTimestamp = () => new Date().toISOString();

export const getAllKeys = (data) => [...new Set(data.flatMap(Object.keys))];
