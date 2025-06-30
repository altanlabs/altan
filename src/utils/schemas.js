import { MODULE_SCHEMA } from '../components/flows/schemas/json';
import { getNested } from '../components/tools/dynamic/utils';

const resolveReference = (value, path) => {
  const segments = path.split('.');
  let current = value;
  let index = 0;
  while (index < segments.length && current) {
    if (typeof current === 'object' && segments[index] in current) {
      current = current[segments[index]];
    } else {
      current = null;
    }
    index++;
  }
  return current;
};

const unwrap = (specifications, instance, parent = null) => {
  const unwrapInfo = specifications['x-unwrap'];
  if (!unwrapInfo) {
    console.error('No unwrap information provided.');
    return {};
  }

  const { source, target } = unwrapInfo;
  if (!Array.isArray(source) || typeof target !== 'string') {
    console.error('Invalid unwrap configuration.');
    return {};
  }
  const result = source.reduce((acc, path) => {
    const segments = path.split('.');
    let current = null;
    if (segments[0] === '[$]') {
      current = parent;
      segments.shift();
    } else {
      current = instance;
    }
    for (const segment of segments) {
      if (segment in current) {
        current = current[segment];
      } else {
        // Path not found, skip to the next source
        return acc;
      }
    }
    // Merge the properties from the current path into the accumulator
    return { ...acc, ...current };
  }, {});

  // Assign the result to the target property in a new object
  return { [target]: result };
};

const DELAY_SCHEMA = {
  type: 'object',
  // description: 'Defines the delay before the next module execution.',
  properties: {
    type: {
      title: 'Type',
      type: 'string',
      description: 'Type of delay: fixed, random, or conditional.',
      enum: ['fixed', 'random'],
      default: 'fixed',
    },
    value: {
      title: 'Value',
      type: 'string',
      description:
        'Delay value in time units. For random, use comma separated values. For random, use an array [min, max].',
    },
    unit: {
      title: 'Unit',
      type: 'string',
      description: 'Time unit for the delay value.',
      enum: ['milliseconds', 'seconds', 'minutes', 'hours'],
      default: 'milliseconds',
    },
  },
};

const getModuleSchema = (module) => {
  if (!module) {
    return {};
  }
  const moduleSchema = MODULE_SCHEMA[module.type];
  if (!moduleSchema) {
    return {};
  }
  const filteredProperties = Object.entries(moduleSchema.properties || {})
    .filter(([, schema]) => {
      if (!!module.next_module_id && schema['x-only-if-no-next-module']) {
        return false;
      }
      return true;
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return {
    type: 'object',
    properties: {
      ...filteredProperties,
      description: {
        'x-ignore-ui': true,
        type: 'string',
        title: 'Description',
        default: module.description || '',
      },
      delay: {
        type: 'object',
        title: 'Delay Settings',
        // 'x-nested-in': 'meta_data',
        'x-map': 'meta_data.delay',
        'x-icon': 'ic:twotone-timer',
        'x-conditional-render': { trigger_type: undefined },
        properties: {
          enable: {
            type: 'string',
            enum: ['none', 'before', 'after', 'both'],
            title: 'Enable Delay',
            default: false,
          },
          before: {
            ...DELAY_SCHEMA,
            title: 'Wait before',
            'x-conditional-render': {
              '@or': [{ 'delay.enable': 'before' }, { 'delay.enable': 'both' }],
            },
          },
          after: {
            ...DELAY_SCHEMA,
            title: 'Wait after',
            'x-conditional-render': {
              '@or': [{ 'delay.enable': 'after' }, { 'delay.enable': 'both' }],
            },
          },
        },
      },
    },
    required: moduleSchema['required'],
  };
};

const getSortedBySortKey = (sortKey) => (a, b) => {
  const aValue = getNested(a, sortKey);
  const bValue = getNested(b, sortKey);

  if (aValue === undefined || aValue === null || isNaN(aValue)) return 1;
  if (bValue === undefined || bValue === null || isNaN(bValue)) return -1;

  return Number(aValue) - Number(bValue);
};

const setNestedObjectValue = (obj, path, value, schema = null) => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) current[key] = {}; // Create a new object if the key doesn't exist
    current = current[key];
  }
  current[keys[keys.length - 1]] = !(
    typeof value === 'object' &&
    Array.isArray(value) &&
    schema?.sort_key &&
    !!value?.length
  )
    ? value
    : [...value].sort(getSortedBySortKey(schema.sort_key)); // Set the value at the final key
};

