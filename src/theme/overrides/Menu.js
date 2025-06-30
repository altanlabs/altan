// ----------------------------------------------------------------------

export default function Menu(theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          // iOS touch fix - ensures touch events work properly on iOS devices
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'manipulation',
          cursor: 'pointer',
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          // Ensure the menu itself handles touch properly
          touchAction: 'manipulation',
        },
      },
    },
  };
}
