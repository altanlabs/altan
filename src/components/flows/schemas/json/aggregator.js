import { DATA_TYPE } from './common/common';

const AGGEGATOR_SCHEMA = {
  type: 'object',
  required: ['iterator'],
  properties: {
    iterator: {
      'x-component': 'IteratorAutocomplete',
      // "x-show-header": true,
      // "x-arguments": {
      //   type: "iterator",
      // },
      'x-map': 'logic.iterator',
      title: 'Iterator',
      description:
        'Iterator to wait for completion to gather aggregated data from all iterations. Select position.',
      type: 'string',
    },
    mappings: {
      type: 'array',
      'x-map': 'logic.mappings',
      title: 'Data Mappings',
      description: 'List of fields to aggregate and export.',
      items: {
        type: 'object',
        title: 'Mapping',
        description:
          'The field to aggregate from each iteration, the aggregator function to apply and the output type.',
        properties: {
          field: {
            title: 'Field',
            type: 'string',
          },
          aggregator_method: {
            title: 'Aggregator Method',
            type: 'string',
            enum: ['sum', 'average', 'count', 'min', 'max', 'concat', 'merge'],
            enumDescriptions: [
              'Sum of all values',
              'Average of all values',
              'Count of all values',
              'Minimum value',
              'Maximum value',
              'Concatenate all values',
              'Merge all values into a single object',
            ],
          },
          output_type: {
            title: 'Output type',
            ...DATA_TYPE,
          },
          // nested_output: {
          //   title: "Nested Output",
          //   type: "object",
          //   "x-conditional-render": {
          //     "output_type": "object",
          //   },
          // }
        },
      },
    },
  },
};

export { AGGEGATOR_SCHEMA };
