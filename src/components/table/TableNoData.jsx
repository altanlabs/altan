import { TableRow, TableCell } from '@mui/material';
import PropTypes from 'prop-types';

// @mui
//
import EmptyContent from '../empty-content';

// ----------------------------------------------------------------------

TableNoData.propTypes = {
  isNotFound: PropTypes.bool,
};

export default function TableNoData({ isNotFound }) {
  return (
    <TableRow>
      {isNotFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            title="No knowledge yet :("
            description="Why not add some?"
            sx={{
              '& span.MuiBox-root': { height: 160 },
            }}
          />
        </TableCell>
      ) : (
        <TableCell
          colSpan={12}
          sx={{ p: 0 }}
        />
      )}
    </TableRow>
  );
}
