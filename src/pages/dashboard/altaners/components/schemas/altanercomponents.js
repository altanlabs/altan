const TYPES_MAPPING = {
  interface: {
    name: 'Interface',
    icon: 'mdi:monitor-dashboard',
  },
  gate: {
    name: 'Conversations',
  },
  products: {
    name: 'Products',
    icon: 'heroicons:shopping-bag-20-solid',
  },
  base: {
    name: 'Database',
    icon: 'material-symbols:database',
  },
  view: {
    name: 'View',
    icon: 'material-symbols:database',
  },
  orders: {
    name: 'Orders',
    icon: 'material-symbols-light:order-approve-sharp',
  },
  order_items: {
    name: 'Order Items',
    icon: 'material-symbols-light:order-approve-sharp',
  },
  flows: {
    name: 'Workflows',
    // icon: "fluent:flash-flow-24-filled",
    icon: 'hugeicons:workflow-square-10',
    cloning_settings: {
      is_hidden: true,
    },
  },
  setup_flow: {
    name: 'Installer',
    icon: 'eos-icons:installing',
    cloning_settings: {
      is_hidden: true,
    },
  },
  agents: {
    name: 'AI Agents',
    icon: 'material-symbols-light:order-approve-sharp',
  },
  forms: {
    name: 'Forms',
    icon: 'material-symbols-light:order-approve-sharp',
  },
  external_link: {
    name: 'Link',
    icon: 'akar-icons:link-out',
  },
  iframe: {
    name: 'iFrame',
    icon: 'akar-icons:link-out',
  },
};

const ALTANER_COMPONENT_CREATOR = (type) => {
  const defaults = TYPES_MAPPING[type];
  return {
    type: { type: 'string', const: type },
    name: { type: 'string', description: 'The name of the component', default: defaults.name },
    description: { type: 'string', description: 'A description of the component' },
    position: { type: 'integer', description: 'The position of the component in the Altaner' },
    icon: {
      type: 'string',
      description: 'The icon representing the component',
      'x-component': 'IconAutocomplete',
      default: defaults.icon,
    },
    cloning_settings: {
      'x-disable-free-text': true,
      'x-conditional-render': {
        '@and': [
          {
            '@or': [
              {
                'cloning_settings.distribution_mode': 'closed',
              },
              {
                'cloning_settings.distribution_mode': 'mixed',
              },
            ],
          },
          {
            '@not': {
              template_id: null,
            },
          },
        ],
      },
      type: 'object',
      properties: {
        is_disabled: {
          'x-disable-free-text': true,
          type: 'boolean',
          description: 'Disables the Altaner component',
          default: false,
        },
        is_hidden: {
          'x-disable-free-text': true,
          type: 'boolean',
          description: 'Whether the component will be visible to the users cloning the Altaner',
          default: defaults.cloning_settings?.is_hidden ?? false,
        },
        is_editable: {
          'x-disable-free-text': true,
          type: 'boolean',
          description: 'Whether the component should be editable by the users cloning the Altaner',
          default: defaults.cloning_settings?.is_editable ?? false,
        },
      },
    },
  };
};

const ALTANER_COMPONENTS_CREATOR = {
  type: 'array',
  description: 'A list of components related to the Altaner',
  sort_key: 'position',
  'x-disable-free-text': true,
  'x-disable-header': true,
  'x-map': 'components.items',
  items: {
    'x-disable-free-text': true,
    oneOf: [
      {
        title: 'Interface',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('interface'),
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the interface',
                'x-component': 'InterfaceAutocomplete',
              },
            },
            required: ['id'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Gate',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('gate'),
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the gate',
                'x-component': 'GateAutocomplete',
              },
            },
            required: ['id'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Products',
        type: 'object',
        properties: ALTANER_COMPONENT_CREATOR('products'),
        required: ['type', 'name', 'position'],
      },
      {
        title: 'Orders',
        type: 'object',
        properties: ALTANER_COMPONENT_CREATOR('orders'),
        required: ['type', 'name', 'position'],
      },
      {
        title: 'OrderItems',
        type: 'object',
        properties: ALTANER_COMPONENT_CREATOR('order_items'),
        required: ['type', 'name', 'position'],
      },
      {
        title: 'Flows',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('flows'),
          params: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                'x-component': 'FlowAutocompleteMultiple',
              },
            },
            required: ['ids'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Database',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('base'),
          params: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                'x-component': 'BaseAutocomplete',
              },
            },
            required: ['id'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Installer Workflow',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('setup_flow'),
          params: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                'x-component': 'FlowAutocomplete',
              },
            },
            required: ['id'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Agents',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('agents'),
          params: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'ID of the agent',
                'x-component': 'AgentAutocompleteMultiple',
              },
            },
            required: ['ids'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Forms',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('forms'),
          params: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'ID of the form',
                'x-component': 'FormAutocompleteMultiple',
              },
            },
            required: ['ids'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'Link',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('external_link'),
          params: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The public url of the website',
                pattern: '^(https?:\/\/)?',
                example: 'https://www.example.com',
              },
            },
            required: ['url'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
      {
        title: 'iFrame',
        type: 'object',
        properties: {
          ...ALTANER_COMPONENT_CREATOR('iframe'),
          params: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The public url of the website',
                pattern: '^(https?:\/\/)?',
                example: 'https://www.example.com',
              },
            },
            required: ['url'],
          },
        },
        required: ['type', 'name', 'position', 'params'],
      },
    ],
  },
};

export { ALTANER_COMPONENTS_CREATOR };