const setDefaultValuesRecursively = (schema, instance, path = '', parent = null) => {
  let defaultValues = {};

  // Recursive function to process each schema
  const processSchema = (schema, instance, path, parent = null) => {
    if (schema['x-map']) {
      const resolvedReference = resolveReference(instance, schema['x-map']);
      setNestedObjectValue(defaultValues, path, resolvedReference, schema);
    } else if (schema.type === 'object') {
      if (schema['x-recursive']) {
        // Handle recursive schema
        Object.entries(schema.properties).forEach(([key, subSchema]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
            defaultValues = {
              ...defaultValues,
              ...setDefaultValuesRecursively(subSchema, instance[key], currentPath, instance),
            };
          } else {
            const defaultValue = subSchema.default || '';
            setNestedObjectValue(
              defaultValues,
              currentPath,
              instance[key] || defaultValue,
              subSchema,
            );
          }
        });
      } else if (schema['x-unwrap']) {
        // Handle unwrap logic
        const result = unwrap(schema, instance, parent);
        const parsedSchema = { ...schema, ...result };
        delete parsedSchema['x-unwrap'];
        return processSchema(parsedSchema, instance, path);
      } else {
        // Handle non-recursive and non-unwrapped schema
        Object.entries(schema.properties || {}).forEach(([key, subSchema]) => {
          // Check for nested 'x-unwrap' or 'x-recursive' in subSchema
          // const fullPath = path ? `${path}.${key}` : key;
          // // setNestedObjectValue(defaultValues, fullPath, value);
          // processSchema(subSchema, instance[key], fullPath, instance);
          if (subSchema['x-unwrap'] || subSchema['x-recursive']) {
            const currentPath = path ? `${path}.${key}` : key;
            defaultValues = {
              ...defaultValues,
              ...setDefaultValuesRecursively(subSchema, instance[key] || {}, currentPath, instance),
            };
          } else if (subSchema['x-map']) {
            const fullPath = path ? `${path}.${key}` : key;
            processSchema(subSchema, instance, fullPath, instance);
          } else {
            const defaultValue = subSchema.default || '';
            const value = instance[key] || defaultValue;
            const fullPath = path ? `${path}.${key}` : key;
            setNestedObjectValue(defaultValues, fullPath, value, subSchema);
          }
        });
      }
    } else {
      const defaultValue = schema.default || '';
      const value = resolveReference(instance, path) || defaultValue;
      setNestedObjectValue(defaultValues, path, value, schema);
    }
  };
  processSchema(schema, instance, path, parent);
  return defaultValues;
};

const setDefaultValuesAndSchemaRecursively = (schema, instance, path = '', parent = null) => {
  let defaultValues = {};
  let fullSchema = {};

  // Recursive function to process each schema
  const processSchema = (schema, instance, path, parent = null) => {
    if (schema.type === 'object') {
      const currentSchema = { type: 'object', properties: {} };

      if (schema['x-recursive']) {
        // Handle recursive schema
        Object.entries(schema.properties).forEach(([key, subSchema]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
            const { defaultValues: subDefaultValues, fullSchema: subFullSchema } =
              setDefaultValuesAndSchemaRecursively(subSchema, instance[key], currentPath, instance);
            defaultValues = { ...defaultValues, ...subDefaultValues };
            currentSchema.properties[key] = subFullSchema;
          } else {
            const defaultValue = subSchema.default || '';
            defaultValues[currentPath] = instance[key] || defaultValue;
            currentSchema.properties[key] = { ...subSchema, default: defaultValue };
          }
        });
      } else if (schema['x-unwrap']) {
        // Handle unwrap logic
        const result = unwrap(schema, instance, parent);
        const parsedSchema = { ...schema, ...result };
        delete parsedSchema['x-unwrap'];
        return processSchema(parsedSchema, instance, path);
      } else {
        // Handle non-recursive and non-unwrapped schema
        Object.entries(schema.properties || {}).forEach(([key, subSchema]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (subSchema['x-unwrap'] || subSchema['x-recursive']) {
            const { defaultValues: subDefaultValues, fullSchema: subFullSchema } =
              setDefaultValuesAndSchemaRecursively(
                subSchema,
                instance[key] || {},
                currentPath,
                instance,
              );
            defaultValues = { ...defaultValues, ...subDefaultValues };
            currentSchema.properties[key] = subFullSchema;
          } else {
            const defaultValue = subSchema.default || '';
            defaultValues[path ? `${path}.${key}` : key] = instance[key] || defaultValue;
            currentSchema.properties[key] = { ...subSchema, default: defaultValue };
          }
        });
      }

      if (path) {
        fullSchema[path] = currentSchema;
      } else {
        fullSchema = currentSchema;
      }
    }
  };

  processSchema(schema, instance, path, parent);

  return { defaultValues, fullSchema };
};

