export const checkObjectsEqual = (prev, next) => {
  if (!prev && !next) {
    return true;
  }
  if ((!prev && !!next) || (!!prev && !next)) {
    return false;
  }
  return JSON.stringify(prev) === JSON.stringify(next);
};

export const checkArraysEqualShallow = (prev, next) => {
  if (!prev && !next) {
    return true;
  }
  if ((!prev && !!next) || (!!prev && !next)) {
    return false;
  }
  return prev.length === next.length;
};

export const checkArraysEqualsProperties = (property) => (prev, next) => {
  if (!checkArraysEqualShallow(prev, next)) {
    return false;
  }
  const getPropertyValues = (arr) =>
    property
      ? (!!Array.isArray(arr) ? arr : [])
          .map((e) => e[property])
          .filter((value) => value !== undefined) // filter out undefined values
      : !!Array.isArray(arr)
          ? arr.slice()
          : []; // make a copy of the array if no property

  const prevValues = getPropertyValues(prev).sort((a, b) => a - b);
  const nextValues = getPropertyValues(next).sort((a, b) => a - b);

  if (prevValues.length !== nextValues.length) {
    return false;
  }
  return prevValues.every(
    (value, i) => JSON.stringify(value ?? {}) === JSON.stringify(nextValues[i] ?? {}),
  );
};

const isArray = (value) => Array.isArray(value);

const isEmptyObject = (obj) =>
  obj && typeof obj === 'object' && !isArray(obj) && Object.keys(obj).length === 0;

export const filterOutPropertiesFromObject = (object, properties) =>
  Object.entries(object).reduce((acc, [key, value]) => {
    if (!properties.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});

export const getNestedProperty = (stateObj, attribute) => {
  if (!attribute?.length) {
    return stateObj;
  }
  return attribute.split('.').reduce((prev, attr) => prev?.[attr], stateObj);
};
