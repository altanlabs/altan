export const checkObjectsEqual = (prev: unknown, next: unknown): boolean => {
  if (!prev && !next) {
    return true;
  }
  if ((!prev && !!next) || (!!prev && !next)) {
    return false;
  }
  return JSON.stringify(prev) === JSON.stringify(next);
};

export const checkArraysEqualShallow = <T>(prev: T[] | null | undefined, next: T[] | null | undefined): boolean => {
  if (!prev && !next) {
    return true;
  }
  if ((!prev && !!next) || (!!prev && !next)) {
    return false;
  }
  return prev.length === next.length;
};

export const checkArraysEqualsProperties = <T extends Record<string, any>>(
  property?: keyof T | Array<keyof T>
) => (prev: T[] | null | undefined, next: T[] | null | undefined): boolean => {
  if (!checkArraysEqualShallow(prev, next)) {
    return false;
  }
  
  // Handle multiple properties
  if (Array.isArray(property)) {
    const properties = property;
    const getPropertyValues = (arr: T[] | null | undefined): any[] =>
      (Array.isArray(arr) ? arr : [])
        .map((e) => {
          const obj: Record<string, any> = {};
          properties.forEach((prop) => {
            if (e[prop] !== undefined) {
              obj[prop as string] = e[prop];
            }
          });
          return obj;
        });
    
    const prevValues = getPropertyValues(prev);
    const nextValues = getPropertyValues(next);
    
    if (prevValues.length !== nextValues.length) {
      return false;
    }
    return prevValues.every(
      (value, i) => JSON.stringify(value) === JSON.stringify(nextValues[i]),
    );
  }
  
  // Handle single property
  const getPropertyValues = (arr: T[] | null | undefined): any[] =>
    property
      ? (Array.isArray(arr) ? arr : [])
          .map((e) => e[property as keyof T])
          .filter((value) => value !== undefined) // filter out undefined values
      : Array.isArray(arr)
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

const isArray = (value: unknown): value is any[] => Array.isArray(value);

const isEmptyObject = (obj: unknown): boolean =>
  obj !== null && typeof obj === 'object' && !isArray(obj) && Object.keys(obj).length === 0;

export const filterOutPropertiesFromObject = <T extends Record<string, any>>(
  object: T,
  properties: string[]
): Partial<T> => {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (!properties.includes(key)) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

export const getNestedProperty = <T = any>(stateObj: any, attribute: string | null | undefined): T | any => {
  if (!attribute?.length) {
    return stateObj;
  }
  return attribute.split('.').reduce((prev, attr) => prev?.[attr], stateObj);
};

