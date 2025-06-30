const TOOL_SCHEMA = {
  type: 'object',
  'x-recursive': true,
  'x-ignore-ui': true,
  properties: {
    name: {
      'x-ignore-ui': true,
      title: 'Name',
      description: 'Name the tool.',
      type: 'string',
    },
    description: {
      'x-ignore-ui': true,
      title: 'Description',
      description: 'Set a description for the tool.',
      type: 'string',
    },
    parameters: {
      'x-ignore-ui': true,
      title: 'Tool Parameters',
      description: 'Set up the tool parameters',
      type: 'object',
      default: {},
      // ['x-unwrap']: {
      //   source: [
      //     '[$].action_type.headers.properties',
      //     '[$].action_type.path_params.properties',
      //     '[$].action_type.query_params.properties',
      //     '[$].action_type.body.properties'
      //   ],
      //   target: 'properties'
      // }
    },
    action_type_id: {
      'x-ignore-ui': true,
      title: 'Action',
      description: "ID of the Tool's action",
      type: 'string',
    },
    // action_type: {
    //   title: 'Action',
    //   description: "Tool's Action",
    //   type: 'object'
    // },
    connection_id: {
      'x-ignore-ui': true,
      title: 'Connection',
      description: '',
      type: 'string',
    },
    show_override_connection: {
      'x-ignore-ui': true,
      type: 'boolean',
    },
    override_connection: {
      'x-conditional-render': {
        'tool.show_override_connection': true,
      },
      title: 'Override Connection',
      description:
        'You can override default connection with a dynamic connection. You must select a var from the flow.',
      type: 'string',
    },
    override_connection_settings: {
      'x-conditional-render': {
        'tool.show_override_connection': true,
      },
      title: 'Override Connection Settings',
      description:
        'You can override default connection with a dynamic connection. You must select a var from the flow.',
      type: 'object',
      properties: {
        override_not_found: {
          type: 'string',
          title: 'If Override Not Found',
          description: 'If connection to override is invalid.',
          default: 'exception',
          enum: ['exception', 'default'],
          enumDescriptions: ['Raise an error and stop execution.', 'Default to main connection.'],
        },
      },
    },
  },
};

export { TOOL_SCHEMA };
