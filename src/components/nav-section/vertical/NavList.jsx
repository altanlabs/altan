import { Collapse } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useCallback, memo } from 'react';

// @mui
// hooks
import NavItem from './NavItem';
import useActiveLink from '../../../hooks/useActiveLink';
//

// ----------------------------------------------------------------------

function NavList({ data, onCloseNav, depth, hasChild }) {
  // const { pathname } = useLocation();

  const { active, isExternalLink } = useActiveLink(data.path);

  const [open, setOpen] = useState(true);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        isExternalLink={isExternalLink}
        onClick={handleToggle}
        onCloseNav={onCloseNav}
      />

      {hasChild && (
        <Collapse
          in={open}
          unmountOnExit
        >
          <NavSubList
            data={data.children}
            depth={depth}
            onCloseNav={onCloseNav}
          />
        </Collapse>
      )}
    </>
  );
}

NavList.propTypes = {
  data: PropTypes.object,
  onCloseNav: PropTypes.func,
  depth: PropTypes.number,
  hasChild: PropTypes.bool,
};

export default memo(NavList);

// ----------------------------------------------------------------------

const NavSubList = memo(({ data, onCloseNav, depth }) => {
  return (
    <>
      {data.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={depth + 1}
          onCloseNav={onCloseNav}
          hasChild={!!list.children}
        />
      ))}
    </>
  );
});

NavSubList.propTypes = {
  data: PropTypes.array,
  onCloseNav: PropTypes.func,
  depth: PropTypes.number,
};
