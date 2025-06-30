import { LazyMotion, m } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo } from 'react';

// ----------------------------------------------------------------------

const loadFeatures = () => import('./features.js').then((res) => res.default);

MotionLazyContainer.propTypes = {
  children: PropTypes.node,
};

function MotionLazyContainer({ children }) {
  return (
    <LazyMotion
      strict
      features={loadFeatures}
    >
      <m.div style={{ height: '100%' }}> {children} </m.div>
    </LazyMotion>
  );
}

export default memo(MotionLazyContainer);
