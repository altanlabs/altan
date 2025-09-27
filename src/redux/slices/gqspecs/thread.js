const MESSAGE_FIELDS = {
  '@fields': '@all@exc:cost,tokens,meta_data',
  replied: {
    '@fields': ['@base@exc:meta_data', 'member_id', 'text'],
  },
  reactions: {
    '@fields': ['@base@exc:meta_data', 'reaction_type', 'emoji', 'member_id'],
  },
  media: {
    '@fields': 'id',
    media: {
      '@fields': ['id', 'file_name', 'mime_type'],
    },
  },
  parts: {
    '@fields': '@all',
    media: {
      '@fields': ['id', 'file_name', 'mime_type'],
    },
    task_execution: {
      '@fields': [
        '@all@exc:meta_data',
      ],
      tool: {
        '@fields': ['id', 'name'],
        action_type: {
          '@fields': ['id', 'name'],
          connection_type: {
            '@fields': ['icon'],
          },
        },
      },
    },
  },
  executions: {
    '@fields': [
      '@base@exc:meta_data',
      'arguments',
      'input',
      'content',
      'error',
      'status',
      'finished_at',
    ],
    tool: {
      '@fields': ['id', 'name'],
      action_type: {
        '@fields': ['id', 'name'],
        connection_type: {
          '@fields': ['icon'],
        },
      },
    },
  },
};

const THREAD_GENERAL_GQ = (preview = false) => ({
  '@fields': [
    '@base@exc:meta_data',
    'name',
    'description',
    'starter_message_id',
    'is_main',
    'status',
  ],
  read_status: {
    '@fields': ['member_id', 'timestamp'],
  },
  messages: {
    '@paginate': { limit: preview ? 1 : 25, order_by: 'date_creation', desc: 'true' },
    ...MESSAGE_FIELDS,
  },
  parent: MESSAGE_FIELDS,
});

const THREAD_MESSAGES_GQ = (cursor) => ({
  '@fields': ['@base@exc:meta_data'],
  read_status: {
    '@fields': ['member_id', 'timestamp'],
  },
  messages: {
    '@paginate': { limit: 25, cursor: cursor, order_by: 'date_creation', desc: 'true' },
    ...MESSAGE_FIELDS,
  },
  parent: MESSAGE_FIELDS,
});

export { THREAD_GENERAL_GQ, THREAD_MESSAGES_GQ };
