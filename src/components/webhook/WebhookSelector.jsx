import { Stack, Typography } from '@mui/material';
import { memo, useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import CreateWebhookParameters from './CreateWebhookParameters';
import { selectConnectionTypes } from '../../redux/slices/connections';
import { useSelector } from '../../redux/store';
import PanelRow from '../../sections/@dashboard/flows/modulespanel/PanelRow';
import CustomDialog from '../dialogs/CustomDialog';
import VirtualizedList from '../virtualized/VirtualizedList';

// import { selectAccountId, selectExtendedResources } from "../../redux/slices/general";
// import ConnectionSelectorAutocomplete from "../tools/ConnectionSelectorAutocomplete";
// import CreateConnection from "../tools/CreateConnection";
// import { useDebounce } from "../../hooks/useDebounce";
// import { optimai_integration } from "../../utils/axios";
// import { useFormContext } from "react-hook-form";
// import { getNested } from "../tools/dynamic/utils";
// import { HoverBorderGradient } from "../aceternity/buttons/hover-border-gradient";
// import { checkObjectsEqual } from "../../redux/helpers/memoize";
// import ResourceSelector from "./ResourceSelector";

// const POPULAR_SHORTCUTS = [
//   {
//     id: 'forms_shortcut',
//     name: 'Form Response',
//     description: 'Trigger when a form is submitted',
//     icon: 'mdi:form-select',
//     shortcut: {
//       connectionTypeId: 'altan_platform',
//       webhookId: 'form_response',
//       eventType: 'FormResponseCompleted'
//     }
//   },
//   {
//     id: 'custom_webhook_shortcut',
//     name: 'Custom Webhook',
//     description: 'Create a new custom webhook endpoint',
//     icon: 'material-symbols:webhook',
//     shortcut: {
//       connectionTypeId: 'my_webhooks'
//     }
//   }
// ];

const selectTypesInitialized = (state) => state.connections.initialized.types;

const WebhookSelector = ({ setSelectedConnectionType }) => {
  const { handleSubmit, onSubmit } = useFormContext();
  // const [searchTerm, setSearchTerm] = useState('');
  const { setValue } = useFormContext();
  const [customWebhookDialogOpen, setCustomWebhookDialogOpen] = useState(false);
  const types = useSelector(selectConnectionTypes);
  const typesInitialized = useSelector(selectTypesInitialized);

  // const throttledSearchTerm = useDebounce(searchTerm, 500);

  // const onSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

  const onCloseCustomWebhookDialog = useCallback(() => setCustomWebhookDialogOpen(false), []);

  const onSelectCustomWebhook = useCallback(
    (webhook) => {
      onCloseCustomWebhookDialog();
      if (!!webhook) {
        setValue(
          'subscriptions',
          [
            {
              webhook_id: webhook.id,
              webhook,
            },
          ],
          { shouldDirty: true },
        );
        handleSubmit(onSubmit)();
      }
    },
    [handleSubmit, onCloseCustomWebhookDialog, onSubmit, setValue],
  );

  const openCustomWebhookDialog = useCallback(() => setCustomWebhookDialogOpen(true), []);
  // Filter connection types to only show those with webhooks
  const availableTypes = useMemo(() => {
    return types?.filter((type) => type.webhooks?.items?.length > 0) || [];
  }, [types]);

  return (
    <>
      <Stack
        spacing={1}
        padding={1}
        width="100%"
        className="rounded-lg backdrop-blur-lg"
      >
        {/* <TextField
          placeholder="Search..."
          value={searchTerm}
          onChange={onSearchChange}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:search" />
              </InputAdornment>
            ),
          }}
        /> */}
        {/* Search bar - always visible */}
        <Typography
          variant="subtitle2"
          sx={{ px: 2 }}
        >
          Popular Triggers
        </Typography>
        {/* {POPULAR_SHORTCUTS.map(shortcut => (
          <PanelRow
            key={shortcut.id}
            icon={shortcut.icon}
            name={shortcut.name}
            description={shortcut.description}
            onClick={() => setSelectedConnectionType(shortcut)}
          />
        ))} */}
        <PanelRow
          icon="material-symbols:webhook"
          name="Custom Webhook"
          description="Create a new custom webhook endpoint"
          onClick={openCustomWebhookDialog}
        />

        <Typography
          variant="subtitle2"
          sx={{ px: 2 }}
        >
          All Connection Types
        </Typography>
        <VirtualizedList
          data={availableTypes}
          height="400px"
          initialized={typesInitialized}
          renderItem={(index, type) => (
            <PanelRow
              key={type.id}
              icon={type.icon}
              name={type.name}
              description={type.description}
              disabled={!type?.webhooks?.items?.length}
              onClick={() => setSelectedConnectionType(type)}
            />
          )}
        />
      </Stack>
      <CustomDialog
        dialogOpen={customWebhookDialogOpen}
        onClose={onCloseCustomWebhookDialog}
        className="relative"
      >
        <CreateWebhookParameters
          onSaveWebhook={onSelectCustomWebhook}
          onClose={onCloseCustomWebhookDialog}
        />
      </CustomDialog>
    </>
  );
};

export default memo(WebhookSelector);
