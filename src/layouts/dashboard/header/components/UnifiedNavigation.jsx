import { Box, Tooltip, Divider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AnimatePresence, m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Iconify from '../../../../components/iconify';
import Logo from '../../../../components/logo/Logo';

const UnifiedNavigation = memo(({
  altaner,
  components,
  activeComponent,
  onComponentSelect,
  onBackToDashboard,
  onEditAltaner,
}) => {
  const theme = useTheme();
  const history = useHistory();

  const handleBackClick = useCallback((event) => {
    event.stopPropagation();
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      history.push('/');
    }
  }, [onBackToDashboard, history]);

  const handleAltanerClick = useCallback((event) => {
    event.stopPropagation();
    if (onEditAltaner) {
      onEditAltaner();
    }
  }, [onEditAltaner]);

  const handleComponentClick = useCallback((componentId) => {
    onComponentSelect(componentId);
  }, [onComponentSelect]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 2,
        marginTop: .5,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.8)} 0%, 
          ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
        p: 0.25,
        gap: 0.5,
      }}
    >
      {/* Back to Dashboard Button */}
      <Tooltip
        title="Back to Dashboard"
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
            }
          },
          arrow: {
            sx: {
              color: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.grey[800], 0.95)
                : alpha(theme.palette.grey[700], 0.95),
            }
          }
        }}
      >
        <Box
          component="button"
          onClick={handleBackClick}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 32,
            border: 'none',
            borderRadius: 1.5,
            backgroundColor: 'transparent',
            color: theme.palette.text.secondary,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            overflow: 'hidden',
            '&:hover': {
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              '& .altaner-icon': { opacity: 0, transform: 'scale(0.8)' },
              '& .back-icon': { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          <Box
            className="altaner-icon"
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              opacity: 1,
              transform: 'scale(1)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Logo minimal />
          </Box>
          <Box
            className="back-icon"
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              opacity: 0,
              transform: 'scale(0.8)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Iconify
              icon="mdi:arrow-left"
              width={16}
              height={16}
            />
          </Box>
        </Box>
      </Tooltip>

      {/* Altaner Name */}
      {altaner?.name && (
        <>
          <Tooltip
            title="Edit Project"
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
                }
              },
              arrow: {
                sx: {
                  color: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.grey[800], 0.95)
                    : alpha(theme.palette.grey[700], 0.95),
                }
              }
            }}
          >
            <Box
              component="button"
              onClick={handleAltanerClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
                pr: 1,
                border: 'none',
                borderRadius: 1.5,
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {altaner.name}
            </Box>
          </Tooltip>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 20,
              alignSelf: 'center',
              borderColor: alpha(theme.palette.divider, 0.3),
            }}
          />
        </>
      )}

      {/* Component Switcher */}
      {components && components.length > 0 && (
        <>
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
                      borderRadius: 1.5,
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
        </>
      )}
    </Box>
  );
});

UnifiedNavigation.propTypes = {
  altaner: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string,
      type: PropTypes.string,
    }),
  ),
  activeComponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    type: PropTypes.string,
  }),
  onComponentSelect: PropTypes.func.isRequired,
  onBackToDashboard: PropTypes.func,
  onEditAltaner: PropTypes.func,
};

UnifiedNavigation.displayName = 'UnifiedNavigation';

export default UnifiedNavigation;
