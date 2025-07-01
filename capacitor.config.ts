import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'ai.altan.mobile',
  appName: 'altan',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'https://api.altan.ai',
      'https://api.dev.altan.ai',
      'https://altan.ai',
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '389448867152-rmupuddh5dibhboj1rqovpc6c5iond54.apps.googleusercontent.com', // Add your WEB client ID here (from Google Cloud Console)
      forceCodeForRefreshToken: true,
      // You can also specify platform-specific client IDs:
      iosClientId: '389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com', // Add your iOS client ID here
      // androidClientId: '', // Add your Android client ID here
    },
  },
};

export default config;
