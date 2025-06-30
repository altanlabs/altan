import { Stack, Typography } from '@mui/material';
import { memo, useCallback } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { RHFSlidingPlaceholderTextField } from '@components/hook-form';

import InteractiveButton from '../../../components/buttons/InteractiveButton';
import CreateWithAI from '../../../components/CreateWithAI.jsx';
import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateAltanerComponentById } from '../../../redux/slices/altaners';
import { createFlow } from '../../../redux/slices/general';

const workflowNames = [
  // Galactic-themed names
  'Celestial Flow',
  'Stellar Circuit',
  'Nebula Nexus',
  'Orbit Optimizer',
  'Astro Align',
  'Cosmic Pathway',
  'Galactic Conductor',
  'Nova Protocol',
  'Lunar Sequence',
  'Starforge Engine',
  'Eclipse Framework',
  'Quasar Hub',
  'Solar Synergy',
  'Gravity Grid',
  'Pulsar Process',
  'Aurora Node',
  'Void Navigator',
  'Chronos Workflow',
  'Black Hole Efficiency',
  'Hyperdrive Integrator',

  // The Matrix-inspired names
  "The Architect's Blueprint",
  'Flow Reloaded',
  'Code Zion',
  'Red Pill Protocol',
  'Agent Smith System',
  'Matrix Mapper',
  'Nebuchadnezzar Navigator',
  'The Oracle’s Path',
  'Morpheus Method',
  'Trinity Circuit',
  'Bullet Time Workflow',
  'The Keymaker’s Gateway',
  'Operation Zion Shield',
  'Deja Vu Trigger',
  'Sentinel Surveillance',
  'Source Conductor',
  'The One Sequence',
  'Glitch Resolver',
  'Construct Framework',
  'The Anomaly Process',

  // Deeper-meaning Matrix-inspired names
  'The Architect’s Design',
  'The Path of the One',
  'The Oracle’s Vision',
  'The Construct',
  'System Reboot',
  'The Source Protocol',
  'The Desert of the Real',
  'Causality Circuit',
  'The Merovingian Chain',
  'The Keymaker’s Vault',
  'Simulacrum Sequence',
  'The System Anomaly',
  'Zion Protocol',
  'Code Deconstructor',
  'The Matrix Unveiled',
  'Residual Self Image',
  'The Sentinel’s Watch',
  'Deus Ex Machina',
  'The Choice Algorithm',
  'The Infinite Loop',
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const CreateWithAIField = ({ name, ...other }) => {
  const { setValue, watch } = useFormContext();
  const value = watch(name);

  return (
    <CreateWithAI
      value={value}
      onChange={(newValue) => setValue(name, newValue)}
      label="Describe what you want your workflow to do"
      {...other}
    />
  );
};

function CreateFlowDialog({ open, handleClose, redirect = true, altanerComponentId }) {
  const history = useHistory();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      is_active: null,
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = useCallback(
    async (data) => {
      if (isSubmitting) return;

      const completeData = {
        name: !data.name || !data.name.length ? getRandomElement(workflowNames) : data.name,
        description: data.description,
        is_active: data.is_active,
      };
      const prompt = data?.prompt || null;

      dispatchWithFeedback(createFlow(completeData, prompt), {
        successMessage: 'Workflow created successfully',
        errorMessage: 'There was an error creating the flow: ',
        useSnackbar: true,
        useConsole: {
          error: true,
        },
      }).then((flow) => {
        if (!altanerComponentId) {
          handleClose(flow.id);
        } else if (altanerComponentId) {
          dispatchWithFeedback(
            updateAltanerComponentById(altanerComponentId, {
              ids: [flow.id],
              method: 'insert',
            }),
            {
              successMessage: 'Flow created and component updated successfully',
              errorMessage: 'There was an error updating the component: ',
              useSnackbar: true,
              useConsole: {
                error: true,
              },
            },
          ).then(() => handleClose(flow.id));
        }
      });
    },
    [altanerComponentId, dispatchWithFeedback, handleClose, isSubmitting],
  );

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={handleClose}
    >
      <FormProvider {...methods}>
        <Stack
          spacing={2}
          padding={2}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Create workflow
          </Typography>
          <RHFSlidingPlaceholderTextField
            name="name"
            placeholders={workflowNames}
            size="small"
            enableDoubleClick
          />
          {/* <Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ ml: 1, pb: 0.25 }}
            >
              <Chip
                variant="soft"
                color="secondary"
                label="Beta"
                size="small"
              />
              <Typography>Generate with AI ✨</Typography>
            </Stack>
            <CreateWithAIField name="prompt" />
          </Stack> */}

          {/* <RHFSwitch name="is_active" label="Whether the flow is active" /> */}

          <Stack
            direction="row"
            justifyContent="flex-end"
          >
            <InteractiveButton
              icon="mdi:check"
              title="Create"
              onClick={handleSubmit(onSubmit)}
              duration={8000}
              containerClassName="h-[40] border-transparent"
              borderClassName="h-[80px] w-[250px]"
              enableBorder={true}
              className="p-2"
            />
          </Stack>
        </Stack>
        {/* <ButtonGroup fullWidth>
          <Button onClick={handleClose} variant="soft" color="error">Cancel</Button>

        </ButtonGroup> */}
      </FormProvider>
    </CustomDialog>
  );
}

export default memo(CreateFlowDialog);
