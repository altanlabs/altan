// @mui
import {
  Paper,
  Stack,
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
} from '@mui/material';
import { DateRangePicker as ProDateRangePicker, DateRangeCalendar } from '@mui/x-date-pickers-pro';
import PropTypes from 'prop-types';

// hooks
import useResponsive from '../../hooks/useResponsive';

// ----------------------------------------------------------------------

DateRangePicker.propTypes = {
  open: PropTypes.bool,
  isError: PropTypes.bool,
  onClose: PropTypes.func,
  onReset: PropTypes.func,
  title: PropTypes.string,
  onChangeEndDate: PropTypes.func,
  onChangeStartDate: PropTypes.func,
  variant: PropTypes.oneOf(['input', 'calendar']),
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
};

export default function DateRangePicker({
  title = 'Select date range',
  variant = 'input',
  //
  range,
  //
  onChangeRange,
  //
  open,
  onClose,
  //
  isError,
  onReset,
}) {
  const isDesktop = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  return (
    <Dialog
      fullWidth
      maxWidth={isCalendarView ? false : 'xs'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isCalendarView && {
            maxWidth: 720,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent
        sx={{
          ...(isCalendarView &&
            isDesktop && {
            overflow: 'unset',
          }),
        }}
      >
        <Stack
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && isDesktop ? 'row' : 'column'}
          justifyContent="center"
          sx={{
            pt: 1,
            '& .MuiCalendarPicker-root': {
              ...(!isDesktop && {
                width: 'auto',
              }),
            },
          }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <DateRangeCalendar
                  value={range}
                  onChange={onChangeRange}
                />
              </Paper>

              {/* <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <CalendarPicker date={endDate} onChange={onChangeEndDate} />
              </Paper> */}
            </>
          ) : (
            <>
              <ProDateRangePicker
                value={range}
                onChange={onChangeRange}
              />

              {/* <DatePicker
                label="End date"
                value={endDate}
                onChange={onChangeEndDate}
                renderInput={(params) => <TextField {...params} />}
              /> */}
            </>
          )}
        </Stack>

        {isError && (
          <FormHelperText
            error
            sx={{ px: 2 }}
          >
            End date must be later than start date
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        {!!range.length && (
          <Button
            variant="outlined"
            color="error"
            onClick={onReset}
          >
            Clear
          </Button>
        )}

        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          disabled={isError}
          variant="contained"
          onClick={onClose}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
