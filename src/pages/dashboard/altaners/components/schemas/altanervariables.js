import { DATA_TYPE } from '../../../../../components/flows/schemas/json/common/common';

const ALTANER_VARIABLES_CREATOR = {
  title: 'Variables',
  description: 'The list of Altaner variabes to set.',
  type: 'array',
  'x-disable-free-text': true,
  'x-disable-header': true,
  'x-map': 'meta_data.variables',
  items: {
    'x-disable-free-text': true,
    type: 'object',
    properties: {
      name: {
        title: 'Name of variable',
        description:
          'You will be able to use [$avars].<name> to get the content of the variable in workflows and other resources of the Altaner.',
        type: 'string',
      },
      type: {
        title: 'Data type of variable',
        ...DATA_TYPE,
      },
      value: {
        title: 'Variable content',
        description:
          'You will be able to use [$vars].<name> to get the content of the variable in later modules.',
        type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
      },
      is_template: {
        title: 'Is template',
        description: 'If the variable will be shown in the Altaner template.',
        type: 'boolean',
        default: false,
      },
      inherits_from_installer: {
        type: 'boolean',
        description:
          'If the variable inherits from the execution of the Installer workflow of the Altaner',
        default: false,
      },
      template_description: {
        'x-conditional-render': {
          '[$i].is_template': true,
        },
        title: 'Variable description',
        description: 'Describes what the variable does.',
        type: 'string',
      },
      template_enum: {
        'x-conditional-render': {
          'x-conditional-render': {
            '[$i].is_template': true,
          },
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
};

const ALTANER_VARIABLES_CONSUMER = {
  title: 'Variables',
  description: 'The list of Altaner variabes to set.',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: {
        title: 'Name of variable',
        description:
          'You will be able to use [$avars].<name> to get the content of the variable in workflows and other resources of the Altaner.',
        type: 'string',
      },
      type: {
        title: 'Data type of variable',
        ...DATA_TYPE,
      },
      value: {
        title: 'Variable content',
        description:
          'You will be able to use [$vars].<name> to get the content of the variable in later modules.',
        type: ['string', 'object', 'array', 'boolean', 'number', 'integer', 'datetime'],
      },
    },
    required: ['name', 'value'],
  },
};

export { ALTANER_VARIABLES_CONSUMER, ALTANER_VARIABLES_CREATOR };
