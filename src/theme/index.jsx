// @mui
import { CssBaseline } from '@mui/material';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';
import PropTypes from 'prop-types';
import { memo, useMemo } from 'react';

// components
//
import customShadows from './customShadows';
import GlobalStyles from './globalStyles.jsx';
import componentsOverride from './overrides';
import palette from './palette';
import shadows from './shadows';
import typography from './typography';
import { useSettingsContext } from '../components/settings';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

function ThemeProvider({ children }) {
  const { themeMode, themeDirection } = useSettingsContext();

  const themeOptions = useMemo(
    () => ({
      palette: palette(themeMode),
      typography,
      shape: { borderRadius: 8 },
      direction: themeDirection,
      shadows: shadows(themeMode),
      customShadows: customShadows(themeMode),
    }),
    [themeDirection, themeMode],
  );

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}

export default memo(ThemeProvider);
