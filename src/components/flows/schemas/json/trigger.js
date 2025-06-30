const TRIGGER_SCHEMA = {
  properties: {
    trigger_type: {
      'x-disable-free-text': true,
      type: 'string',
      description: 'Type of the trigger (Scheduled or Instant)',
      title: 'Type',
      enum: ['scheduled', 'instant', 'internal'],
      enumDescriptions: [
        'Scheduled triggers allows to execute the workflow every X interval of time.',
        'Instant triggers will trigger the workflow when an event is sent to a specific url or arrives when an internal or external asset has been created, updated or deleted.',
        "Internal triggers are the simplest ones, they allow you to only call them internally. Either clicking 'Execute Workflow' or calling it from another workflow using a 'Call Workflow' module.",
      ],
      default: 'instant', // TODO: set internal as default
      'x-disable-clear': true,
      'x-component': 'TriggerType',
      'x-disable-header': true,
    },
    cron_expression: {
      'x-conditional-render': {
        trigger_type: 'scheduled',
      },
      'x-show-header': true,
      'x-component': 'cron',
      'x-required': true,
      type: 'string',
      description: 'Define the interval when the workflow must be executed.',
      title: 'Schedule',
      default: `${Math.floor(Math.random() * 59)} ${Math.floor(Math.random() * 24)} * * *`,
    },
    subscriptions: {
      'x-disable-free-text': true,
      'x-required': true,
      'x-disable-header': true,
      'x-conditional-render': {
        trigger_type: 'instant',
      },
      'x-component': 'webhook',
      title: 'Webhook',
      description: 'Defines the webhook that triggers the workflow.',
      items: {
        type: 'object',
      },
      type: 'array',
    },
  },
  required: ['trigger_type'],
};

export { TRIGGER_SCHEMA };
