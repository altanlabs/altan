const ROUTER_SCHEMA = {
  type: 'object',
  properties: {
    router_mode: {
      'x-before': true,
      'x-map': 'meta_data.router_mode',
      type: 'string',
      enum: ['standard', 'exclusive'],
      enumDescriptions: [
        'The standard Router branches the workflow path. Every condition is checked and, if successful, the path is executed.',
        'The exclusive Router executes only the path of the first condition that is met, ignoring subsequent conditions.',
      ],
      default: 'standard',
    },
    route_conditions: {
      'x-ignore-ui': true,
      'x-rename': 'conditions',
      'x-commands': [
        {
          match: 'x-is-new',
          actions: [
            {
              action: 'delete',
              keys: ['id'],
            },
          ],
        },
      ],
      title: 'Route Conditions',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          priority: {
            title: 'Priority',
            type: 'integer',
          },
          condition_logic: {
            'x-ignore-ui': true,
            'x-component': 'filterspec',
            type: 'object',
            title: 'Condition Logic',
          },
        },
      },
    },
  },
};

export { ROUTER_SCHEMA };
