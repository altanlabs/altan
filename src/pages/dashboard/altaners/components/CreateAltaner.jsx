import { LoadingButton } from '@mui/lab';
import {
  Typography,
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
  Dialog,
} from '@mui/material';
import { debounce } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { CardTitle } from '../../../../components/aceternity/cards/card-hover-effect.tsx';
import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../../components/iconify/Iconify.jsx';
import FormParameter from '../../../../components/tools/form/FormParameter.jsx';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import { createAltaner } from '../../../../redux/slices/altaners';
import { closeCreateAltaner } from '../../../../redux/slices/general/index.ts';
import { dispatch } from '../../../../redux/store.ts';
import formatData from '../../../../utils/formatData';

const AltanerSchema = {
  title: 'Altaner',
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: 'The name of the Altaner',
    },
    description: {
      type: 'string',
      description: 'The description of the Altaner',
    },
    icon_url: {
      type: 'string',
      description: 'The icon of the Altaner',
      'x-component': 'IconAutocomplete',
    },
  },
};

const useDisabled = ({ required }) => {
  const [disabled, setDisabled] = useState(true);
  const {
    formState: { isDirty },
    watch,
  } = useFormContext();

  const values = watch();
  const disabledHandler = useCallback(
    debounce(
      (isDirty, values) =>
        setDisabled(!isDirty || !required.every((k) => !['', null, undefined].includes(values[k]))),
      500,
    ),
    [],
  );

  useEffect(() => {
    disabledHandler(isDirty, values);
  }, [values, isDirty]);

  return disabled;
};

const CreateAltanerButton = memo(() => {
  const history = useHistory();
  // const { enqueueSnackbar } = useSnackbar();
  const { handleSubmit } = useFormContext();
  const disabled = useDisabled({ required: AltanerSchema.required });
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      if (Object.keys(data).length === 0) {
        return;
      }
      dispatchWithFeedback(createAltaner(formatData(data, AltanerSchema.properties)), {
        useSnackbar: true,
        successMessage: 'Altaner created successfully',
        errorMessage: 'Could not create altaner',
      }).then((newAltaner) => {
        history.replace(`/altaners/${newAltaner.id}`);
        dispatch(closeCreateAltaner());
      });
    }),
    [dispatchWithFeedback, history],
  );

  return (
    <LoadingButton
      color="primary"
      variant="soft"
      loading={isSubmitting}
      onClick={onSubmit}
      disabled={disabled}
    >
      Create Altaner
    </LoadingButton>
  );
});

const onClose = () => dispatch(closeCreateAltaner());
const selectIsOpen = (state) => state.general.createAltaner;

const CardOption = ({ image, title, description, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      boxShadow: 3,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      width: '100%',
      maxWidth: 300,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box
      component="img"
      src={image}
      alt={title}
      sx={{ width: '100%', height: 200, objectFit: 'contain' }}
    />
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        fontWeight="bold"
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
      >
        {description}
      </Typography>
    </Box>
  </Box>
);

const CreateAltaner = () => {
  const theme = useTheme();
  const methods = useForm({ defaultValues: {} });
  const isOpen = useSelector(selectIsOpen);
  const [step, setStep] = useState('menu');
  const [showCreatorForm, setShowCreatorForm] = useState(false);

  const handleCreateFromScratch = () => setStep('form');
  const handleExploreMarketplace = () => window.open('/marketplace?mode=altaner', '_blank');
  const handleFindCreator = () => setShowCreatorForm(true);

  const CreatorFormDialog = () => (
    <Dialog
      open={showCreatorForm}
      onClose={() => setShowCreatorForm(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">Find a Creator</Typography>
          <IconButton onClick={() => setShowCreatorForm(false)}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ height: '80vh', p: 0 }}>
        <iframe
          src="https://app.altan.ai/form/8f528c5f-219c-4388-8851-906317b41904"
          title="Creator Form"
          width="100%"
          height="100%"
          allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
          className="relative w-full h-full border-none"
        />
      </DialogContent>
    </Dialog>
  );

  const renderForm = useMemo(
    () => (
      <Stack
        spacing={2}
        sx={{ px: 2, width: '100%' }}
      >
        {Object.entries(AltanerSchema.properties).map(([key, fieldSchema]) => {
          const required = AltanerSchema.required.includes(key);
          return (
            <FormParameter
              key={key}
              fieldKey={key}
              name={key}
              schema={fieldSchema}
              required={required}
            />
          );
        })}
      </Stack>
    ),
    [],
  );

  return (
    <>
      <CustomDialog
        dialogOpen={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <CardTitle className="w-full text-center text-2xl">
            {step === 'menu' ? 'How do you want to start?' : 'SELECT ALTANER DETAILS'}
          </CardTitle>
        </DialogTitle>
        <FormProvider {...methods}>
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', gap: 2, px: 4 }}>
            {step === 'menu' ? (
              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
              >
                <CardOption
                  image="https://cdn.dribbble.com/userupload/12372368/file/original-3196d7187230779e6a305af4fd3df5f9.jpg?resize=1504x1128"
                  title="Start from scratch"
                  description="Build your ideal workflow starting with a blank table."
                  onClick={handleCreateFromScratch}
                />
                <CardOption
                  image="/assets/images/creators/marketplace.png"
                  title="Explore marketplace"
                  description="Explore existing templates to get started."
                  onClick={handleExploreMarketplace}
                />
                <CardOption
                  image={
                    theme.palette.mode === 'light'
                      ? '/assets/images/creators/creatorsDark.png'
                      : '/assets/images/creators/creatorsLight.png'
                  }
                  title="Find Creator"
                  description="Hire a creator to build a custom Altaner for you."
                  onClick={handleFindCreator}
                />
              </Stack>
            ) : (
              renderForm
            )}
          </Box>
          <DialogActions>
            {step === 'form' ? (
              <>
                <Button onClick={() => setStep('menu')}>Back</Button>
                <CreateAltanerButton />
              </>
            ) : (
              <Button onClick={onClose}>Cancel</Button>
            )}
          </DialogActions>
        </FormProvider>
      </CustomDialog>
      <CreatorFormDialog />
    </>
  );
};

export default memo(CreateAltaner);
