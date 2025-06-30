import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: false });

export const isValidJSONFromSchema = (data, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(validate.errors);
  }
  return valid;
};

// Helper function to execute actions on the target object
const executeAction = (actionSetting, target) => {
  const actionMap = {
    delete: (obj, key) => {
      delete obj[key];
    },
    // Additional actions can be added here in the future
  };

  const action = actionMap[actionSetting.action];
  if (action) {
    actionSetting.keys.forEach((key) => action(target, key));
  }
};

// Helper to determine if a value is null, undefined, or an empty string
const isNullValue = (value) => ['', null, undefined].includes(value);

// Helper to determine if an object or array is empty
const isEmptyObject = (obj) => {
  if (isNullValue(obj)) return true;
  if (typeof obj !== 'object') return false;
  if (Array.isArray(obj)) return obj.every(isEmptyObject);
  if (Object.keys(obj).length === 0) return true;
  return Object.values(obj).every(isEmptyObject);
};

// Function to process commands on the target object
const processCommands = (commands, target) => {
  commands.forEach((setting) => {
    const processElem = (elem) => {
      if (elem[setting.match] && Array.isArray(setting.actions)) {
        setting.actions.forEach((actionSetting) => executeAction(actionSetting, elem));
      }
    };
    if (Array.isArray(target)) {
      target.forEach(processElem);
    } else {
      processElem(target);
    }
  });
};

// Main function to format data according to the schema
const formatData = (data, schema = {}) => {
  // console.log('@formatData: begin', data, schema);
  return Object.entries(data)
    .filter(([, value]) => !isNullValue(value))
    .reduce((acc, [key, value]) => {
      const fieldSchema = schema[key] || {};
      const {
        'x-rename': xRename,
        properties,
        items,
        type,
        'x-commands': commands,
        'x-unwrap-before-server': unwrapBeforeServer,
        'x-nested-in': nestedIn,
      } = fieldSchema;

      const persistingKey = xRename || key;
      const nestedSchema = properties || items?.properties;

      // Recursively format nested objects or arrays
      const isValidString = !!value && typeof value === 'string';
      const isVar = isValidString && value.startsWith('{{') && value.endsWith('}}');
      if (isVar) {
        acc[persistingKey] = value;
      } else if (nestedSchema) {
        if (typeof value === 'object' && Array.isArray(value)) {
          acc[persistingKey] = value
            .map((item) => formatData(item, nestedSchema))
            .filter((v) => !isEmptyObject(v));
        } else {
          const formattedValue = formatData(value, nestedSchema);
          if (!isEmptyObject(formattedValue)) {
            acc[persistingKey] = formattedValue;
          }
        }
      } else {
        if (isEmptyObject(value)) {
          // Remove key if value is empty
        } else if (
          typeof value === 'string' &&
          (['object', 'array'].includes(type) || key === 'meta_data')
        ) {
          // Parse strings that should be objects or arrays
          try {
            acc[persistingKey] = JSON.parse(value);
          } catch (e) {
            console.warn(`Error parsing ${key}: ${e.message}. Using original value.`);
            acc[persistingKey] = value;
          }
        } else {
          acc[persistingKey] = value;
        }
      }

      // Further format nested objects without a specific schema
      if (
        typeof acc[persistingKey] === 'object' &&
        !Array.isArray(acc[persistingKey]) &&
        acc[persistingKey] !== null
      ) {
        acc[persistingKey] = formatData(acc[persistingKey], {});
      }

      // Process any commands specified in the schema
      if (acc[persistingKey] && Array.isArray(commands)) {
        processCommands(commands, acc[persistingKey]);
      }

      // Handle nesting of properties as specified by 'x-nested-in'
      if (nestedIn && !isNullValue(acc[persistingKey])) {
        const nestedType = schema[nestedIn]?.type;
        if (nestedType === 'object') {
          acc[nestedIn] = acc[nestedIn] || {};
          acc[nestedIn][persistingKey] = acc[persistingKey];
        } else if (nestedType === 'array') {
          acc[nestedIn] = acc[nestedIn] || [];
          acc[nestedIn].push(acc[persistingKey]);
        } else {
          acc[nestedIn] = acc[persistingKey];
        }
        delete acc[persistingKey];
      }

      // Unwrap or rename properties before sending to the server
      if (unwrapBeforeServer && acc[persistingKey]) {
        Object.assign(acc, acc[persistingKey]);
        delete acc[persistingKey];
      } else if (xRename && !isNullValue(acc[key])) {
        acc[persistingKey] = acc[key];
        delete acc[key];
      }

      // Remove key if the value is empty after processing
      if (isEmptyObject(acc[persistingKey])) {
        delete acc[persistingKey];
      }

      return acc;
    }, {});
};

export default formatData;

// const executeAction = (actionSetting, target) => {
//   const actionMap = {
//     delete: (v, key) => {
//       delete v[key];
//     },
//     // You can add more actions here in the future
//   };

