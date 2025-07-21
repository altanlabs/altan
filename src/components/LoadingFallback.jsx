import { m } from 'framer-motion';
import { memo } from 'react';

const LoadingFallback = () => {
  console.log("LoadingFallback")
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <m.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1.2 }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 0.5,
        }}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          backgroundColor: '#ddd',
        }}
      />
    </div>
  );
};

export default memo(LoadingFallback);