const getDefaultValues = (properties, instance) => {
  return setDefaultValuesRecursively(properties, instance);
};

const getDefaultValuesAndSchema = (properties, instance) =>
  setDefaultValuesAndSchemaRecursively(properties, instance);

export { getModuleSchema, getDefaultValues, getDefaultValuesAndSchema };

// import { MODULE_SCHEMA } from "./modules";

// const unwrap = (specifications, instance, parent = null) => {
//   const unwrapInfo = specifications['x-unwrap'];
//   if (!unwrapInfo) {
//     console.error('No unwrap information provided.');
//     return {};
//   }

//   const { source, target } = unwrapInfo;
//   if (!Array.isArray(source) || typeof target !== 'string') {
//     console.error('Invalid unwrap configuration.');
//     return {};
//   }
//   const result = source.reduce((acc, path) => {
//     const segments = path.split('.');
//     let current = null;
//     if (segments[0] === '[$]') {
//       current = parent;
//       segments.shift();
//     } else {
//       current = instance;
//     }
//     for (const segment of segments) {
//       if (segment in current) {
//         current = current[segment];
//       } else {
//         // Path not found, skip to the next source
//         return acc;
//       }
//     }
//     // Merge the properties from the current path into the accumulator
//     return { ...acc, ...current };
//   }, {});

//   // Assign the result to the target property in a new object
//   return { [target]: result };
// }

// const getModuleSchema = (module) => {
//   if (!module) {
//     return {};
//   }
//   const moduleSchema = MODULE_SCHEMA[module.type];
//   if (!moduleSchema) {
//     return {};
//   }
//   return {
//     type: 'object',
//     properties: {
//       ...moduleSchema["properties"],
//       description: {
//         ['x-ignore-ui']: true,
//         type: "string",
//         title: "Description",
//         default: module.description || '',
//       }
//     },
//     required: moduleSchema["required"]
//   }
// };

// const setNestedObjectValue = (obj, path, value) => {
//   const keys = path.split('.');
//   let current = obj;
//   for (let i = 0; i < keys.length - 1; i++) {
//       const key = keys[i];
//       if (!current[key]) current[key] = {}; // Create a new object if the key doesn't exist
//       current = current[key];
//   }
//   current[keys[keys.length - 1]] = value; // Set the value at the final key
// };

// const setDefaultValuesRecursively = (schema, instance, path = '', parent = null) => {
//   let defaultValues = {};

//   const processValue = (vSchema, key) => {
//     const defaultValue = vSchema.default || '';
//     const value = instance[key] || defaultValue;
//     const fullPath = path ? `${path}.${key}` : key;
//     const persistingKey = vSchema['x-rename'] ?? key;
//     const nestedIn = vSchema['x-nested-in'];
//     console.log("nestedIn", vSchema, nestedIn);

//     if (nestedIn) {
//       const conditionalRender = vSchema['x-conditional-render'];
//       console.log("conditionalRender", conditionalRender);

//       if (vSchema[nestedIn]?.properties?.type === "object") {
//         if (!defaultValues[nestedIn]) {
//           defaultValues[nestedIn] = {};
//         }
//         const [discriminator, expectedValue] = Object.entries(conditionalRender)[0];
//         console.log("discriminator", discriminator);
//         console.log("expectedValue", expectedValue);
//         if (defaultValues[discriminator] === expectedValue) {
//           defaultValues[key] = defaultValues[nestedIn][persistingKey];
//           delete defaultValues[nestedIn][persistingKey];
//         }
//       }
//       // if (schema[nestedIn]?.properties?.type === "array") {
//       //   if (!acc[nestedIn]) {
//       //     acc[nestedIn] = [];
//       //   }
//       //   acc[nestedIn].push(acc[persistingKey]);
//       //   delete acc[persistingKey];
//       // }
//     }
//     // const defaultValue = subSchema.default || '';
//   }

