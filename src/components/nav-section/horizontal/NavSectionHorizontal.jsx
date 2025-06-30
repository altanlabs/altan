import { Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

// @mui
// utils
import NavList from './NavList';
import { hideScrollbarY } from '../../../utils/cssStyles';
//

// ----------------------------------------------------------------------

NavSectionHorizontal.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.array,
};

function NavSectionHorizontal({ data, sx, ...other }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        mx: 'auto',
        ...hideScrollbarY,
        ...sx,
      }}
      {...other}
    >
      {data.map((group) => (
        <Items
          key={group.subheader}
          items={group.items}
        />
      ))}
    </Stack>
  );
}

export default memo(NavSectionHorizontal);

// ----------------------------------------------------------------------

Items.propTypes = {
  items: PropTypes.array,
};

function Items({ items }) {
  return (
    <>
      {items.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={1}
          hasChild={!!list.children}
        />
      ))}
    </>
  );
}
