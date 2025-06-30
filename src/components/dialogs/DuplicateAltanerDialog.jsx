import {
  Stack,
  DialogActions,
  Switch,
  FormControlLabel,
  TextField,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useCallback, memo, useState, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Virtuoso } from 'react-virtuoso';

import CustomDialog from './CustomDialog.jsx';
import { useDebounce } from '../../hooks/useDebounce';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { duplicateAltaner } from '../../redux/slices/altaners';
import { selectAccount } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import addAccountIdToUrl from '../../utils/addAccountIdToUrl';
import formatData from '../../utils/formatData';
import { CardTitle } from '../aceternity/cards/card-hover-effect.tsx';
import InteractiveButton from '../buttons/InteractiveButton.jsx';
import Iconify from '../iconify/Iconify';
import FormParameter from '../tools/form/FormParameter.jsx';

const getDuplicateAltanerSchema = () => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'New altaner name',
      'x-hide-label': true,
    },
  },
  required: ['name'],
});

const getAccountName = (account) =>
  account?.company?.name ||
  account?.name ||
  account?.meta_data?.name ||
  account?.meta_data?.displayName;

const DuplicateAltanerDialog = ({ open, onClose, altanerToClone = null }) => {
  const [copyRecords, setCopyRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const debouncedSearchQuery = useDebounce(searchTerm, 500);

  const currentAccount = useSelector(selectAccount);
  const accounts = useSelector((state) => state.general.accounts);

  // Set current account as default when dialog opens
  useEffect(() => {
    if (open && currentAccount && !selectedAccount) {
      setSelectedAccount(currentAccount);
    }
  }, [open, currentAccount, selectedAccount]);

  // Prepare accounts list with current account first
  const sortedAccounts = useMemo(() => {
    const otherAccounts = accounts.filter((acc) => acc.id !== currentAccount?.id);
    const filteredOtherAccounts = otherAccounts.filter((account) => {
      const accountName = getAccountName(account)?.toLowerCase() || '';
      return accountName.includes(debouncedSearchQuery.toLowerCase());
    });

    // If current account matches search, include it first
    if (
      !debouncedSearchQuery ||
      getAccountName(currentAccount)?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    ) {
      return [currentAccount, ...filteredOtherAccounts];
    }
    return filteredOtherAccounts;
  }, [accounts, currentAccount, debouncedSearchQuery]);

  const methods = useForm({
    defaultValues: {
      name: altanerToClone ? `${altanerToClone.name} (Copy)` : 'Copy of altaner',
    },
  });

  const { handleSubmit } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const schema = getDuplicateAltanerSchema();

  const handleCopyRecordsChange = (event) => {
    setCopyRecords(event.target.checked);
  };

  const handleSearchChange = useCallback((event) => setSearchTerm(event.target.value), []);

  const handleSelectAccount = useCallback((account) => {
    setSelectedAccount(account);
  }, []);

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      if (!altanerToClone || !selectedAccount) {
        return;
      }

      const formattedData = formatData(data, schema.properties);
      const duplicateData = {
        target_account_id: selectedAccount.id,
        name: formattedData.name,
        copy_records: copyRecords,
      };

      dispatchWithFeedback(duplicateAltaner(altanerToClone.id, duplicateData), {
        useSnackbar: true,
        successMessage: 'Altaner duplicated successfully',
        errorMessage: 'Could not duplicate altaner',
      }).then(() => {
        onClose();
      });
    }),
    [
      altanerToClone,
      copyRecords,
      dispatchWithFeedback,
      onClose,
      schema.properties,
      selectedAccount,
    ],
  );

  const handleClose = useCallback(() => {
    setSearchTerm('');
    setSelectedAccount(null);
    onClose();
  }, [onClose]);

  if (!altanerToClone) {
    return null;
  }

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleClose}
      maxWidth="xs"
    >
      <Stack
        direction="row"
        alignItems="center"
        padding={2}
      >
        <CardTitle>Duplicate Altaner</CardTitle>
      </Stack>
      <FormProvider {...methods}>
        <Stack
          padding={2}
          spacing={2}
        >
          {/* Account Selection Section */}
          <div>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
            >
              Select Target Workspace
            </Typography>
            <TextField
              size="small"
              margin="dense"
              label="Search workspaces..."
              type="text"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      width={20}
                      height={20}
                    />
                  </InputAdornment>
                ),
              }}
            />
            <div style={{ height: '200px', marginTop: '8px' }}>
              <Virtuoso
                style={{ height: '100%' }}
                data={sortedAccounts}
                itemContent={(index, account) => (
                  <ListItemButton
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    selected={selectedAccount?.id === account.id}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor:
                        selectedAccount?.id === account.id ? 'action.selected' : 'transparent',
                      ...(account.id === currentAccount?.id && {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        mb: 1,
                        pb: 1,
                      }),
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={addAccountIdToUrl(account?.company?.logo_url, account.id)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={getAccountName(account)}
                      secondary={account.id === currentAccount?.id ? '(Current Workspace)' : null}
                      primaryTypographyProps={{
                        fontWeight: account.id === currentAccount?.id ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                )}
              />
            </div>
          </div>

          {/* Name and Options Section */}
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            const required = schema.required.includes(key);
            return (
              <FormParameter
                key={key}
                fieldKey={key}
                schema={fieldSchema}
                required={required}
                enableLexical={false}
              />
            );
          })}
          <FormControlLabel
            control={
              <Switch
                checked={copyRecords}
                onChange={handleCopyRecordsChange}
                name="copyRecords"
                color="primary"
              />
            }
            label="Copy records"
          />
        </Stack>
        <DialogActions>
          <InteractiveButton
            icon="mdi:copy"
            title="Duplicate Altaner"
            onClick={onSubmit}
            duration={8000}
            containerClassName="h-[40]"
            borderClassName="h-[80px] w-[250px]"
            enableBorder={true}
            loading={isSubmitting}
            disabled={!selectedAccount}
          />
        </DialogActions>
      </FormProvider>
    </CustomDialog>
  );
};

export default memo(DuplicateAltanerDialog);
