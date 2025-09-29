// routes
import { PATH_DASHBOARD } from './routes/paths';

// ----------------------------------------------------------------------

export const HOST_API_KEY = import.meta.env.VITE_HOST_API_KEY || '';
export const ASSETS_API = import.meta.env.VITE_ASSETS_API || '';

export const FIREBASE_API = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const COGNITO_API = {
  userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID,
};

export const AUTH0_API = {
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
};

export const MAP_API = import.meta.env.VITE_MAPBOX_API;

export const POSTHOG_API = {
  key: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
  host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = PATH_DASHBOARD.general.dashboard;

// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  H_MOBILE: 46,
  H_MOBILE_SUBTOOLBAR: 64,
  H_MAIN_DESKTOP: 88,
  H_DASHBOARD_DESKTOP: 92,
  H_DASHBOARD_DESKTOP_OFFSET: 92 - 32,
};

export const NAV = {
  W_BASE: 260,
  W_DASHBOARD: 280,
  W_DASHBOARD_MINI: 88,
  //
  H_DASHBOARD_ITEM: 36,
  H_DASHBOARD_ITEM_SUB: 28,
  //
  H_DASHBOARD_ITEM_HORIZONTAL: 24,
};

export const ICON = {
  NAV_ITEM: 24,
  NAV_ITEM_HORIZONTAL: 22,
  NAV_ITEM_MINI: 22,
};
