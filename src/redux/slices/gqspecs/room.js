import { THREAD_GENERAL_GQ } from './thread';

const ROOM_GENERAL_GQ = {
  '@fields': [
    '@base',
    'name',
    'status',
    'description',
    'avatar_url',
    'is_dm',
    'account_id',
    'external_id',
  ],
  policy: {
    '@fields': '@all',
  },
  account: {
    '@fields': ['id'],
    organisation: {
      '@fields': ['@base', 'name'],
      members: {
        '@fields': ['@base', 'email', 'user_name'],
      },
    },
    agents: {
      '@fields': '@all',
    },
  },
  members: {
    '@fields': '@all',
    member: {
      '@fields': '@all',
      user: {
        '@fields': ['id', 'first_name', 'last_name', 'avatar_url'],
      },
      guest: {
        '@fields': ['id', 'first_name', 'last_name', 'avatar_url'],
      },
      agent: {
        '@fields': '@all',
      },
    },
  },
  threads: {
    '@fields': 'id',
  },
  authorization_requests: {
    '@fields': '@all',
    '@filter': {
      is_completed: {
        _eq: false,
      },
    },
  },
};

const ROOM_PARENT_THREAD_GQ = {
  threads: {
    ...THREAD_GENERAL_GQ(),
    '@filter': { is_main: { _eq: true } },
  },
};

const ROOM_ALL_THREADS_GQ = (cursor, status) => ({
  threads: {
    ...THREAD_GENERAL_GQ(true),
    '@paginate': {
      // limit: 15,
      limit: 100,
      cursor: cursor,
      order_by: 'date_creation',
      desc: 'true',
    },
    '@filter': {
      '@and': [{ is_main: { _eq: false } }, { status: { _eq: status } }],
    },
  },
});

export { ROOM_GENERAL_GQ, ROOM_PARENT_THREAD_GQ, ROOM_ALL_THREADS_GQ };
