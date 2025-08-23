import { useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { memo, useState, useRef, useEffect } from 'react';

import Iconify from '../../../../components/iconify';

const NavDropdown = memo(
  ({
    triggerElement,
    items,
    renderItem,
    addOption,
    dropdownStyle: customDropdownStyle,
    dropdownWidth = '12rem',
    customHeader,
  }) => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleClick = () => {
      setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, []);

    const closeDropdown = () => {
      setIsOpen(false);
    };

    const defaultDropdownStyle = {
      position: 'absolute',
      zIndex: 50,
      width: dropdownWidth,
      marginTop: '0.25rem',
      padding: '0rem',
      borderRadius: '0.375rem',
      background: theme.palette.background.paper,
      boxShadow: theme.customShadows.z20,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
      maxHeight: '20rem', // Limit height to enable scrolling
      overflow: 'hidden', // Hide overflow on container
    };

    const mergedDropdownStyle = { ...defaultDropdownStyle, ...customDropdownStyle };

    return (
      <div
        className="relative"
        ref={dropdownRef}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        {typeof triggerElement === 'function' ? triggerElement(isOpen) : triggerElement}

        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ y: -5, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -5, scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={mergedDropdownStyle}
            >
              {/* Custom header (like search input) */}
              {customHeader && customHeader()}

              {/* Scrollable container for items */}
              <div
                style={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  maxHeight: customHeader ? '16rem' : '18rem', // Adjust height based on header presence
                }}
                className="dropdown-scrollable"
              >
                {items.map((item, index) => (
                  <m.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                      ease: 'easeInOut',
                    }}
                  >
                    {renderItem(item, closeDropdown)}
                  </m.div>
                ))}
              </div>

              {addOption && items.length > 0 && (
                <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700" />
              )}
              {addOption && (
                <m.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{
                    duration: 0.2,
                    delay: items.length * 0.03,
                  }}
                >
                  <m.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addOption.onClick();
                      closeDropdown();
                    }}
                    className="px-2 py-2 cursor-pointer text-sm w-full text-left flex items-center gap-x-1.5 text-blue-500 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {addOption.icon && (
                      <Iconify
                        icon={addOption.icon}
                        width={18}
                      />
                    )}
                    <span>{addOption.label}</span>
                  </m.div>
                </m.div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

NavDropdown.propTypes = {
  triggerElement: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }),
  ).isRequired,
  renderItem: PropTypes.func.isRequired,
  addOption: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  }),
  dropdownStyle: PropTypes.object,
  dropdownWidth: PropTypes.string,
  customHeader: PropTypes.func,
};

NavDropdown.displayName = 'NavDropdown';

export default NavDropdown;
