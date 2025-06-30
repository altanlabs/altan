/* eslint-disable react-hooks/rules-of-hooks */
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { IconButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { optimai_tables } from '../../../../../utils/axios';

export const getTriggerColumnDef = ({ field, getCommonFieldMenuItems }) => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    ...field,
    editable: false,
    width: 100,
    headerComponent: (params) => {
      const IconComponent = field.icon;
      return (
        <div className="flex items-center gap-2">
          <IconComponent
            fontSize="small"
            sx={{ opacity: 0.7 }}
          />
          <span>{params.displayName}</span>
        </div>
      );
    },
    cellRenderer: (params) => {
      const [status, setStatus] = useState('idle');

      const handleClick = async () => {
        setStatus('loading');
        try {
          await optimai_tables.get(`/table/${field.table_id}/record/${params.data.id}/trigger`);
          setStatus('success');
          enqueueSnackbar('Triggered successfully', { variant: 'success' });
          setTimeout(() => setStatus('idle'), 1000);
        } catch (error) {
          enqueueSnackbar('Error executing trigger', { variant: 'error' });
          setStatus('idle');
        }
      };

      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            color="success"
            size="small"
            onClick={handleClick}
            disabled={status !== 'idle'}
          >
            {status === 'loading' && <CircularProgress size={20} />}
            {status === 'success' && <CheckIcon />}
            {status === 'idle' && <PlayArrowIcon />}
          </IconButton>
        </div>
      );
    },
    menuItems: getCommonFieldMenuItems(field),
  };
};
