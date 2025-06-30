import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/system';
import React, { memo, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { cn } from '@lib/utils';

import {
  CardDescription,
  CardTitle,
} from '../../../../components/aceternity/cards/card-hover-effect';
import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';

const VersionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -16,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.palette.divider,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: -16,
    top: '50%',
    width: 16,
    height: 2,
    backgroundColor: theme.palette.divider,
  },
}));

const VersionDot = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(2),
}));

const VersionDialog = ({ open, onClose, template }) => {
  const history = useHistory();;
  // console.log("versions", versions);

  // Sort versions by date_creation, most recent first
  const sortedVersions = useMemo(
    () =>
      [...(template?.versions ?? [])].sort(
        (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
      ),
    [template?.versions],
  );

  // const getNavigationPath = () => {
  //   switch (templateType) {
  //     case 'workflow':
  //       return '/flows';
  //     case 'agent':
  //       return '/agents';
  //     // Add more cases for other template types as needed
  //     default:
  //       return '/';
  //   }
  // };

  // Assuming all versions have the same branch for now
  const branch = useMemo(() => sortedVersions[0]?.branch || 'master', [sortedVersions]);
  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <DialogTitle>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack>
            <CardTitle>Select version</CardTitle>
            <CardDescription className="text-xs font-light">
              {template?.name ?? template?.parent?.name}
            </CardDescription>
          </Stack>
          <FormControl
            variant="filled"
            size="small"
            sx={{ minWidth: 120 }}
          >
            <InputLabel id="branch-select-label">Branch</InputLabel>
            <Select
              labelId="branch-select-label"
              id="branch-select"
              value={branch}
              onChange={() => {}} // No functionality for now
              label="Branch"
            >
              <MenuItem value={branch}>{branch}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack
          spacing={1}
          sx={{ position: 'relative', pl: 2 }}
        >
          {sortedVersions.map((version, index) => (
            <VersionItem
              key={index}
              className={cn(
                'rounded-2xl bg-transparent',
                !index && 'border border-gray-300 dark:border-gray-700 shadow-2xl',
              )}
            >
              <VersionDot />
              <Box flexGrow={1}>
                <Typography variant="subtitle1">Version {version.version}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {new Date(version.date_creation).toLocaleString()} -{' '}
                  {version.description || 'No description'}
                </Typography>
              </Box>
              <Button
                size="large"
                variant="soft"
                color="inherit"
                sx={{ mr: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  history.push(`/dashboard?template=${version.id}`);
                }}
              >
                Clone
              </Button>
            </VersionItem>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(VersionDialog);
