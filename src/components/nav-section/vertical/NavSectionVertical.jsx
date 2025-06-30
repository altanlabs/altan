import { List, Stack } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
// locales
import { memo } from 'react';

import NavList from './NavList';
import { StyledSubheader } from './styles';
import { useLocales } from '../../../locales';
//

// ----------------------------------------------------------------------

NavSectionVertical.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.array,
  onCloseNav: PropTypes.func,
};

function NavSectionVertical({ data, onCloseNav, sx, ...other }) {
  const { translate } = useLocales();

  return (
    <Stack
      sx={sx}
      {...other}
    >
      {data.map((group) => {
        const key = group.subheader || group.items[0].title;
        return (
          <List
            key={key}
            disablePadding
            sx={{ px: 2 }}
          >
            {group.subheader && (
              <StyledSubheader disableSticky>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {`${translate(group.subheader)}`}
                  {group?.action}
                </Stack>
              </StyledSubheader>
            )}

            {group.items.map((list) => (
              <NavList
                key={list.title + list.path}
                data={list}
                depth={1}
                hasChild={!!list.children}
                onCloseNav={onCloseNav}
              />
            ))}
          </List>
        );
      })}
    </Stack>
  );
}

export default memo(NavSectionVertical);
