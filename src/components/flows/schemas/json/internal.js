import { DATA_TYPE } from './common/common';

const AIGENT_SCHEMA = {
  agent_id: {
    title: 'Agent',
    type: 'string',
    'x-component': 'AgentAutocomplete',
    'x-conditional-render': {
      internal_type: 'aigent',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.agent_id',
  },

  output_json: {
    title: 'Output Json',
    type: 'boolean',
    'x-conditional-render': {
      internal_type: 'aigent',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.output_json',
  },
  message_history: {
    title: 'Message History',
    'x-conditional-render': {
      internal_type: 'aigent',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.message_history',
    type: 'array',
    items: {
      type: 'object',
      required: ['content', 'role'],
      properties: {
        role: {
          enum: ['system', 'assistant', 'user'],
          type: 'string',
        },
        content: {
          oneOf: [
            {
              type: 'string',
              title: 'Text Content',
              description: 'Simple message with text content.',
            },
            {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'content'],
                properties: {
                  type: {
                    enum: ['text', 'image_url'],
                    type: 'string',
                    title: 'Type',
                    enumDescriptions: ['Text Message', 'Image either base64 or url'],
                  },
                  content: {
                    type: 'string',
                    title: 'Content',
                  },
                },
              },
              title: 'Compound Message',
            },
          ],
        },
      },
    },
  },
  thread_id: {
    title: 'Thread Id',
    type: 'string',
    // 'x-ignore-ui': true,
    'x-conditional-render': {
      internal_type: 'aigent',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.thread_id',
  },
};

const OCTOPUS_SCHEMA = {
  exports: {
    'x-conditional-render': {
      internal_type: 'octopus',
    },
    'x-nested-in': 'logic',
    type: 'array',
    'x-map': 'logic.exports',
    title: 'Data Exports',
    description: 'List of fields to export from octopus module.',
    items: {
      type: 'object',
      title: 'Mapping',
      description: 'The field to export and its output type.',
      properties: {
        name: {
          title: 'Name',
          description: 'Ensure it is unique in order to avoid overwriting any value.',
          type: 'string',
        },
        // type: {
        //   title: "Data type of value",
        //   ...DATA_TYPE,
        // },
        values: {
          title: 'Values',
          description: 'The value of the variable.',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                title: 'Data type of value',
                ...DATA_TYPE,
              },
              value: {
                title: 'Value',
                description: 'The value of the variable.',
                type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
              },
            },
          },
        },
      },
    },
  },
};

