import { Stack, Typography, Tooltip } from '@mui/material';
import {
  useState,
  // useRef,
  useEffect,
  memo,
  useCallback,
  useMemo,
} from 'react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@lib/utils';

import Iconify from '../iconify';
import CreateWebhookParameters from './CreateWebhookParameters';
import TestWebhook from './TestWebhook';
// import { useFormContext } from 'react-hook-form';
import WebhookEventSelector from './WebhookEventSelector';
import WebhookSelector from './WebhookSelector';
import { HoverBorderGradient } from '../aceternity/buttons/hover-border-gradient';
import ConfirmationButton from '../buttons/ConfirmationButton';
import CustomDialog from '../dialogs/CustomDialog.jsx';

// const selectSelectedWebhook = (webhookId) => createSelector(
//   [selectAllWebhooks],
//   (webhooks) => webhooks.find(wh => wh.id === webhookId),
//   {
//     memoizeOptions: {
//       resultEqualityCheck: checkObjectsEqual
//     }
//   }
// );

const Webhook = ({ value }) => {
  const [customWebhookDialogOpen, setCustomWebhookDialogOpen] = useState(false);
  const subscriptions = useMemo(
    () => (!!value && typeof value === 'object' && Array.isArray(value) ? value : []),
    [value],
  );
  const [isEdit, setIsEdit] = useState(false);
  const { setValue } = useFormContext();

  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);

  // const [openTestWebhook, setOpenTestWebhook] = useState(false);

  const editSubscriptions = useCallback(() => setIsEdit(true), []);
  const stopEditing = useCallback(() => setIsEdit(false), []);
  const onCloseCustomWebhookDialog = useCallback(() => setCustomWebhookDialogOpen(false), []);
  const openCustomWebhookDialog = useCallback(() => setCustomWebhookDialogOpen(true), []);

  const isCustomWebhook = useMemo(
    () => !!selectedWebhook && !(selectedWebhook.is_internal || selectedWebhook.is_shared),
    [selectedWebhook],
  );

  useEffect(() => {
    if (!subscriptions.length) {
      setIsEdit(true);
    } else {
      setSelectedWebhook(
        Object.values(
          subscriptions.reduce((acc, subs) => {
            acc[subs.webhook_id] = subs.webhook;
            return acc;
          }, {}),
        )[0],
      );
    }
  }, [subscriptions]);

  useEffect(() => {
    if (!!isCustomWebhook) {
      setIsEdit(false);
    }
  }, [isCustomWebhook]);

  const handleReplaceWebhook = useCallback(() => {
    setValue('subscriptions', [], {
      shouldDirty: true,
    });
  }, [setValue]);

  // const onTestWebhookOpen = useCallback(() => setOpenTestWebhook(true), []);
  // const onTestWebhookClose = useCallback(() => setOpenTestWebhook(false), []);

  const onClickLink = useCallback(
    () =>
      navigator.clipboard.writeText(`https://api.altan.ai/galaxia/hook/${selectedWebhook?.url}`),
    [selectedWebhook?.url],
  );

  const onEdit = useCallback(
    () => (isCustomWebhook ? openCustomWebhookDialog() : editSubscriptions()),
    [editSubscriptions, isCustomWebhook, openCustomWebhookDialog],
  );

  if (!isEdit) {
    return (
      <>
        <Stack
          spacing={1}
          padding={2}
          width="100%"
          className="backdrop-blur-lg rounded-3xl"
        >
          <Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Iconify
                icon="material-symbols:webhook"
                className="min-w-fit"
              />
              <Tooltip
                arrow
                title={selectedWebhook?.description}
              >
                <Typography
                  variant="body"
                  noWrap
                  className="tracking-wide font-bold"
                >
                  {selectedWebhook?.name}
                </Typography>
              </Tooltip>
              <HoverBorderGradient
                containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
                as="button"
                className={cn(
                  'transition-all duration-200 w-[36px] h-[20px] text-sm bg-slate-700 dark:bg-slate-400 dark:hover:bg-slate-300 text-black dark:text-white flex items-center space-x-2 px-2 py-0',
                  isCustomWebhook ? 'group-hover:w-[125px]' : 'group-hover:w-[155px]',
                )}
                onClick={onEdit}
                disableAnimation
              >
                <Iconify
                  className="text-white dark:text-black"
                  icon="mdi:edit"
                />
                <Typography
                  noWrap
                  variant="body"
                  className="w-full flex-no-wrap hidden group-hover:flex text-white dark:text-black"
                >
                  Edit {isCustomWebhook ? 'webhook' : 'subscriptions'}
                </Typography>
              </HoverBorderGradient>
              {isCustomWebhook && (
                <ConfirmationButton
                  containerClassName="group rounded-full bg-transparent border-transparent"
                  className="transition-all duration-200 w-[36px] h-[20px] group-hover:w-[155px] text-sm bg-slate-300 dark:bg-slate-700 text-black dark:text-white flex items-center space-x-2 px-2 py-1"
                  onClick={handleReplaceWebhook}
                  confirmationMessage="Are you sure you want to replace the webhook?"
                  confirmButtonText="Yes"
                  cancelButtonText="No"
                  disableAnimation
                  danger
                >
                  <Iconify
                    className="text-black dark:text-white"
                    icon="ic:outline-change-circle"
                  />
                  <Typography
                    noWrap
                    variant="body"
                    className="w-full flex-no-wrap hidden group-hover:flex text-black dark:text-white"
                  >
                    Replace webhook
                  </Typography>
                </ConfirmationButton>
              )}
              {/* <Chip label={`${subscriptions?.length ?? 0} subscription${(subscriptions?.length ?? 0) > 1 ? 's' : ''}`} size="small" /> */}
            </Stack>
            {isCustomWebhook && (
              <Typography
                className="cursor-copy"
                color="primary"
                onClick={onClickLink}
              >
                https://api.altan.ai/galaxia/hook/{selectedWebhook?.url}
              </Typography>
            )}
          </Stack>
          <Stack spacing={0.5}>
            {!selectedWebhook ? null : isCustomWebhook ? (
              <>
                <TestWebhook
                  // open={openTestWebhook}
                  // onClose={onTestWebhookClose}
                  webhook={selectedWebhook}
                />
                {/* <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={onTestWebhookOpen}
                    >
                      Send Payload
                    </Button> */}
              </>
            ) : (
              <WebhookEventSelector
                editable={false}
                selectedConnectionType={selectedConnectionType}
                setSelectedConnectionType={setSelectedConnectionType}
              />
            )}
          </Stack>
        </Stack>
        {!isCustomWebhook ? null : (
          <CustomDialog
            dialogOpen={customWebhookDialogOpen}
            onClose={onCloseCustomWebhookDialog}
          >
            <CreateWebhookParameters
              webhook={selectedWebhook}
              onClose={onCloseCustomWebhookDialog}
            />
          </CustomDialog>
        )}
      </>
    );
  }

  return (
    <Stack
      spacing={1}
      width="100%"
    >
      {!selectedConnectionType ? (
        <WebhookSelector setSelectedConnectionType={setSelectedConnectionType} />
      ) : (
        <>
          <HoverBorderGradient
            containerClassName="z-0 group rounded-full bg-white dark:bg-black border-transparent"
            as="button"
            className="text-sm bg-slate-400 text-black dark:text-white flex items-center space-x-2 px-2 py-1"
            onClick={stopEditing}
          >
            <Iconify
              className="text-black"
              icon="charm:cross"
            />
            <Typography
              noWrap
              variant="body"
              className="w-full flex-no-wrap text-black"
            >
              Stop Editing
            </Typography>
          </HoverBorderGradient>
          <WebhookEventSelector
            editable={true}
            selectedConnectionType={selectedConnectionType}
            setSelectedConnectionType={setSelectedConnectionType}
          />
        </>
      )}
    </Stack>
  );
};

export default memo(Webhook);
