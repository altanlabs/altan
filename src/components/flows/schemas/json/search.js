import { REQUEST_SETTINGS_SCHEMA } from './common/request';
import { TOOL_SCHEMA } from './common/tool';

const SEARCH_SCHEMA = {
  properties: {
    tool: TOOL_SCHEMA,
    logic: {
      title: 'Logic',
      description: 'Defines de logic of the search',
      type: 'object',
      properties: {
        cycle_update: {
          title: 'Cycle Update',
          description: 'Defines how to handle the addition of variables if search has looped.',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              variable: {
                title: 'Variable',
                type: 'string',
                description: 'Select a variable.',
              },
              mode: {
                title: 'Mode',
                type: 'string',
                enum: ['overwrite', 'append'],
                enumDescriptions: [
                  'The variable will be overwritten in each loop iteration.',
                  "The variable will be extended by each iteration's new values.",
                ],
              },
            },
            required: ['mode'],
          },
        },
        loop_condition: {
          'x-component': 'filterspec',
          'x-show-header': true,
          title: 'Loop Condition',
          type: 'object',
          description:
            'The condition that must be met in order to search for more values. (if there is next_page)',
        },
      },
    },
    settings: REQUEST_SETTINGS_SCHEMA,
  },
  required: [],
};

export { SEARCH_SCHEMA };
