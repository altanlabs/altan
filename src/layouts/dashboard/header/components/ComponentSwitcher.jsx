import { Box, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimatePresence, m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo } from 'react';

import Iconify from '../../../../components/iconify';

const ComponentSwitcher = memo(
  ({
    components,
    activeComponent,
    onComponentSelect,
  }) => {
    const theme = useTheme();

    const handleComponentClick = (componentId) => {
      onComponentSelect(componentId);
    };

    return (
      <Box
        sx={{
          display: 'flex',
          borderRadius: 2,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
          p: 0.5,
        }}
      >
        {components.map((component) => {
          const isActive = component.id === activeComponent?.id;

          return (
            <Box
              key={component.id}
              sx={{ position: 'relative' }}
            >
              <Tooltip
                title={component.name}
                placement="bottom"
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[800], 0.95)
                        : alpha(theme.palette.grey[700], 0.95),
                      backdropFilter: 'blur(8px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    },
                  },
                  arrow: {
                    sx: {
                      color: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.grey[800], 0.95)
                        : alpha(theme.palette.grey[700], 0.95),
                    },
                  },
                }}
              >
                <Box
                  component="button"
                  onClick={() => handleComponentClick(component.id)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 32,
                    border: 'none',
                    borderRadius: 2.5,
                    backgroundColor: 'transparent',
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: theme.palette.text.primary,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {component.icon && (
                    <Iconify
                      icon={component.icon}
                      width={16}
                      height={16}
                    />
                  )}

                  {/* Active state background with animation */}
                  <AnimatePresence>
                    {isActive && (
                      <m.div
                        layoutId="activeComponentTab"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 6,
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          zIndex: -1,
                        }}
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Box>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
    );
  },
);

ComponentSwitcher.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  activeComponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
  }),
  onComponentSelect: PropTypes.func.isRequired,
};

ComponentSwitcher.displayName = 'ComponentSwitcher';

export default ComponentSwitcher;