const WEBHOOK_RESPONSE_SCHEMA = {
  response_type: {
    'x-conditional-render': {
      internal_type: 'response',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.response_type',
    title: 'Response type',
    description: 'The type of response for this workflow',
    type: 'string',
    enum: ['JSON', 'HTML', 'Redirect'],
    default: 'JSON',
    example: 'JSON',
  },

  response_code: {
    'x-conditional-render': {
      internal_type: 'response',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.response_code',
    title: 'Response code',
    description: 'The response code to return',
    type: 'integer',
    default: 200,
    minimum: 100,
    maximum: 599,
    example: 200,
  },
  output_mapping: {
    'x-conditional-render': {
      '@and': [{ internal_type: 'response' }, { response_type: 'JSON' }],
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.output_mapping',
    title: 'Response content',
    description:
      'The output of the flow. Each of the mappings will be a key-value pair in the response dictionary of the workflow.',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name',
          description: 'Ensure it is unique in order to avoid overwriting any value.',
          type: 'string',
        },
        type: {
          title: 'Data type of value',
          ...DATA_TYPE,
        },
        value: {
          title: 'Value',
          description: 'The value of the variable.',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
        },
        nested_output: {
          'x-conditional-render': {
            'output_mapping.[$i].type': 'object',
          },
          title: 'Output JSON schema',
          description: 'The value must validate against the provided JSON schema.',
          type: 'object',
        },
      },
    },
  },

  // response_headers: {
  //   "x-nested-in": "logic",
  //   "x-map": "logic.response_headers",
  //   title: "Response headers",
  //   description:
  //     "The headers to return in the response",
  //   type: "array",
  //   items: {
  //     type: "object",
  //     properties: {
  //       name: {
  //         title: "Name",
  //         description:
  //           "Ensure it is unique in order to avoid overwriting any value.",
  //         type: "string",
  //       },
  //       type: {
  //         title: "Data type of value",
  //         ...DATA_TYPE,
  //       },
  //       value: {
  //         title: "Value",
  //         description: "The value of the variable.",
  //         type: [
  //           "string",
  //           "object",
  //           "array",
  //           "boolean",
  //           "number",
  //           "integer",
  //           "datetime",
  //         ],
  //       },
  //       nested_output: {
  //         "x-conditional-render": {
  //           "response_headers.[$i].type": "object",
  //         },
  //         title: "Output JSON schema",
  //         description:
  //           "The value must validate against the provided JSON schema.",
  //         type: "object",
  //       },
  //     },
  //   },
  // },

  html: {
    'x-conditional-render': {
      '@and': [{ internal_type: 'response' }, { response_type: 'HTML' }],
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.html',
    title: 'HTML Content',
    description: 'The HTML content to be returned.',
    type: 'string',
    'x-component': 'HTMLEditor',
  },
  url: {
    'x-conditional-render': {
      '@and': [{ internal_type: 'response' }, { response_type: 'Redirect' }],
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.url',
    title: 'Redirect URL',
    description: 'The URL to redirect to.',
    type: 'string',
  },
};

const ALTANER_SET_SCHEMA = {
  override_vars: {
    'x-conditional-render': {
      internal_type: 'altaner',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.override_vars',
    type: 'array',
    title: 'Variables',
    description: 'Override the variables of the Altaner to clone.',
    'x-component': 'AltanerVariablesInstallationOverride',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name of variable',
          type: 'string',
        },
        value: {
          title: 'Variable content',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
        },
      },
    },
  },
  details: {
    'x-conditional-render': {
      internal_type: 'altaner',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.details',
    type: 'object',
    title: 'Altaner Details',
    description: 'The details of the Altaner to override',
    properties: {
      name: {
        title: 'Name of the Altaner',
        type: 'string',
      },
      description: {
        title: 'Description of the Altaner',
        type: 'string',
      },
    },
  },
};

const CODE_SCHEMA = {
  language: {
    'x-conditional-render': {
      internal_type: 'code',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.language',
    type: 'string',
    title: 'Language',
    description: 'The language of the code',
    // enum: ['python'],
    const: 'python',
  },
  dependencies: {
    'x-conditional-render': {
      internal_type: 'code',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.dependencies',
    type: 'array',
    items: {
      type: 'string',
    },
    title: 'Dependencies',
    description: 'pip libraries',
  },

  input_vars_schema: {
    'x-conditional-render': {
      internal_type: 'code',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.input_vars_schema',
    title: 'Input Variables',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name of variable',
          description:
            'You will be able to use <name> to get the content of the variable in the code. Use _ and not -. It must start with alphabetic character. Can contain numbers.',
          type: 'string',
        },
        type: {
          title: 'Data type of variable',
          ...DATA_TYPE,
        },
        value: {
          title: 'Variable content',
          description: 'The value of the variable.',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
        },
      },
      required: ['name', 'value'],
    },
  },
  output_vars_schema: {
    'x-conditional-render': {
      internal_type: 'code',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.output_vars_schema',
    title: 'Output Variables',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name',
          description:
            'Ensure it is unique in order to avoid overwriting any value. Use _ and not -. It must start with alphabetic character. Can contain numbers.',
          type: 'string',
        },
        type: {
          title: 'Data type of value',
          ...DATA_TYPE,
        },
        nested_output: {
          'x-conditional-render': {
            '@or': [
              { 'output_vars_schema.[$i].type': 'object' },
              { 'output_vars_schema.[$i].type': 'array' },
            ],
          },
          title: 'Output JSON schema',
          description: 'The value must validate against the provided JSON schema.',
          type: 'object',
        },
      },
      required: ['name'],
    },
  },
  code: {
    'x-conditional-render': {
      internal_type: 'code',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.code',
    'x-component': 'CodeEditor',
    type: 'string',
    title: 'Code',
    description: 'The code to execute',
  },
};

