// i18n
import './locales/i18n';
// scroll bar
import 'simplebar-react/dist/simplebar.min.css';
// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

// ----------------------------------------------------------------------

import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LocalizationProvider, LicenseInfo } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers-pro/AdapterDateFns';
import { memo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

// auth
import { AuthProvider } from './auth/JwtContext';
// components
import { MotionLazyContainer } from './components/animate';
import CookieBanner from './components/cookie-banner';
import CookieManager from './components/cookie-banner/CookieManager';
import FeedbackManager from './components/feedback/FeedbackManager';
import { ThemeSettings, SettingsProvider } from './components/settings';
import SnackbarProvider from './components/snackbar';
// locales
import ThemeLocalization from './locales';
// redux
import { store, persistor } from './redux/store';
// routes
import Router from './routes/index';
// theme
import ThemeProvider from './theme/index';

// ----------------------------------------------------------------------
// MUI X License Key
// ----------------------------------------------------------------------

LicenseInfo.setLicenseKey(
  '6251fc44845145b92ad1c87fb54d3d0dTz0xMjM0NTYsRT0xNzczMjczMDc5MDAwLFM9cHJlbWl1bSxMTT1zdWJzY3JpcHRpb24sS1Y9Mg==',
);

// ----------------------------------------------------------------------
// Initialize Ionic
// ----------------------------------------------------------------------

setupIonicReact({
  rippleEffect: false,
  mode: 'md', // Use Material Design mode for consistent styling
});

// ----------------------------------------------------------------------

function App(): JSX.Element {
  return (
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <HelmetProvider>
            <ReduxProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <SettingsProvider>
                    <MotionLazyContainer>
                      <ThemeProvider>
                        <ThemeSettings>
                          <ThemeLocalization>
                            <SnackbarProvider>
                              <Router />
                              <CookieBanner />
                              <CookieManager />
                              <FeedbackManager />
                            </SnackbarProvider>
                          </ThemeLocalization>
                        </ThemeSettings>
                      </ThemeProvider>
                    </MotionLazyContainer>
                  </SettingsProvider>
                </LocalizationProvider>
              </PersistGate>
            </ReduxProvider>
          </HelmetProvider>
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  );
}

export default memo(App);

