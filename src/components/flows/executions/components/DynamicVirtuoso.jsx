import { Button, Popover } from '@mui/material';
import { memo, useState, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { CardTitle } from '../../../aceternity/cards/card-hover-effect.tsx';
import Iconify from '../../../iconify';

const virtuosoComponents = {
  Footer: () => <div style={{ height: '10px' }} />,
  Header: () => <div style={{ height: '10px' }} />,
};

const DynamicVirtuoso = ({ obj, path, renderItem }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);

  const handleOpenPopover = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const maxVisibleItems = 10; // Number of items for the normal list
  const remainingItems = obj.length - maxVisibleItems;

  return (
    <div>
      {/* Render normal list for up to 10 items */}
      <div className="space-y-1">
        {obj.slice(0, maxVisibleItems).map((item, index) => (
          <div key={`list-item-${path}-${index}`}>{renderItem(item, index)}</div>
        ))}
        {remainingItems > 0 && (
          <div className="mt-2">
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <Iconify
                  icon="mdi:plus-circle"
                  width={15}
                />
              }
              onClick={handleOpenPopover}
            >
              Show {remainingItems} more...
            </Button>
          </div>
        )}
      </div>

      {/* Popover with Virtuoso */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: '50vw', // Adjust width as needed
              height: '70vh',
              overflow: 'hidden',
              backgroundColor: 'transparent',
            },
            className:
              'relative px-2 py-4 backdrop-blur-lg border border-gray-400/40 rounded shadow-lg',
          },
        }}
      >
        <CardTitle>
          {path} ({obj.length} items)
        </CardTitle>
        <Virtuoso
          key={`virtuoso-arr-global-vars-${path}`}
          data={obj}
          style={{ height: '100%', overflowX: 'hidden' }}
          components={virtuosoComponents}
          overscan={2}
          increaseViewportBy={{ bottom: 0, top: 0 }}
          itemContent={(index, item) => (
            <div
              key={`virtuoso-item-${path}-${index}`}
              className="pb-1"
            >
              {renderItem(item, index)}
            </div>
          )}
        />
      </Popover>
    </div>
  );
};

export default memo(DynamicVirtuoso);