//   // Recursive function to process each schema
//   const processSchema = (schema, instance, path, parent = null) => {
//     if (schema.type === 'object') {
//       if (schema['x-recursive']) {
//         // Handle recursive schema
//         console.log("schema['x-recursive']", path, schema);
//         Object.entries(schema.properties).forEach(([key, subSchema]) => {
//           const currentPath = path ? `${path}.${key}` : key;
//           if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
//             defaultValues = {
//               ...defaultValues,
//               ...setDefaultValuesRecursively(subSchema, instance[key], currentPath, instance)
//             };
//           } else {
//             const defaultValue = subSchema.default || '';
//             setNestedObjectValue(defaultValues, currentPath, instance[key] || defaultValue);
//           }
//         });
//       } else if (schema['x-unwrap']) {
//         // Handle unwrap logic
//         const result = unwrap(schema, instance, parent);
//         const parsedSchema = { ...schema, ...result };
//         delete parsedSchema['x-unwrap'];
//         return processSchema(parsedSchema, instance, path);
//       } else {
//         // Handle non-recursive and non-unwrapped schema
//         Object.entries(schema.properties || {}).forEach(([key, subSchema]) => {
//           // Check for nested 'x-unwrap' or 'x-recursive' in subSchema
//           if (subSchema['x-unwrap'] || subSchema['x-recursive']) {
//             const currentPath = path ? `${path}.${key}` : key;
//             defaultValues = {
//               ...defaultValues,
//               ...setDefaultValuesRecursively(subSchema, instance[key] || {}, currentPath, instance)
//             };
//           } else {
//             const defaultValue = subSchema.default || '';
//             const value = instance[key] || defaultValue;
//             const fullPath = path ? `${path}.${key}` : key;
//             const persistingKey = subSchema['x-rename'] ?? key;
//             const nestedIn = subSchema['x-nested-in'];
//             console.log("nestedIn", subSchema, nestedIn);

//             if (nestedIn) {
//               const conditionalRender = subSchema['x-conditional-render'];
//               console.log("conditionalRender", conditionalRender);

//               if (subSchema[nestedIn]?.properties?.type === "object") {
//                 if (!defaultValues[nestedIn]) {
//                   defaultValues[nestedIn] = {};
//                 }
//                 const [discriminator, expectedValue] = Object.entries(conditionalRender)[0];
//                 console.log("discriminator", discriminator);
//                 console.log("expectedValue", expectedValue);
//                 if (defaultValues[discriminator] === expectedValue) {
//                   defaultValues[key] = defaultValues[nestedIn][persistingKey];
//                   delete defaultValues[nestedIn][persistingKey];
//                 }
//               }
//               // if (schema[nestedIn]?.properties?.type === "array") {
//               //   if (!acc[nestedIn]) {
//               //     acc[nestedIn] = [];
//               //   }
//               //   acc[nestedIn].push(acc[persistingKey]);
//               //   delete acc[persistingKey];
//               // }
//             }
//             defaultValues[path ? `${path}.${key}` : key] = instance[key] || defaultValue;
//             setNestedObjectValue(defaultValues, fullPath, value);
//           }
//         });
//       }
//     } else {
//       const defaultValue = schema.default || '';
//       const value = instance[path] || defaultValue;
//       const persistingKey = schema['x-rename'] ?? path;
//       const nestedIn = schema['x-nested-in'];
//       console.log("nestedIn", schema, nestedIn);

//       if (nestedIn) {
//         const conditionalRender = schema['x-conditional-render'];
//         console.log("conditionalRender", conditionalRender);

//         if (schema[nestedIn]?.properties?.type === "object") {
//           if (!defaultValues[nestedIn]) {
//             setNestedObjectValue(defaultValues, nestedIn, {});
//           }
//           const [discriminator, expectedValue] = Object.entries(conditionalRender)[0];
//           console.log("discriminator", discriminator);
//           console.log("expectedValue", expectedValue);
//           if (defaultValues[discriminator] === expectedValue) {
//             setNestedObjectValue(defaultValues, path, defaultValues[nestedIn][persistingKey]);
//             delete defaultValues[nestedIn][persistingKey];
//           }
//         }
//         // if (schema[nestedIn]?.properties?.type === "array") {
//         //   if (!acc[nestedIn]) {
//         //     acc[nestedIn] = [];
//         //   }
//         //   acc[nestedIn].push(acc[persistingKey]);
//         //   delete acc[persistingKey];
//         // }
//       } else {
//         setNestedObjectValue(defaultValues, path, instance || defaultValue);
//       }
//       // defaultValues[path] = instance || defaultValue;
//     }
//   };
//   processSchema(schema, instance, path, parent);
//   return defaultValues;
// };

