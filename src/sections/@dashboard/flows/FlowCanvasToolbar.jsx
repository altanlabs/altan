import {
  Button,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Tooltip,
  Box,
  Switch,
} from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import { m, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
// import { createTemplate } from "../../../redux/slices/general";
// import { useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { cn } from '@lib/utils';

import ExecutionButtonPopover from './toolbar/ExecutionButtonPopover.jsx';
import ExecutionHistoryButtonPopover from './toolbar/ExecutionHistoryButtonPopover.jsx';
import RunningExecutionsPopover from './toolbar/RunningExecutionsPopover.jsx';
import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient.tsx';
import { CardTitle } from '../../../components/aceternity/cards/card-hover-effect.tsx';
import InteractiveButton from '../../../components/buttons/InteractiveButton.jsx';
import FormDialog from '../../../components/FormDialog.jsx';
import Iconify from '../../../components/iconify';
import { useSettingsContext } from '../../../components/settings/SettingsContext.jsx';
import TemplateDialog from '../../../components/templates/TemplateDialog.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { checkObjectsEqual } from '../../../redux/helpers/memoize';
import {
  activateFlow,
  // clearFlowExecution,
  patchFlow,
  // selectCurrentExecutionFromHistory,
  selectFlow,
  selectFlowModules,
  selectFlowId,
  selectTotalFlowModules,
  getFlowExecutions,
  // selectFlowExecutions,
  selectFlowTemplate,
  selectCurrentRunningExecutions,
  selectTotalExecutionsEventsHistory,
  selectFlowSchema,
} from '../../../redux/slices/flows';
import { createTemplate } from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';

const AnimatedButton = ({ children, ...props }) => (
  <m.div
    initial={{ opacity: 0, scale: 0.9, x: 20 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.9, x: -20 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
    {...props}
  >
    {children}
  </m.div>
);

const AnimatedIconButton = ({ children, ...props }) => (
  <m.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
    {...props}
  >
    {children}
  </m.div>
);

export const selectEntryModule = createSelector(
  [selectFlow, selectFlowModules],
  (flow, modules) => {
    if (!flow || !flow.entry_module_id) return null;
    return modules[flow.entry_module_id] || null;
  },
);

const selectFlowDetails = createSelector(
  [selectFlow],
  (flow) => ({
    id: flow?.id,
    name: flow?.name,
    description: flow?.description,
    is_active: flow?.is_active,
    meta_data: flow?.meta_data,
    member_id: flow?.member_id,
    room_id: flow?.room_id,
    account_id: flow?.account_id,
    cloned_template_id: flow?.cloned_template_id,
    total_executions: flow?.executions,
    template: flow?.template,
  }),
  {
    memoizeOptions: {
      resultEqualityCheck: checkObjectsEqual,
    },
  },
);

const flowSettingsSchema = (flow) => ({
  type: 'object',
  properties: {
    name: {
      title: 'Name',
      type: 'string',
      default: flow?.name,
    },
    description: {
      title: 'Description',
      type: 'string',
      default: flow?.description,
    },
    is_active: {
      title: 'Workflow',
      description: 'Activate to enable the flow.',
      type: 'boolean',
      'x-disable-header': true,
      default: flow?.is_active,
    },
    // meta_data: {
    //   title: "Settings",
    //   description: "Enable different flow features.",
    //   type: "object",
    //   "default": flow?.meta_data
    // },
    member_id: {
      title: 'Owner',
      description:
        'The owner of the flow will execute the actions by default. Ensure an AIgent is the owner.',
      type: 'string',
      'x-component': 'MembersAutocomplete',
      'x-show-header': true,
      default: flow?.member_id,
      'x-disable-free-text': true,
    },
  },
  required: ['name'],
});

const isFlowArgsFilled = (required, args) =>
  !required || !required.find((r) => ['', undefined, null].includes(args[r]));

const selectFlowInitialized = (state) => state.flows.initialized.flow;
const selectShowExecutionsHistory = (state) => state.flows.isFlowExecutionHistoryActive;
const selectInitializedExecutions = (state) => state.flows.initialized.executions;
const selectisLoadingExecutions = (state) => state.flows.isLoading.executions;

const useFlowArgsState = ({ triggerType, flowSchema, flowArgsMethods }) => {
  const watchedValues = flowArgsMethods.watch();
  const hasFlowSchema = useMemo(
    () => triggerType === 'internal' && !!flowSchema,
    [triggerType, flowSchema],
  );

  const mustShowArgs = useMemo(() => {
    if (!hasFlowSchema || !flowSchema?.required?.length) {
      return false;
    }
    return !isFlowArgsFilled(flowSchema.required, watchedValues);
  }, [flowSchema?.required, hasFlowSchema, watchedValues]);

  return useMemo(
    () => ({
      mustShowArgs,
      hasFlowSchema,
    }),
    [hasFlowSchema, mustShowArgs],
  );
};

const FlowCanvasToolbar = ({
  // altanerComponentId = null,
  // altanerComponentType = null,
  onGoBack = null,
  isCompact = false,
  // top = 0
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { animations } = useSettingsContext();
  // const history = useHistory();;
  const flowSchema = useSelector(selectFlowSchema);
  const flowArgsMethods = useForm({ defaultValues: {} });

  // const location = useLocation();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const buttonRef = useRef(null);
  const runningExecutionsButtonRef = useRef(null);
  const executionHistoryButtonRef = useRef(null);
  const [showRetriggerCard, setShowRetriggerCard] = useState(false);
  // const [insertedBubble, setInsertedBubble] = useState(false);
  const [flowSettingOpen, setFlowSettingOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const entryModule = useSelector(selectEntryModule);
  const flow = useSelector(selectFlowDetails);
  // const currentExecutionFromHistory = useSelector(selectCurrentExecutionFromHistory);
  const flowId = useSelector(selectFlowId);
  const totalModules = useSelector(selectTotalFlowModules);
  const initialized = useSelector(selectFlowInitialized);
  const showExecutionsHistory = useSelector(selectShowExecutionsHistory);
  const runningExecutions = useSelector(selectCurrentRunningExecutions);

  // console.log("selectCurrentRunningExecutions", runningExecutions);
  const totalExecutionEventHistory = useSelector(selectTotalExecutionsEventsHistory);
  const initializedExecutions = useSelector(selectInitializedExecutions);
  const isLoadingExecutions = useSelector(selectisLoadingExecutions);
  // const navigationAttemptedRef = useRef(false);
  const [showRunningExecutions, setShowRunningExecutions] = useState(false);
  const [showExecutionTimeline, setShowExecutionTimeline] = useState(false);
  const [showWorkflowArgs, setShowWorkflowArgs] = useState(false);

  const { mustShowArgs, hasFlowSchema } = useFlowArgsState({
    triggerType: entryModule?.trigger_type,
    flowSchema,
    flowArgsMethods,
  });

  const getExecuteButtonText = useMemo(() => {
    if (entryModule?.trigger_type === 'instant') {
      return showRetriggerCard ? 'Hide Events' : 'Retrigger Event';
    }
    return 'Execute';
  }, [entryModule?.trigger_type, showRetriggerCard]);

  const getVersionsText = useMemo(
    () => (!!flow?.template ? 'Versions' : 'Checkpoint'),
    [flow?.template],
  );

  const getButtonIcon = useMemo(() => {
    if (entryModule?.trigger_type === 'instant') {
      return showRetriggerCard ? 'mdi:close' : 'mdi:bug';
    }
    return 'ph:play-fill';
  }, [entryModule?.trigger_type, showRetriggerCard]);

  const getExecutionsText = useMemo(
    () => (showExecutionTimeline ? 'Hide Executions' : `Executions (${flow?.total_executions})`),
    [flow?.total_executions, showExecutionTimeline],
  );

  const getExecutionsIcon = useMemo(
    () => (showExecutionTimeline ? 'mdi:close' : 'material-symbols:history'),
    [showExecutionTimeline],
  );

  useEffect(() => {
    if (flowId && !initializedExecutions && !isLoadingExecutions) {
      dispatch(getFlowExecutions(flowId)).catch((error) => {
        // If it's a 403, we don't want to show an error message since it's expected for public workflows
        if (error?.response?.status === 403) {
          return;
        }
        enqueueSnackbar('Could not fetch workflow executions. Try again later.', {
          variant: 'error',
        });
      });
    }
  }, [flowId, initializedExecutions, isLoadingExecutions]);

  const show = useMemo(
    () => ({
      history: !!showExecutionsHistory || !!flow?.total_executions,
      template: !flow?.cloned_template_id && totalModules > 1, // TODO: check type of in template plan either subs or license
      execute:
        totalModules > 1 &&
        !!entryModule &&
        (entryModule?.trigger_type !== 'instant' || totalExecutionEventHistory),
    }),
    [
      entryModule?.trigger_type,
      flow?.cloned_template_id,
      flow?.total_executions,
      showExecutionsHistory,
      totalExecutionEventHistory,
      totalModules,
    ],
  );

  const handleActivateFlow = useCallback(() => {
    let flowArgs = null;
    if (hasFlowSchema) {
      const values = flowArgsMethods.getValues();
      flowArgs = Object.entries(values).reduce((acc, [k, v]) => {
        acc[k.replace('$', '[').replace('%', ']')] = v;
        return acc;
      }, {});
      if (!Object.keys(flowArgs).length) {
        flowArgs = null;
      }
    }
    dispatchWithFeedback(activateFlow(flowId, flowArgs), {
      successMessage: 'Flow activated successfully',
      errorMessage: 'There was an error activating the flow',
      useSnackbar: true,
    });
  }, [dispatchWithFeedback, flowArgsMethods, flowId, hasFlowSchema]);

  const handleExecuteClick = useCallback(() => {
    if (entryModule?.trigger_type === 'instant') {
      setShowRetriggerCard((prev) => !prev);
    } else if (mustShowArgs) {
      setShowWorkflowArgs((prev) => !prev);
    } else {
      handleActivateFlow();
    }
  }, [entryModule?.trigger_type, handleActivateFlow, mustShowArgs]);

  const onExecutionButtonPopoverClose = useCallback(() => {
    setShowRetriggerCard(false);
    setShowWorkflowArgs(false);
  }, []);

  const onExecutionHistoryButtonPopoverClose = useCallback(
    () => setShowExecutionTimeline(false),
    [],
  );

  const handleSwitchChange = useCallback(
    (event) => {
      dispatchWithFeedback(patchFlow(flowId, { is_active: event.target.checked }), {
        successMessage: 'Flow status updated successfully!',
        errorMessage: 'Error updating Flow',
        useSnackbar: true,
      });
    },
    [dispatchWithFeedback, flowId],
  );

  const onConfirmEditDialog = useCallback(
    (data) => {
      if (!flowId) {
        // console.error('invalid flow to patch');
        return;
      }
      dispatchWithFeedback(
        patchFlow(flowId, {
          ...data,
          meta_data:
            !!data?.meta_data && !(data.meta_data instanceof Object)
              ? JSON.parse(data.meta_data)
              : data.meta_data || null,
        }),
        {
          successMessage: 'Flow updated successfully',
          errorMessage: 'There was an error updating the flow',
          useSnackbar: true,
        },
      );
    },
    [dispatchWithFeedback, flowId],
  );

  const toggleViewExecutions = useCallback(() => setShowExecutionTimeline((prev) => !prev), []);

  const handleTemplate = useCallback(() => {
    if (!!flow.template) {
      setTemplateDialogOpen(true);
    } else {
      const data = {
        id: flowId,
        entity_type: 'workflow',
      };
      dispatchWithFeedback(createTemplate(data), {
        successMessage: 'Workflow template created successfully',
        errorMessage: 'There was an error creating workflow template',
        useSnackbar: true,
      });
    }
  }, [dispatchWithFeedback, flow.template, flowId]);

  const toggleRunningExecutions = useCallback(() => setShowRunningExecutions((prev) => !prev), []);

  // Memoize the flow settings schema to prevent infinite re-renders
  const memoizedFlowSettingsSchema = useMemo(() => {
    if (!flow) return null;
    return flowSettingsSchema(flow);
  }, [flow?.id, flow?.name, flow?.description, flow?.is_active, flow?.member_id]);

  useEffect(() => {
    if (!runningExecutions?.length) {
      setShowRunningExecutions(false);
    }
  }, [runningExecutions?.length]);

  return (
    <>
      {!!show.template && (
        <TemplateDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          mode="workflow"
          templateSelector={selectFlowTemplate}
        />
      )}
      {!!flow?.id && (
        <FormDialog
          open={flowSettingOpen}
          onClose={() => setFlowSettingOpen(false)}
          schema={memoizedFlowSettingsSchema}
          title="Edit Flow Settings"
          description={`FlowId: ${flow?.id}`}
          onConfirm={onConfirmEditDialog}
        />
      )}
      <Stack
        direction="row"
        className="absolute left-0 top-0 z-[99]"
        padding={2}
        spacing={1}
      >
        {!!onGoBack && (
          <HoverBorderGradient
            containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
            as="button"
            className="transition-all duration-200 w-[50px] h-[36px] group-hover:md:w-[170px] text-sm bg-slate-500 group-hover:bg-slate-700 dark:group-hover:bg-slate-300 text-black dark:text-white flex items-center space-x-1"
            onClick={onGoBack}
            disableAnimation
          >
            <Iconify
              className="text-white dark:text-black"
              icon="eva:arrow-back-outline"
            />
            <Typography
              noWrap
              variant="body"
              className="flex-no-wrap hidden group-hover:md:flex text-white dark:text-black"
            >
              Back to workflows
            </Typography>
          </HoverBorderGradient>
        )}
        {!flow || !initialized ? (
          <Skeleton
            variant="text"
            sx={{ width: 100, height: 20 }}
          />
        ) : (
          <HoverBorderGradient
            containerClassName="max-w-[150px] md:max-w-full rounded-full bg-transparent border-transparent flex-no-wrap"
            as="button"
            className="text-sm bg-slate-300 dark:bg-transparent text-black dark:text-white flex items-center p-2 px-4 w-full"
            onClick={() => setFlowSettingOpen(true)}
            disableAnimation
          >
            <CardTitle className="text-md tracking-normal truncate">{flow?.name}</CardTitle>
          </HoverBorderGradient>
        )}
        <AnimatePresence>
          {flow?.is_active !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                checked={flow.is_active}
                onChange={handleSwitchChange}
                sx={{
                  width: 42,
                  height: 26,
                  padding: 0,
                  '& .MuiSwitch-switchBase': {
                    padding: 0,
                    margin: '2px',
                    color: '#ff4842',
                    transitionDuration: '300ms',
                    transform: 'translateX(0px)',
                    '&.Mui-checked': {
                      color: '#00ab55',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#00ab55',
                        opacity: 0.5,
                        border: 0,
                      },
                    },
                  },
                  '& .MuiSwitch-thumb': {
                    width: 22,
                    height: 22,
                    boxShadow: 'none',
                  },
                  '& .MuiSwitch-track': {
                    borderRadius: 26 / 2,
                    backgroundColor: '#ff4842',
                    opacity: 0.5,
                    transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
              />
            </Box>
          )}
        </AnimatePresence>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        padding={2}
        className="absolute right-0 top-0 z-[99]"
      >
        <AnimatePresence mode="wait">
          {!isCompact ? (
            <>
              {!!show.template && (
                <AnimatedButton key="template-button">
                  <HoverBorderGradient
                    id="marketplace"
                    containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
                    as="button"
                    className="transition-all duration-200 w-[50px] group-hover:w-[130px] text-sm bg-slate-700 dark:bg-slate-300 text-black dark:text-white flex items-center space-x-2"
                    onClick={handleTemplate}
                    disableAnimation
                  >
                    <Iconify
                      className="text-white dark:text-black"
                      icon="lucide:git-branch-plus"
                    />
                    <span className="hidden group-hover:flex text-white dark:text-black">
                      {getVersionsText}
                    </span>
                  </HoverBorderGradient>
                  {/* <LoadingButton
                    loading={isSubmitting}
                    id="marketplace"
                    variant="soft"
                    onClick={handleTemplate}
                    startIcon={<Iconify icon="lucide:git-branch-plus" />}
                    color="info"
                  >
                    {getVersionsText}
                  </LoadingButton> */}
                </AnimatedButton>
              )}
              {!!show.history && (
                <AnimatedButton key="history-button">
                  <div
                    className="relative"
                    ref={executionHistoryButtonRef}
                  >
                    <HoverBorderGradient
                      id="history"
                      containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
                      as="button"
                      className="transition-all duration-200 w-[50px] h-[36px] group-hover:w-[165px] text-sm bg-slate-700 dark:bg-slate-300 text-black dark:text-white flex items-center space-x-2 "
                      onClick={toggleViewExecutions}
                      disableAnimation
                    >
                      <Iconify
                        className="text-white dark:text-black"
                        icon={getExecutionsIcon}
                      />
                      <Typography
                        noWrap
                        variant="body"
                        className="flex-no-wrap duration-200 hidden group-hover:flex text-white dark:text-black"
                      >
                        {getExecutionsText}
                      </Typography>
                    </HoverBorderGradient>
                    {/* <LoadingButton
                      id="history"
                      ref={executionHistoryButtonRef}
                      onClick={toggleViewExecutions}
                      variant="soft"
                      color={showExecutionTimeline ? 'error' : 'secondary'}
                      startIcon={<Iconify icon={getExecutionsIcon} />}
                    >
                      {getExecutionsText}
                    </LoadingButton> */}
                  </div>
                </AnimatedButton>
              )}
              {!!show.execute && hasFlowSchema && !mustShowArgs && (
                <IconButton
                  size="small"
                  onClick={() => setShowWorkflowArgs(true)}
                >
                  <Iconify icon="material-symbols:change-circle-outline-rounded" />
                </IconButton>
              )}
              {!!show.execute && (
                <AnimatedButton key="execute-button">
                  <Box
                    className="relative"
                    ref={buttonRef}
                  >
                    {/* <LoadingButton
                      ref={buttonRef}
                      id="execute"
                      variant="soft"
                      loading={isSubmitting}
                      onClick={handleExecuteClick}
                      color={runningExecutions?.length ? 'error' : 'primary'}
                      startIcon={<Iconify icon={getButtonIcon} />}
                      disabled={!initialized}
                    >
                      {getExecuteButtonText}
                    </LoadingButton> */}
                    <InteractiveButton
                      id="execute"
                      icon={getButtonIcon}
                      title={getExecuteButtonText}
                      loading={isSubmitting}
                      onClick={handleExecuteClick}
                      iconClassName="text-black dark:text-white"
                      titleClassName="text-sm font-bold"
                      containerClassName={cn(
                        'bg-white dark:bg-black border-transparent transition-shadow',
                        hasFlowSchema &&
                          (mustShowArgs
                            ? 'shadow-[0_0_10px_rgba(255,0,0,0.8)]' // Red glow
                            : 'shadow-[0_0_10px_rgba(0,255,0,0.8)]'), // Green glow
                      )}
                      // duration={8000}
                      // containerClassName="h-[40]"
                      // borderClassName="h-[80px] w-[250px]"
                      // enableBorder={true}
                      className="px-2 py-[1.5]"
                      enableBorder={animations.flows}
                    />
                    {!!runningExecutions?.length && (
                      <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="absolute bottom-[-25] left-[-10] right-0 h-[20px]"
                        ref={runningExecutionsButtonRef}
                      >
                        <Button
                          size="small"
                          variant="soft"
                          color="warning"
                          onClick={toggleRunningExecutions}
                          endIcon={!show.runningExecutions ? null : <Iconify icon="mdi:close" />}
                        >
                          ({runningExecutions.length}) running
                        </Button>
                      </m.div>
                    )}
                  </Box>
                </AnimatedButton>
              )}
            </>
          ) : (
            <>
              {!!show.template && (
                <AnimatedIconButton key="template-icon">
                  <Tooltip
                    arrow
                    followCursor
                    title={getVersionsText}
                  >
                    <IconButton
                      size="small"
                      onClick={handleTemplate}
                    >
                      <Iconify icon="lucide:git-branch-plus" />
                    </IconButton>
                  </Tooltip>
                </AnimatedIconButton>
              )}
              {!!show.history && (
                <AnimatedIconButton key="history-icon">
                  <Tooltip
                    arrow
                    followCursor
                    title={getExecutionsText}
                  >
                    <IconButton
                      size="small"
                      onClick={toggleViewExecutions}
                    >
                      <Iconify icon={getExecutionsIcon} />
                    </IconButton>
                  </Tooltip>
                </AnimatedIconButton>
              )}
              {!!show.execute && (
                <AnimatedIconButton key="execute-icon">
                  <Tooltip
                    arrow
                    followCursor
                    title={getExecuteButtonText}
                  >
                    <IconButton
                      size="small"
                      onClick={handleActivateFlow}
                    >
                      <Iconify icon="ph:play-fill" />
                    </IconButton>
                  </Tooltip>
                </AnimatedIconButton>
              )}
            </>
          )}
        </AnimatePresence>
      </Stack>
      <ExecutionButtonPopover
        flowSchema={flowSchema}
        showRetriggerCard={showRetriggerCard}
        showWorkflowArgs={showWorkflowArgs}
        anchorEl={buttonRef.current}
        onClose={onExecutionButtonPopoverClose}
        flowArgsMethods={flowArgsMethods}
      />
      <ExecutionHistoryButtonPopover
        open={showExecutionTimeline}
        anchorEl={executionHistoryButtonRef.current}
        onClose={onExecutionHistoryButtonPopoverClose}
      />
      <RunningExecutionsPopover
        open={showRunningExecutions}
        anchorEl={runningExecutionsButtonRef.current}
        runningExecutions={runningExecutions}
      />
    </>
  );
};

export default memo(FlowCanvasToolbar);
