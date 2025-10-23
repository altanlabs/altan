import { m, AnimatePresence } from 'framer-motion';
import React, { memo } from 'react';

import Login from '../../../../sections/auth/Login';

const SignupModal = ({ isOpen, onClose, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Message */}
              {message && (
                <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300">{message}</p>
                </div>
              )}

              {/* Login Form */}
              <div className="p-6">
                <Login
                  modal={true}
                  onClose={onClose}
                />
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(SignupModal);

