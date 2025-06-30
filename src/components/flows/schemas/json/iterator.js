const ITERATOR_SCHEMA = {
  properties: {
    field: {
      title: 'Field',
      description: 'Field to iterate',
      type: 'string',
    },
    logic: {
      title: 'Logic',
      'x-disable-free-text': true,
      'x-disable-collapse': true,
      description: 'Defines de logic of the iterator',
      type: 'object',
      properties: {
        condition: {
          'x-component': 'filterspec',
          'x-show-header': true,
          title: 'Condition',
          description: 'Defines de condition of the iterator, can act as a first filter.',
          type: 'object',
        },
        batched: {
          type: 'boolean',
          description: 'Indicates if the iteration should be batched.',
          default: false,
        },
        batched_settings: {
          type: 'object',
          description:
            'Settings for batch iteration, defining max items per batch and minimum interval between batches.',
          properties: {
            max_items: {
              type: 'integer',
              description: 'Maximum number of items allowed in a batch.',
              minimum: 1,
            },
            min_interval: {
              type: 'number',
              description: 'Minimum interval in seconds between batch executions.',
              default: 0.0,
              minimum: 0.0,
            },
          },
          required: ['max_items'],
        },
        max_iterations: {
          type: 'integer',
          description: 'Optional maximum number of iterations allowed, or no limit if omitted.',
        },
      },
    },
  },
  required: ['field'],
};

export { ITERATOR_SCHEMA };