//   const action = actionMap[actionSetting.action];
//   if (action) {
//     actionSetting.keys.forEach((k) => action(target, k));
//   }
// };

// // Helper to determine if an object is empty (all keys are invalid or empty)
// const isNullValue = (value) => ["", null, undefined].includes(value);

// const isEmptyObject = (obj) => {
//   if (isNullValue(obj)) {
//     return true;
//   }
//   if (typeof obj !== 'object') return false;
//   if (Array.isArray(obj)) {
//     return !obj.length;
//   }
//   if (!Object.keys(obj)) {
//     return true;
//   }
//   return Object.values(obj).every(isEmptyObject);
// };

// const processCommands = (commands, target) => {
//   commands.forEach((setting) => {
//     const processElem = (elem) => {
//       if (elem[setting.match] && Array.isArray(setting.actions)) {
//         setting.actions.forEach((actionSetting) => executeAction(actionSetting, elem));
//       }
//     };

//     if (Array.isArray(target)) {
//       target.forEach(processElem);
//     } else {
//       processElem(target);
//     }
//   });
// };

// const formatData = (data, schema = null) => {
//   return Object.entries(data)
//     .filter(([_, v]) => !["", null, undefined].includes(v))
//     .reduce((acc, [key, value]) => {
//       const {
//         "x-rename": xRename,
//         properties,
//         items,
//         type,
//         "x-commands": commands,
//         "x-unwrap-before-server": unwrapBeforeServer,
//         "x-nested-in": nestedIn,
//       } = (schema ?? {})[key] || {};

//       const persistingKey = xRename ?? key;
//       const nestedSchema = properties || items?.properties;
//       // console.log("schema", schema);
//       // console.log("persistingKey", persistingKey);
//       // console.log("nestedSchema", nestedSchema);

//       if (nestedSchema) {
//         acc[persistingKey] = Array.isArray(value)
//           ? value.map((item) => formatData(item, nestedSchema)).filter((v) => !isEmptyObject(v))
//           : formatData(value, nestedSchema);

//         if (isEmptyObject(acc[persistingKey])) {
//           delete acc[persistingKey];
//         }
//       } else {
//         if (isEmptyObject(value)) {
//           delete acc[persistingKey];
//         } else if (typeof value === "string" && (["object", "array"].includes(type) || key === "meta_data")) {
//           try {
//             acc[persistingKey] = JSON.parse(value);
//           } catch (e) {
//             console.warn(`Error parsing ${key}: ${e.message}. Using original value.`);
//             acc[persistingKey] = value;
//           }
//         } else {
//           acc[persistingKey] = value;
//         }
//       }

//       if (typeof acc[persistingKey] === "object" && !Array.isArray(acc[persistingKey])) {
//         acc[persistingKey] = formatData(acc[persistingKey], {});
//       }

//       // Process commands on the current object
//       if (!!acc[persistingKey] && commands && Array.isArray(commands)) {
//         processCommands(commands, acc[persistingKey]);
//       }

//       // Handle "x-nested-in" functionality
//       if (nestedIn && acc[persistingKey]) {
//         const nestedType = schema[nestedIn]?.type;
//         if (nestedType === "object") {
//           acc[nestedIn] = acc[nestedIn] || {};
//           acc[nestedIn][persistingKey] = acc[persistingKey];
//           delete acc[persistingKey];
//         } else if (nestedType === "array") {
//           acc[nestedIn] = acc[nestedIn] || [];
//           acc[nestedIn].push(acc[persistingKey]);
//           delete acc[persistingKey];
//         }
//       }

//       // Handle unwrapping or renaming
//       if (persistingKey !== key || unwrapBeforeServer) {
//         if (unwrapBeforeServer) {
//           Object.assign(acc, acc[persistingKey]);
//         }
//         delete acc[persistingKey];
//       }

//       if (isEmptyObject(acc[persistingKey])) {
//         delete acc[persistingKey];
//       }

//       console.log("acc persistingKey", persistingKey, isEmptyObject(acc[persistingKey]), acc[persistingKey]);

//       return acc;
//     }, {});
// };

// export default formatData;

// const executeAction = (actionSetting, target) => {
//   const actionMap = {
//     delete: (v, key) => {
//       delete v[key];
//     },
//   };
//   const action = actionMap[actionSetting.action];
//   if (action) {
//     actionSetting.keys.forEach((k) => action(target, k));
//   }
// };

// const processCommands = (commands, target) => {
//   commands.forEach((setting) => {
//     if (Array.isArray(target)) {
//       target.forEach((elem) => {
//         if (elem[setting.match] && Array.isArray(setting.actions)) {
//           setting.actions.forEach((actionSetting) =>
//             executeAction(actionSetting, elem)
//           );
//         }
//       });
//     } else if (target[setting.match] && Array.isArray(setting.actions)) {
//       setting.actions.forEach((actionSetting) =>
//         executeAction(actionSetting, target)
//       );
//     }
//   });
// };

