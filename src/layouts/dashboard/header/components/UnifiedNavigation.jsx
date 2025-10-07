import { Box, Divider } from '@mui/material';
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
        borderRadius: 1.5,
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
      <Box
        component="button"
        onClick={handleBackClick}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 30,
          border: 'none',
          borderRadius: 1.25,
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

      {/* Altaner Name */}
      {altaner?.name && (
        <>
          <Box
            component="button"
            onClick={handleAltanerClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 28,
              px: 0.75,
              border: 'none',
              borderRadius: 1.25,
              backgroundColor: 'transparent',
              color: theme.palette.text.primary,
              cursor: 'pointer',
              fontSize: '0.8125rem',
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

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 16,
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
                component="button"
                onClick={() => handleComponentClick(component.id)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  height: 28,
                  px: isActive ? 1 : 0.5,
                  border: 'none',
                  borderRadius: 10,
                  backgroundColor: isActive 
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',

                  '&:hover': {
                    color: theme.palette.text.primary,
                    backgroundColor: isActive 
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.text.primary, 0.05),
                  },
                }}
              >
                {component.icon && (
                  <Iconify
                    icon={component.icon}
                    width={15}
                    height={15}
                  />
                )}
                
                {isActive && (
                  <Box component="span">
                    {component.name === 'Database' ? 'Cloud' : component.name}
                  </Box>
                )}

               
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
