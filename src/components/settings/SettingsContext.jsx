import PropTypes from 'prop-types';
import { createContext, useEffect, useContext, useMemo, useCallback, memo, useState } from 'react';

// hooks
import { defaultSettings } from './config-setting';
import { defaultPreset, getPresets, presetsOption } from './presets';
import useLocalStorage from '../../hooks/useLocalStorage';

// utils
import { resolveThemeMode, addSystemThemeListener } from '../../utils/getSystemTheme';

// ----------------------------------------------------------------------

const initialState = {
  ...defaultSettings,
  // Mode
  onToggleMode: () => {},
  onChangeMode: () => {},
  // Direction
  onToggleDirection: () => {},
  onChangeDirection: () => {},
  onChangeDirectionByLang: () => {},
  // Layout
  onToggleLayout: () => {},
  onChangeLayout: () => {},
  // Contrast
  onToggleContrast: () => {},
  onChangeContrast: () => {},
  // Color
  onChangeColorPresets: () => {},
  presetsColor: defaultPreset,
  presetsOption: [],
  // Stretch
  onToggleStretch: () => {},
  onToggleAnimation: () => {},
  // Reset
  onResetSetting: () => {},
};

// ----------------------------------------------------------------------

export const SettingsContext = createContext(initialState);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);

  if (!context) throw new Error('useSettingsContext must be use inside SettingsProvider');

  return context;
};

// ----------------------------------------------------------------------

SettingsProvider.propTypes = {
  children: PropTypes.node,
};

function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('settings', defaultSettings);
  
  // Track the resolved theme mode (converts 'system' to 'light' or 'dark')
  const [resolvedThemeMode, setResolvedThemeMode] = useState(() => resolveThemeMode(settings.themeMode));

  const isArabic = settings.langStorage === 'ar';

  // Update resolved theme mode when settings change
  useEffect(() => {
    const newResolvedMode = resolveThemeMode(settings.themeMode);
    setResolvedThemeMode(newResolvedMode);
  }, [settings.themeMode]);

  // Apply the resolved theme mode to the document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedThemeMode === 'dark');
  }, [resolvedThemeMode]);

  // Add system theme change listener when theme mode is 'system'
  useEffect(() => {
    if (settings.themeMode !== 'system') {
      return undefined; // No cleanup needed
    }

    const cleanup = addSystemThemeListener((systemTheme) => {
      setResolvedThemeMode(systemTheme);
    });

    return cleanup;
  }, [settings.themeMode]);

  // Mode
  const onToggleMode = useCallback(() => {
    // Simple toggle between light and dark only
    const nextMode = settings.themeMode === 'light' ? 'dark' : 'light';
    setSettings({ ...settings, themeMode: nextMode });
  }, [setSettings, settings]);

  const onToggleAnimation = useCallback(
    (mode = 'all') => {
      setSettings({
        ...settings,
        animations: { ...settings.animations, [mode]: !settings.animations[mode] },
      });
    },
    [setSettings, settings],
  );

  const onChangeMode = useCallback(
    (value) => {
      setSettings({ ...settings, themeMode: value });
    },
    [setSettings, settings],
  );

  // Direction
  const onToggleDirection = useCallback(() => {
    const themeDirection = settings.themeDirection === 'rtl' ? 'ltr' : 'rtl';
    setSettings({ ...settings, themeDirection });
  }, [setSettings, settings]);

  const onChangeDirection = useCallback(
    (event) => {
      const themeDirection = event.target.value;
      setSettings({ ...settings, themeDirection });
    },
    [setSettings, settings],
  );

  const onChangeDirectionByLang = useCallback(
    (lang) => {
      const themeDirection = lang === 'ar' ? 'rtl' : 'ltr';
      setSettings({ ...settings, themeDirection });
    },
    [setSettings, settings],
  );

  // Layout
  const onToggleLayout = useCallback(() => {
    const themeLayout = settings.themeLayout === 'vertical' ? 'mini' : 'vertical';
    setSettings({ ...settings, themeLayout });
  }, [setSettings, settings]);

  const onChangeLayout = useCallback(
    (event) => {
      const themeLayout = event.target.value;
      setSettings({ ...settings, themeLayout });
    },
    [setSettings, settings],
  );

  // Contrast
  const onToggleContrast = useCallback(() => {
    const themeContrast = settings.themeContrast === 'default' ? 'bold' : 'default';
    setSettings({ ...settings, themeContrast });
  }, [setSettings, settings]);

  const onChangeContrast = useCallback(
    (event) => {
      const themeContrast = event.target.value;
      setSettings({ ...settings, themeContrast });
    },
    [setSettings, settings],
  );

  // Color
  const onChangeColorPresets = useCallback(
    (event) => {
      const themeColorPresets = event.target.value;
      setSettings({ ...settings, themeColorPresets });
    },
    [setSettings, settings],
  );

  // Stretch
  const onToggleStretch = useCallback(() => {
    const themeStretch = !settings.themeStretch;
    setSettings({ ...settings, themeStretch });
  }, [setSettings, settings]);

  // Reset
  const onResetSetting = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  const memoizedValue = useMemo(
    () => ({
      ...settings,
      // Add the resolved theme mode for the theme provider
      resolvedThemeMode,
      // Mode
      onToggleMode,
      onChangeMode,
      // Direction
      onToggleDirection,
      onChangeDirection,
      onChangeDirectionByLang,
      // Layout
      onToggleLayout,
      onChangeLayout,
      // Contrast
      onChangeContrast,
      onToggleContrast,
      // Stretch
      onToggleStretch,
      // Color
      onChangeColorPresets,
      presetsOption,
      presetsColor: getPresets(settings.themeColorPresets),
      // Reset
      onResetSetting,
      onToggleAnimation,
    }),
    [
      settings,
      resolvedThemeMode,
      // Mode
      onToggleMode,
      onChangeMode,
      // Direction
      onToggleDirection,
      onChangeDirection,
      onChangeDirectionByLang,
      // Layout
      onToggleLayout,
      onChangeLayout,
      onChangeContrast,
      // Contrast
      onToggleContrast,
      // Stretch
      onToggleStretch,
      // Color
      onChangeColorPresets,
      // Reset
      onResetSetting,
      // Animation
      onToggleAnimation,
    ],
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}

export default memo(SettingsProvider);
