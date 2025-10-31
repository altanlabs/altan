import { alpha } from '@mui/material/styles';

// Unified palette that matches Tailwind CSS variables
// This ensures MUI and shadcn/ui look identical

// Helper to get CSS variable value
const getCSSVar = (varName) => `hsl(var(--${varName}))`;

// Grey scale matching Tailwind
const GREY = {
  0: '#F5F5F5',    // Soft matte white
  100: '#EAEAEA',  // Light grey
  200: '#D6D6D6',  // Muted grey (--muted)
  300: '#BEBEBE',  // Neutral grey
  400: '#9E9E9E',  // Medium grey
  500: '#7E7E7E',  // Standard matte grey (--muted-foreground dark)
  600: '#5E5E5E',  // Dark grey (--muted-foreground light)
  700: '#3E3E3E',  // Deep grey (--muted dark, --accent dark)
  800: '#2A2A2A',  // Charcoal grey (--card dark, --foreground light)
  900: '#121212',  // Matte black (--background dark)
};

// Primary - Neutral dark grey (ChatGPT style)
const PRIMARY = {
  lighter: '#737373',
  light: '#404040',
  main: '#171717',  // hsl(0 0% 9%) - near black
  dark: '#0D0D0D',
  darker: '#000000',
  contrastText: '#FAFAFA',
};

// Secondary - Subtle grey
const SECONDARY = {
  lighter: '#FAFAFA',
  light: '#F5F5F5',
  main: '#E5E5E5',  // hsl(0 0% 90%)
  dark: '#D4D4D4',
  darker: '#A3A3A3',
  contrastText: '#171717',
};

// Info - matches --info CSS variable (#00B8D9)
const INFO = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#00B8D9',  // hsl(189 100% 42.5%)
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
};

// Success - matches --success CSS variable (#22C55E)
const SUCCESS = {
  lighter: '#D3FCD2',
  light: '#77ED8B',
  main: '#22C55E',  // hsl(142 71% 45%)
  dark: '#118D57',
  darker: '#065E49',
  contrastText: '#FFFFFF',
};

// Warning - matches --warning CSS variable (#FFAB00)
const WARNING = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',  // hsl(40 100% 50%)
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: GREY[800],
};

// Error - matches --destructive CSS variable (#FF5630)
const ERROR = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',  // hsl(11 100% 60%)
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: { black: '#000000', white: '#FFFFFF' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export default function palette(themeMode) {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: GREY[800],     // --foreground
      secondary: GREY[600],   // --muted-foreground
      disabled: GREY[500],
    },
    background: {
      paper: '#FFFFFF',       // --card
      default: '#FFFFFF',     // --background
      neutral: GREY[200],     // --muted
    },
    action: {
      ...COMMON.action,
      active: GREY[600],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',     // --foreground
      secondary: GREY[500],   // --muted-foreground
      disabled: GREY[600],
    },
    background: {
      paper: GREY[800],       // --card (#2A2A2A)
      default: GREY[900],     // --background (#121212)
      neutral: alpha(GREY[500], 0.16),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  };

  return themeMode === 'light' ? light : dark;
}

// Export individual colors for direct use
export const grey = GREY;
export const primary = PRIMARY;
export const secondary = SECONDARY;
export const info = INFO;
export const success = SUCCESS;
export const warning = WARNING;
export const error = ERROR;
export const common = { black: '#000000', white: '#FFFFFF' };

