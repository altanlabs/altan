// ----------------------------------------------------------------------

function path(root, sublink = '') {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '';
const ROOTS_SA = '/xsup';
const ROOTS_ASSETS = `${ROOTS_DASHBOARD}/assets`;
const ROOTS_ACCOUNT = `${ROOTS_DASHBOARD}/account`;

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  api: '/api',
  privacy: '/privacy',
  terms: '/terms',
  values: '/values',
  hub: '/hub',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  calendar: path(ROOTS_DASHBOARD, '/calendar'),
  permissionDenied: path(ROOTS_DASHBOARD, '/permission-denied'),
  integrations: path(ROOTS_DASHBOARD, '/integrations'),
  conversations: path(ROOTS_DASHBOARD, '/conversations'),
  rooms: path(ROOTS_DASHBOARD, '/rooms'),
  shop: path(ROOTS_DASHBOARD, '/shop'),
  flows: path(ROOTS_DASHBOARD, '/flows'),
  crm: path(ROOTS_DASHBOARD, '/crm'),
  catalogs: path(ROOTS_ASSETS, '/catalogs'),
  products: path(ROOTS_ASSETS, '/products'),
  orders: path(ROOTS_ASSETS, '/orders'),
  customers: path(ROOTS_ASSETS, '/customers'),
  members: {
    root: path(ROOTS_DASHBOARD, '/members'),
    view: (memberId) => path(ROOTS_DASHBOARD, `/members/${memberId}`),
  },
  spaces: {
    root: path(ROOTS_DASHBOARD, '/spaces'),
    view: (spaceId) => path(ROOTS_DASHBOARD, `/spaces/${spaceId}`),
  },
  assets: {
    root: path(ROOTS_DASHBOARD, '/assets'),
    media: path(ROOTS_ASSETS, '/media'),
    widgets: path(ROOTS_ASSETS, '/widgets'),
    knowledge: path(ROOTS_ASSETS, '/knowledge'),
    tools: path(ROOTS_ASSETS, '/tools'),
    connections: path(ROOTS_ASSETS, '/connections'),
    commands: path(ROOTS_ASSETS, '/commands'),
    hooks: path(ROOTS_ASSETS, '/hooks'),
    customers: path(ROOTS_ASSETS, '/customers'),
  },
  subscription: {
    bronze: path(ROOTS_DASHBOARD, '/subscription/bronze'),
    silver: path(ROOTS_DASHBOARD, '/subscription/silver'),
    gold: path(ROOTS_DASHBOARD, '/subscription/gold'),
  },

  playground: {
    root: path(ROOTS_DASHBOARD, '/playground'),
    text: path(ROOTS_DASHBOARD, '/playground/text'),
    audio: path(ROOTS_DASHBOARD, '/playground/audio'),
    video: path(ROOTS_DASHBOARD, '/playground/video'),
    image: path(ROOTS_DASHBOARD, '/playground/image'),
    biz: path(ROOTS_DASHBOARD, '/playground/biz'),
    write: path(ROOTS_DASHBOARD, '/playground/write'),
  },

  general: {
    root: path(ROOTS_DASHBOARD, '/home'),
    dashboard: path(ROOTS_DASHBOARD, '/dashboard'),
    analytics: path(ROOTS_DASHBOARD, '/analytics'),
    banking: path(ROOTS_DASHBOARD, '/banking'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    file: path(ROOTS_DASHBOARD, '/file'),
  },

  chat: {
    root: path(ROOTS_DASHBOARD, '/chat'),
    new: path(ROOTS_DASHBOARD, '/chat/new'),
    view: (chatId) => path(ROOTS_DASHBOARD, `/chat/${chatId}`),
  },

  inbox: {
    root: path(ROOTS_DASHBOARD, '/inbox'),
    view: (chatId) => path(ROOTS_DASHBOARD, `/inbox/${chatId}`),
  },

  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    new: path(ROOTS_DASHBOARD, '/user/new'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    edit: (name) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
    demoEdit: path(ROOTS_DASHBOARD, '/user/reece-chung/edit'),
  },
  account: {
    root: path(ROOTS_DASHBOARD, '/account'),
    settings: path(ROOTS_ACCOUNT, '/settings'),
    api: path(ROOTS_ACCOUNT, '/api'),
  },
  referrals: path(ROOTS_DASHBOARD, '/referrals'),
  super: {
    root: ROOTS_SA,
    apps: path(ROOTS_SA, '/hub'),
    core: path(ROOTS_SA, '/core'),
    internal: path(ROOTS_SA, '/internal'),
    external: path(ROOTS_SA, '/external'),
    creator: path(ROOTS_SA, '/creator'),
    // view: (spaceId) => path(ROOTS_DASHBOARD, `/super/${spaceId}`),
  },

  clients: {
    root: path(ROOTS_DASHBOARD, '/clients'),
    view: (clientId) => path(ROOTS_DASHBOARD, `/client/${clientId}`),
  },
  catalogs: {
    root: path(ROOTS_DASHBOARD, '/catalogs'),
    view: (catalogId) => path(ROOTS_DASHBOARD, `/catalogs/${catalogId}`),
  },
  testing: {
    root: path(ROOTS_DASHBOARD, '/testing'),
    textVoiceDemo: path(ROOTS_DASHBOARD, '/testing/text-voice-demo'),
    advancedEditor: path(ROOTS_DASHBOARD, '/testing/advanced-editor'),
    sdkDemo: path(ROOTS_DASHBOARD, '/testing/sdk-demo'),
  },
};

export const PATH_DOCS = {
  root: '/api',
  changelog: '/api',
};

export const PATH_ZONE_ON_STORE = 'https://www.altan.ai';

export const PATH_MINIMAL_ON_STORE = 'https://www.altan.ai';

export const PATH_FREE_VERSION = 'https://www.altan.ai';

export const PATH_FIGMA_PREVIEW = 'https://www.altan.ai';
