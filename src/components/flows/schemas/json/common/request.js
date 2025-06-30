const REQUEST_SETTINGS_SCHEMA = {
  title: 'Request Settings',
  type: 'object',
  'x-default-collapsed': true,
  'x-map': 'meta_data.settings',
  default: null,
  properties: {
    timeout: {
      title: 'Timeout',
      description:
        'The maximum time (in seconds) to wait for a request to complete before timing out.',
      type: 'number',
      default: 30,
    },
    retry: {
      type: 'object',
      properties: {
        attempts: {
          title: 'Retry Attempts',
          description: 'The number of times to retry the request in case of failure.',
          type: 'integer',
          default: 1,
        },
        initial: {
          title: 'Initial Delay',
          description: 'The initial delay (in seconds) before the first retry attempt.',
          type: 'number',
          default: 1.0,
        },
        max: {
          title: 'Maximum Delay',
          description: 'The maximum delay (in seconds) between retry attempts.',
          type: 'number',
          default: 10.0,
        },
        expbase: {
          title: 'Exponential Backoff Base',
          description: 'The base value for calculating the exponential backoff delay.',
          type: 'number',
          default: 2,
        },
        jitter: {
          title: 'Jitter',
          description:
            'A randomization factor (in seconds) to add variability to the retry delays.',
          type: 'number',
          default: 0.5,
        },
      },
    },
  },
};

export { REQUEST_SETTINGS_SCHEMA };