const VARS_SCHEMA = {
  variables: {
    'x-conditional-render': {
      internal_type: 'vars',
    },
    'x-nested-in': 'logic',
    title: 'Variables',
    description: 'The list of variabes to set.',
    type: 'array',
    'x-map': 'logic.variables',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name of variable',
          description:
            'You will be able to use [$vars].<name> to get the content of the variable in later modules.',
          type: 'string',
        },
        type: {
          title: 'Data type of variable',
          ...DATA_TYPE,
        },
        json_schema: {
          'x-conditional-render': {
            enable_is_template: true,
          },
          title: 'Json Shcema of the variable',
          description: 'The detailed schema of the variable for further validation',
          type: 'object',
        },
        value: {
          title: 'Variable content',
          description:
            'You will be able to use [$vars].<name> to get the content of the variable in later modules.',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
        },
        expose: {
          title: 'Expose',
          description: 'Makes the variable available to be set from a calling workflow',
          type: 'boolean',
          default: true,
        },
        altaner_variable: {
          title: 'Link an Altaner variable',
          description:
            'Makes the variable inherit from an Altaner. You can select the Altaner variable from the Global Variables menu using $ and choosing from the Altaner Linked section.',
          type: 'string',
        },
        is_template: {
          'x-conditional-render': {
            enable_is_template: true,
          },
          title: 'Is template',
          description: 'If the variable will be shown in template.',
          type: 'boolean',
          default: true,
        },
        template_description: {
          'x-conditional-render': {
            '@or': [
              { '@and': [{ enable_is_template: true }, { '[$i].is_template': true }] },
              { '[$i].expose': true },
            ],
          },
          title: 'Variable description',
          description: 'Describes what the variable does.',
          type: 'string',
        },
        template_enum: {
          'x-conditional-render': {
            '@and': [
              {
                '@or': [
                  { '@and': [{ enable_is_template: true }, { '[$i].is_template': true }] },
                  { '[$i].expose': true },
                ],
              },
              {
                '[$i].type': 'string',
              },
            ],
          },
          title: 'Variable possible values',
          description: 'Choose the possible values of the variable.',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['name', 'value'],
    },
  },
  enable_is_template: {
    'x-conditional-render': {
      internal_type: 'vars',
    },
    'x-nested-in': 'logic',
    title: 'Enable Template',
    description: 'Allow the variables to be shown in template.',
    type: 'boolean',
    default: false,
    'x-map': 'logic.enable_is_template',
  },
};

const INVOKE_SCHEMA = {
  workflow_id: {
    title: 'Workflow ID',
    description: 'The ID of the workflow to be called.',
    'x-component': 'FlowAutocomplete',
    'x-conditional-render': {
      internal_type: 'invoke',
    },
    type: 'string',
    'x-nested-in': 'logic',
    'x-map': 'logic.workflow_id',
  },
  input: {
    title: 'Input Variables',
    description: 'The input for the workflow to be called.',
    type: 'array',
    'x-nested-in': 'logic',
    'x-map': 'logic.input',
    'x-conditional-render': { internal_type: 'invoke' },
    // {
    //   '@and': [
    //     { internal_type: 'invoke' },
    //     {
    //       '@not': {
    //         workflow_id: [null, undefined, ''],
    //       },
    //     },
    //   ],
    // },
    'x-component': 'InvokeFlowInputVars',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name of variable',
          description:
            'You will be able to use <name> to get the content of the variable in the code.',
          type: 'string',
          'x-ignore-ui': true,
        },
        type: {
          title: 'Data type of variable',
          type: 'string',
          enum: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime', 'bytes'],
          default: 'string',
          'x-ignore-ui': true,
        },
        value: {
          title: 'Variable content',
          description: 'The value of the variable.',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime', 'bytes'],
          'x-ignore-ui': true,
        },
      },
      required: ['name'],
    },
  },
};

const ALTANER_SCHEMA = {
  override_vars: {
    'x-conditional-render': {
      internal_type: 'altaner',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.override_vars',
    type: 'array',
    title: 'Variables',
    description: 'Override the variables of the Altaner to clone.',
    'x-component': 'AltanerVariablesInstallationOverride',
    items: {
      type: 'object',
      properties: {
        name: {
          title: 'Name of variable',
          type: 'string',
        },
        value: {
          title: 'Variable content',
          type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
        },
      },
    },
  },
  details: {
    'x-conditional-render': {
      internal_type: 'altaner',
    },
    'x-nested-in': 'logic',
    'x-map': 'logic.details',
    type: 'object',
    title: 'Altaner Details',
    description: 'The details of the Altaner to override',
    properties: {
      name: {
        title: 'Name of the Altaner',
        type: 'string',
      },
      description: {
        title: 'Description of the Altaner',
        type: 'string',
      },
    },
  },
};

const INTERNAL_SCHEMA = {
  properties: {
    internal_type: {
      type: 'string',
      enum: [
        'octopus',
        'response',
        'code',
        'vars',
        'aigent',
        'altaner',
        'invoke',
        // "pause",
        // "exception",
        // "helper",
      ],
      description: 'The internal moduletype',
      title: 'Internal Type',
      'x-ignore-ui': true,
    },
    logic: {
      'x-ignore-ui': true,
      type: 'object',
    },
    ...ALTANER_SCHEMA,
    ...INVOKE_SCHEMA,
    ...VARS_SCHEMA,
    ...CODE_SCHEMA,
    ...OCTOPUS_SCHEMA,
    ...WEBHOOK_RESPONSE_SCHEMA,
    ...AIGENT_SCHEMA,
    ...ALTANER_SET_SCHEMA,
  },
  required: ['internal_type', 'code', 'language', 'input_vars_schema', 'workflow_id', 'agent_id'],
};

export { INTERNAL_SCHEMA };
