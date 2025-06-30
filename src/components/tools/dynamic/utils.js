export const checkNestedOfProperties = (schema) => {
  if (!schema || typeof schema !== 'object') return false;

  const keys = ['oneOf', 'allOf', 'anyOf'];
  for (const key of keys) {
    if (schema[key]) {
      return true;
    }
    // if (Array.isArray(schema[key])) {
    //   for (const subSchema of schema[key]) {
    //     if (subSchema.properties || subSchema.items?.properties) {
    //       return true;
    //     }
    //     if (checkNestedOfProperties(subSchema)) {
    //       return true;
    //     }
    //   }
    // }
  }
  return false;
};

export const checkHasProperties = (schema) => {
  if (!schema || typeof schema !== 'object') return false;

  if (schema.properties && Object.keys(schema.properties).length > 0) {
    return true;
  }

  if (
    schema.items?.type === 'object' &&
    schema.items.properties &&
    Object.keys(schema.items.properties).length > 0
  ) {
    return true;
  }

  if (checkNestedOfProperties(schema) || checkNestedOfProperties(schema.items)) {
    return true;
  }

  return false;
};

export const setNested = (obj, path, value) => {
  // let current = obj;
  // for (const elem of path.split(".")) {
  //   current = current[elem];
  // }
  // current = value;
  let i;
  path = path.split('.');
  for (i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  obj[path[i]] = value;
};

// export const getNested = (obj, path) => {
//   let current = obj;
//   for (const elem of path.split(".")) {
//     if (current) {
//       current = current[elem];
//     }
//   }
//   return current;
// }

export const getNested = (obj, path) => {
  let value = obj;
  const keys = path.split('.');

  for (const key of keys) {
    if (value) {
      if (typeof value === 'object' && !Array.isArray(value) && key in value) {
        value = value[key];
      } else if (Array.isArray(value) && key.startsWith('[') && key.endsWith(']')) {
        const indexStr = key.slice(1, -1); // Remove brackets
        if (indexStr) {
          try {
            const index = parseInt(indexStr, 10);
            value = value[index];
          } catch (e) {
            throw new Error('Invalid index');
          }
        } else {
          value = null;
          break;
        }
      } else {
        value = null;
        break;
      }
    } else {
      value = null; // or some default value
      break;
    }
  }

  return value;
};

export const findPathAfterIndex = (inputString) => {
  // Regular expression to match ".<positive integer>."
  const regex = /\.\d+\./;

  // Find the match in the input string
  const match = inputString.match(regex);

  // If a match is found, extract the path after the match
  if (match) {
    const index = match.index + match[0].length;
    return inputString.substring(index);
  }

  // If no match is found, return an empty string or a message
  return null;
};
