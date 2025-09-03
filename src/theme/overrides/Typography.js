// ----------------------------------------------------------------------

export default function Typography(theme) {
  return {
    MuiTypography: {
      styleOverrides: {
        paragraph: {
          marginBottom: theme.spacing(2),
        },
        gutterBottom: {
          marginBottom: theme.spacing(1),
        },
        // Ensure body text uses primary color in dark mode for better contrast
        body1: {
          color: theme.palette.text.primary,
        },
        body2: {
          color: theme.palette.text.primary,
        },
      },
    },
  };
}
