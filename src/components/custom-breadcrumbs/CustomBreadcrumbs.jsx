import { Box, Link, Stack, Breadcrumbs } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
//
import LinkItem from './LinkItem';

// ----------------------------------------------------------------------

CustomBreadcrumbs.propTypes = {
  sx: PropTypes.object,
  action: PropTypes.node,
  links: PropTypes.array,
  heading: PropTypes.string,
  moreLink: PropTypes.array,
  activeLast: PropTypes.bool,
};

export default function CustomBreadcrumbs({
  links,
  action,
  button,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}) {
  const lastLink = links[links.length - 1]?.name;

  return (
    <Box sx={{ mb: 5, ml: 1, mr: 2, ...sx }}>
      <Stack
        direction="row"
        alignItems="center"
      >
        <Box sx={{ flexGrow: 1 }}>
          {/* HEADING */}
          {heading && (
            <Stack
              direction="row"
              gap={1}
            >
              {/* <Typography variant="h3">
                {heading}
              </Typography> */}
              {button && <Box sx={{ flexShrink: 0 }}> {button} </Box>}
            </Stack>
          )}

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs
              separator={<Separator />}
              {...other}
            >
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>

        {action && <Box sx={{ flexShrink: 0 }}> {action} </Box>}
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              noWrap
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}
// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
    />
  );
}
