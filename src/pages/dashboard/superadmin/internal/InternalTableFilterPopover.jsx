import { IconButton, Button, Stack, Popover, Typography } from '@mui/material';
import { memo, useCallback, useState } from 'react';

import FilterSpec from '../../../../components/graphqueryspec/filterspec/FilterSpec';
import Iconify from '../../../../components/iconify';
import { bgBlur } from '../../../../utils/cssStyles';

const InternalTableFilterPopover = ({ filter, setFilter, onSearch, table }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const onClose = useCallback(() => setAnchorEl(null), []);

  const onSearchClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Iconify icon="iconamoon:search-duotone" />
      </IconButton>
      <Popover
        id="internalTableFilterPopover"
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '500px',
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          paddingX={2}
          paddingY={1}
          width="100%"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            minWidth: 500,
            ...bgBlur({ opacity: 0.3, blur: 4 }),
            '&:hover': {
              '& .delete-condition-icon-button': {
                display: 'flex',
              },
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="h5">Search in {table}</Typography>
          </Stack>
          <Button
            variant="soft"
            onClick={onSearchClick}
            disabled={!filter}
            startIcon={<Iconify icon="iconamoon:search-duotone" />}
          >
            Search {!!Object.keys(filter ?? {}).length ? 'with Filters' : ''}
          </Button>
        </Stack>
        <FilterSpec
          value={filter}
          onChange={setFilter}
        />
      </Popover>
    </>
  );
};

export default memo(InternalTableFilterPopover);