// const setDefaultValuesAndSchemaRecursively = (schema, instance, path = '', parent = null) => {
//   let defaultValues = {};
//   let fullSchema = {};

//   console.log("setDefaultValuesAndSchemaRecursively", path, schema);

//   // Recursive function to process each schema
//   const processSchema = (schema, instance, path, parent = null) => {
//     if (schema.type === 'object') {
//       let currentSchema = { type: 'object', properties: {} };

//       if (schema['x-recursive']) {
//         // Handle recursive schema
//         Object.entries(schema.properties).forEach(([key, subSchema]) => {
//           const currentPath = path ? `${path}.${key}` : key;
//           if (typeof instance[key] === 'object' && !Array.isArray(instance[key])) {
//             const { defaultValues: subDefaultValues, fullSchema: subFullSchema } = setDefaultValuesAndSchemaRecursively(subSchema, instance[key], currentPath, instance);
//             defaultValues = { ...defaultValues, ...subDefaultValues };
//             currentSchema.properties[key] = subFullSchema;
//           } else {
//             const defaultValue = subSchema.default || '';
//             defaultValues[currentPath] = instance[key] || defaultValue;
//             currentSchema.properties[key] = { ...subSchema, default: defaultValue };
//           }
//         });
//       } else if (schema['x-unwrap']) {
//         // Handle unwrap logic
//         const result = unwrap(schema, instance, parent);
//         const parsedSchema = { ...schema, ...result };
//         delete parsedSchema['x-unwrap'];
//         return processSchema(parsedSchema, instance, path);
//       } else {
//         // Handle non-recursive and non-unwrapped schema
//         Object.entries(schema.properties || {}).forEach(([key, subSchema]) => {
//           const currentPath = path ? `${path}.${key}` : key;
//           if (subSchema['x-unwrap'] || subSchema['x-recursive']) {
//             const { defaultValues: subDefaultValues, fullSchema: subFullSchema } = setDefaultValuesAndSchemaRecursively(subSchema, instance[key] || {}, currentPath, instance);
//             defaultValues = { ...defaultValues, ...subDefaultValues };
//             currentSchema.properties[key] = subFullSchema;
//           } else {
//             const persistingKey = subSchema['x-rename'] ?? key;
//             const nestedIn = subSchema['x-nested-in'];
//             console.log("nestedIn", nestedIn);

//             if (nestedIn) {
//               const conditionalRender = subSchema['x-conditional-render'];
//               console.log("conditionalRender", conditionalRender);

//               if (schema[nestedIn]?.properties?.type === "object") {
//                 if (!defaultValues[nestedIn]) {
//                   defaultValues[nestedIn] = {};
//                 }
//                 const [discriminator, expectedValue] = Object.entries(conditionalRender)[0];
//                 console.log("discriminator", discriminator);
//                 console.log("expectedValue", expectedValue);
//                 if (defaultValues[discriminator] === expectedValue) {
//                   defaultValues[key] = defaultValues[nestedIn][persistingKey];
//                   delete defaultValues[nestedIn][persistingKey];
//                 }
//               }
//               // if (schema[nestedIn]?.properties?.type === "array") {
//               //   if (!acc[nestedIn]) {
//               //     acc[nestedIn] = [];
//               //   }
//               //   acc[nestedIn].push(acc[persistingKey]);
//               //   delete acc[persistingKey];
//               // }
//             }
//             const defaultValue = subSchema.default || '';
//             defaultValues[path ? `${path}.${key}` : key] = instance[key] || defaultValue;
//             currentSchema.properties[key] = { ...subSchema, default: defaultValue };
//           }
//         });
//       }

//       if (path) {
//         fullSchema[path] = currentSchema;
//       } else {
//         fullSchema = currentSchema;
//       }
//     }
//   };

//   processSchema(schema, instance, path, parent);

//   return { defaultValues, fullSchema };
// };

// const getDefaultValues = (properties, instance) => {
//   return setDefaultValuesRecursively(properties, instance);
// };

// // const getDefaultValuesAndSchema = (properties, instance) => setDefaultValuesAndSchemaRecursively(properties, instance);

// export {
//   getModuleSchema,
//   getDefaultValues
//   // getDefaultValuesAndSchema
// }