// const formatData = (data, schema) => {
//   console.log("data", data);
//   console.log("schema", schema);
//   return Object.entries(data)
//     .filter(
//       ([, v]) => !["", null, undefined].includes(v) || !!v._is_empty_object
//     )
//     .reduce((acc, [key, value]) => {
//       const {
//         "x-rename": xRename,
//         properties,
//         items,
//         type,
//         "x-commands": commands,
//         "x-unwrap-before-server": unwrapBeforeServer,
//         "x-nested-in": nestedIn,
//       } = schema[key] || {};
//       const persistingKey = xRename ?? key;
//       const nestedSchema = properties || items?.properties;

//       if (nestedSchema) {
//         acc[persistingKey] = Array.isArray(value)
//           ? value.map((item) => formatData(item, nestedSchema))
//           : formatData(value, nestedSchema);
//       } else {
//         if (["", "", undefined, null].includes(value)) {
//           delete acc[persistingKey];
//         } else if (
//           typeof value === "string" &&
//           (["object", "array"].includes(type) || key === "meta_data")
//         ) {
//           try {
//             acc[persistingKey] = JSON.parse(value);
//           } catch (e) {
//             console.warn(
//               `Error parsing ${key}: ${e.message}. Using original value.`
//             );
//             acc[persistingKey] = value;
//           }
//         } else {
//           acc[persistingKey] = value;
//         }
//       }

//       if (!!acc[persistingKey] && commands && Array.isArray(commands)) {
//         processCommands(commands, acc[persistingKey]);
//       }

//       if (nestedIn && acc[persistingKey]) {
//         if (schema[nestedIn]?.type === "object") {
//           if (!acc[nestedIn]) {
//             acc[nestedIn] = {};
//           }
//           acc[nestedIn][persistingKey] = acc[persistingKey];
//           delete acc[persistingKey];
//         }
//         if (schema[nestedIn]?.type === "array") {
//           if (!acc[nestedIn]) {
//             acc[nestedIn] = [];
//           }
//           acc[nestedIn].push(acc[persistingKey]);
//           delete acc[persistingKey];
//         }
//       }

//       if (
//         persistingKey !== key ||
//         acc[key] === undefined ||
//         unwrapBeforeServer
//       ) {
//         if (unwrapBeforeServer) {
//           Object.assign(acc, acc[key]);
//         }
//         delete acc[key];
//       }

//       acc._is_empty_object = true;
//       if (Object.values(acc).some((v) => ["", null, undefined].includes(v))) {
//         acc._is_empty_object = false;
//       }

//       return acc;
//     }, {});
// };

// export default formatData;

// const formatData = (data, schema) => {
//   return Object.entries(data).reduce((acc, [key, value]) => {
//     const {
//       'x-rename': xRename,
//       properties,
//       items,
//       type,
//       'x-commands': commands,
//       'x-unwrap-before-server': unwrapBeforeServer,
//       'x-nested-in': nestedIn
//     } = schema[key] || {};
//     const persistingKey = xRename ?? key;
//     const nestedSchema = properties || items?.properties;

//     if (nestedSchema) {
//       acc[persistingKey] = Array.isArray(value)
//         ? value.map(item => formatData(item, nestedSchema))
//         : formatData(value, nestedSchema);
//     } else {
//       if (["", '', undefined, null].includes(value)) {
//         delete acc[persistingKey];
//       } else if (typeof value === 'string' && ["object", "array"].includes(type)) {
//         try {
//           acc[persistingKey] = JSON.parse(value);
//         } catch (e) {
//           throw new Error(`Error parsing ${key}: ${e.message}`);
//         }
//       } else {
//         acc[persistingKey] = value;
//       }
//     }

//     if (!!acc[persistingKey] && commands && Array.isArray(commands)) {
//       processCommands(commands, acc[persistingKey]);
//     }

//     if (nestedIn && acc[persistingKey]) {
//       if (schema[nestedIn]?.properties?.type === "object") {
//         if (!acc[nestedIn]) {
//           acc[nestedIn] = {};
//         }
//         acc[nestedIn][persistingKey] = acc[persistingKey];
//         delete acc[persistingKey];
//       }
//       if (schema[nestedIn]?.properties?.type === "array") {
//         if (!acc[nestedIn]) {
//           acc[nestedIn] = [];
//         }
//         acc[nestedIn].push(acc[persistingKey]);
//         delete acc[persistingKey];
//       }
//     }

//     if (persistingKey !== key || acc[key] === undefined || unwrapBeforeServer) {
//       if (unwrapBeforeServer) {
//         Object.assign(acc, acc[key]);
//       }
//       delete acc[key];
//     }

//     return acc;
//   }, {});
// };
