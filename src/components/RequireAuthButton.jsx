import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { useAuthRequirement } from '../auth/AuthGuard.tsx';

// ----------------------------------------------------------------------

RequireAuthButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  requireAuth: PropTypes.bool,
};

export default function RequireAuthButton({
  children,
  onClick,
  requireAuth = true,
  ...other
}) {
  const { requireAuth: triggerAuth, isAuthenticated } = useAuthRequirement();

  const handleClick = (event) => {
    if (requireAuth && !isAuthenticated) {
      const authSuccess = triggerAuth();
      if (!authSuccess) {
        // Authentication modal will be shown, don't proceed with onClick
        return;
      }
    }

    // User is authenticated or auth not required, proceed with original onClick
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button onClick={handleClick} {...other}>
      {children}
    </Button>
  );
}
