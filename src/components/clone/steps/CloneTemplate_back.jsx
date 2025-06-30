import { LoadingButton } from '@mui/lab';
import { useTheme, Box, Chip, Skeleton, Stack, StepContent, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

// import { bgBlur } from '../utils/cssStyles';
import { capitalize } from 'lodash';
import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import AssetsCard from './assets/AssetsCard';
import CoolCard from './assets/CoolCard';
import ConnectionsAutocomplete from './connections/ConnectionsAutocomplete';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { selectConnections } from '../../redux/slices/connections';
import { cloneTemplate, selectAccount } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { optimai, optimai_integration } from '../../utils/axios';
import { bgBlur } from '../../utils/cssStyles';
import CustomDialog from '../dialogs/CustomDialog.jsx';
import Iconify from '../iconify';
import IconRenderer from '../icons/IconRenderer';
import AltanLogo from '../loaders/AltanLogo';
import ConnectionCreator from '../tools/ConnectionCreator';
import FormParameter from '../tools/form/FormParameter';

export const fetchTemplateVersion = async (accountId, templateVersionId) => {
  try {
    const response = await optimai.get(
      `https://api.altan.ai/platform/account/${accountId}/template-versions/${templateVersionId}`,
    );
    const { cloned_template } = response.data;
    return cloned_template;
  } catch (error) {
    throw new Error(error.message);
  }
};

const STEPPER_STYLE_1 = {
  position: 'sticky',
  top: 0,
  zIndex: 99,
  paddingTop: 3,
  '& .MuiStepLabel-label': {
    fontFamily: '"Inter Tight", sans-serif',
    color: '#FFFFFF', // Light text color
  },
  '& .Mui-active .MuiStepLabel-label': {
    fontWeight: 'bold',
    // textShadow: '0 0 10px rgba(0, 255, 255, 0.5)', // Neon glow for active step
  },
  '& .MuiStepIcon-root': {
    color: '#2E2E2E',
  },
  '& .Mui-active .MuiStepIcon-root': {
    color: '#00C8FF', // Neon cyan for active step
  },
  '& .Mui-completed .MuiStepIcon-root': {
    color: '#00FFFF', // Neon cyan for completed step
  },
};

// function ConnectionCard({ connection }) {
//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h6">{connection.connection_type_id}</Typography>
//         {/* Display connection details if available */}
//       </CardContent>
//       <CardActions>
//         <Button size="small">Configure</Button>
//       </CardActions>
//     </Card>
//   );
// }

const CLONE_FLOW_STEPS = [
  {
    title: 'Select or Create Connections',
    icon: 'icon-park-twotone:connect',
  },
  {
    title: 'Import Assets',
    icon: 'icon-park-twotone:components',
    condition: (version) =>
      Object.values(version?.public_details?.assets ?? {}).some(
        (v) => !!v && !!Object.keys(v).length,
      ),
  },
  {
    title: 'Set Variables and Final Details',
    icon: 'mdi:form-outline',
    condition: (version) => !!Object.keys(version?.vars ?? {}).length,
  },
];

const getSteps = (details) => CLONE_FLOW_STEPS.filter((s) => !s.condition || s.condition(details));

const FinishNextButton = memo(
  ({ activeStep, allConnectionsSetUp, onClick, numSteps, disabled = false, loading = false }) => {
    const { watch } = useFormContext();
    const values = watch();
    const submitDisabled = useMemo(() => {
      if (disabled) {
        return true;
      }
      if (activeStep === 0) {
        return !allConnectionsSetUp;
      }
      if (activeStep === 2) {
        return !Object.values(values).every((v) => !['', null, undefined].includes(v));
      }
      return false;
    }, [activeStep, allConnectionsSetUp, disabled, values]);

    return (
      <LoadingButton
        fullWidth
        onClick={onClick}
        variant="contained"
        loading={loading}
        disabled={submitDisabled}
        sx={{
          backgroundColor: '#00C8FF', // Neon cyan for next button
          '&:hover': {
            backgroundColor: '#00FFFF',
          },
        }}
      >
        {activeStep < numSteps - 1 ? 'Next' : 'Finish'}
      </LoadingButton>
    );
  },
);

// const selectTypesInitialized = (state) => state.connections.initialized.types;

const MAP_REDIRECT = {
  workflow: 'flows',
  altaner: 'altaners',
  agent: 'agents',
  form: 'forms',
};

function CloneTemplate({ templateId, onClose }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [verticalStep, setVerticalStep] = useState(0);
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
  const [connectionsSetup, setConnectionsSetup] = useState({});
  const [mode, setMode] = useState(null);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  // const [assetsSetup, setAssetsSetup] = useState([]);
  const [clonedTemplate, setClonedTemplate] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [types, setTypes] = useState([]);
  const [typesInitialized, setTypesInitialized] = useState(false);

  const connections = useSelector(selectConnections);
  const account = useSelector(selectAccount);

  // TODO: hazlo dinamico, que herede de un json este componente, nested stepper lo veo fresco, y poder customizarlo desde el json
  /**
   *   const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
        const [connectionsSetup, setConnectionsSetup] = useState([]);

        lo de arriba igual podria ser:

        const [manageState, setManageState] = useState({});

        y dentro del state este esté todo lo necesaio para manejar las connections, assets, etc y que herede del diccionario
   */

  const totalSetUpConnections = useMemo(
    () => Object.values(connectionsSetup).filter((c) => !!c).length,
    [connectionsSetup],
  );
  const steps = useMemo(() => getSteps(clonedTemplate?.version), [clonedTemplate?.version]);

  useEffect(() => {
    if (!!totalSetUpConnections && activeStep === 0) {
      setVerticalStep((prev) => prev + 1);
    }
  }, [totalSetUpConnections]);

  useEffect(() => {
    if (templateId && !isFetched && account?.id) {
      fetchTemplateVersion(account.id, templateId)
        .then(async (ct) => {
          // console.log("CLONED TEMPLATE", ct);
          setClonedTemplate(ct);
          const connsMap = ct.version.public_details?.assets?.connections;
          if (!!connsMap) {
            setConnectionsSetup(
              Object.keys(connsMap).reduce((acc, c) => {
                acc[c] = null;
                return acc;
              }, {}),
            );
            const response = await optimai_integration.get('/connection-type/all', {
              params: {
                filter_ids: Object.keys(connsMap).map((c) => c.replace('_', '-')),
              },
            });
            const { items } = response.data;
            setTypes(items);
            setTypesInitialized(true);
          }
          setMode(ct.version.entity_type);
          setIsFetched(true);
        })
        .catch((error) => {
          console.error('Failed to fetch product', error);
          setIsFetched(true);
        });
    }
  }, [templateId, account.id]);

  const handleConnectionChange = useCallback((index, event, newValue) => {
    if (newValue === 'add-conn') {
      setIsCreatingNewConnection(true);
    } else {
      setConnectionsSetup((prev) => ({
        ...prev,
        [Object.keys(prev)[index]]: newValue,
      }));
      setIsCreatingNewConnection(false);
    }
  }, []);

  const vars = useMemo(() => clonedTemplate?.version?.vars || {}, [clonedTemplate?.version?.vars]);
  const assets = useMemo(
    () => clonedTemplate?.version?.public_details?.assets || {},
    [clonedTemplate?.version?.public_details?.assets],
  );

  const defaultValues = useMemo(
    () =>
      Object.entries(vars).map(([key, fieldSchema]) => ({
        [key]: fieldSchema.default,
      })),
    [vars],
  );

  const methods = useForm({ defaultValues });

  const handleNext = useCallback(() => {
    if (activeStep === 0) {
      if (verticalStep < Object.keys(assets?.connections ?? {}).length - 1) {
        setVerticalStep((prev) => prev + 1);
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } else if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      if (clonedTemplate?.id) {
        const version = clonedTemplate.version.version;
        const name = clonedTemplate.version.name;
        const vName = name.includes(version) ? name : `${name}:${version}`;
        dispatchWithFeedback(
          cloneTemplate(
            clonedTemplate.id,
            {
              connections: connectionsSetup,
              vars: methods.getValues(),
            },
            ['altaner', 'workflow'].includes(mode) ? 3 : 0,
          ),
          {
            successMessage: `${vName} ${['altaner', 'workflow'].includes(mode) ? 'cloning process started' : 'was cloned'} successfully`,
            errorMessage: `${vName} ${['altaner', 'workflow'].includes(mode) ? 'cloning process could not be started' : 'could not be cloned'}`,
            useSnackbar: true,
          },
        )
          .then((clone) => {
            onClose();
            navigate(`/${MAP_REDIRECT[mode]}/${clone}?fromtemplate=${true}`);
          })
          .catch((err) => console.error(err));
      }
    }
  }, [
    activeStep,
    steps.length,
    verticalStep,
    assets?.connections,
    clonedTemplate?.id,
    clonedTemplate?.version?.version,
    clonedTemplate?.version?.name,
    dispatchWithFeedback,
    connectionsSetup,
    methods,
    onClose,
    navigate,
    mode,
  ]);

  const handleBack = useCallback(() => {
    if (activeStep === 0 && verticalStep > 0) {
      setVerticalStep((prev) => prev - 1);
    } else if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep, verticalStep]);

  const renderVars = useMemo(
    () =>
      Object.entries(vars).map(([key, fieldSchema]) => {
        const required = true;
        return (
          <FormParameter
            key={key}
            fieldKey={key}
            schema={{ title: fieldSchema.name, 'x-hide-label': true, ...fieldSchema }}
            required={required}
            enableLexical={false}
            defaultEnabled={true}
          />
        );
      }),
    [vars],
  );

  const activeConnectionType = useMemo(() => {
    if (activeStep !== 0 || [null, undefined].includes(verticalStep)) {
      return null;
    }
    const connectionTypeId =
      assets?.connections?.[Object.keys(assets?.connections ?? {})[verticalStep]]
        ?.connection_type_id;
    return !connectionTypeId ? null : types.find((c) => c.id === connectionTypeId);
  }, [activeStep, assets?.connections, types, verticalStep]);

  const allConnectionsSetUp = useMemo(
    () => totalSetUpConnections === Object.keys(connectionsSetup).length,
    [connectionsSetup, totalSetUpConnections],
  );

  const stepContent = useMemo(() => {
    switch (activeStep) {
      case 0:
        const existingConnections =
          !!activeConnectionType &&
          (connections[account?.id] || []).filter(
            (conn) =>
              conn.connection_type?.id === activeConnectionType.id ||
              conn.connection_type_id === activeConnectionType.id,
          );
        if (!activeConnectionType && !allConnectionsSetUp) {
          return (
            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>
              Could not find connection type
            </Typography>
          );
        }
        if (!activeConnectionType) {
          return null;
        }
        return (
          <Stack spacing={1}>
            <CoolCard
              // icon={connectionType.icon}
              name={activeConnectionType.name}
              description={activeConnectionType.description}
              flat={true}
              sx={{
                paddingY: 1,
                paddingX: 0,
              }}
            />
            {!isCreatingNewConnection ? (
              <ConnectionsAutocomplete
                connectionType={activeConnectionType}
                verticalStep={verticalStep}
                onConnectionChange={handleConnectionChange}
                connectionsSetup={connectionsSetup}
                existingConnections={existingConnections}
              />
            ) : (
              <ConnectionCreator
                connectionType={activeConnectionType}
                setIsCreatingNewConnection={setIsCreatingNewConnection}
                disableClose
              />
            )}
          </Stack>
        );

      case 1:
        return (
          <div>
            <AssetsCard assets={assets} />
          </div>
        );

      case 2:
        return (
          <Stack
            spacing={1}
            height="100%"
            width="100%"
          >
            {renderVars}
          </Stack>
        );

      default:
        return null;
    }
  }, [
    activeStep,
    activeConnectionType,
    connections,
    account?.id,
    allConnectionsSetUp,
    isCreatingNewConnection,
    verticalStep,
    handleConnectionChange,
    connectionsSetup,
    assets,
    renderVars,
  ]);

  if (!templateId) return null;
  return (
    <CustomDialog
      dialogOpen={!!templateId}
      onClose={onClose}
      // paperSx={{
      //   backgroundColor: 'transparent'
      // }}
      paperSx={{
        '&.MuiDialog-paper .MuiDialogActions-root': {
          paddingY: 1.5,
        },
      }}
    >
      <FormProvider {...methods}>
        <DialogTitle
          sx={{
            // background: 'linear-gradient(90deg, #0f2027, #203a43, #2c5364)',
            // color: '#FFFFFF',
            textAlign: 'center',
            padding: '16px 24px',
            // backdropFilter: 'blur(5px)',
            fontWeight: 'bold',
            fontFamily: '"Inter Tight", sans-serif',
            // textShadow: '0 0 10px rgba(0, 255, 255, 0.3)', // Neon glow effect
            // borderRadius: '8px', // Rounded corners
          }}
        >
          {capitalize(mode)} Installer:{' '}
          {clonedTemplate?.version?.public_details?.name || 'loading...'}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: 0,
            // background: 'rgba(255, 255, 255, 0.6)', // Semi-transparent dark background
            fontFamily: '"Inter Tight", sans-serif',
            borderRadius: '8px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            height: '100%',
            ...bgBlur({ opacity: 0.5 }),
          }}
        >
          {!!isFetched ? (
            !clonedTemplate?.version ? (
              <Stack
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100%"
                // sx={{
                //   background: 'rgba(0, 0, 0, 0.8)', // Dark background with opacity
                // }}
                spacing={1}
              >
                <Typography
                  sx={{
                    color: 'red',
                    fontWight: 'bold',
                  }}
                >
                  Invalid or non-existing {capitalize(mode)} Template.
                </Typography>
                <Button
                  size="large"
                  variant="soft"
                  onClick={onClose}
                  color="warning"
                  // sx={{
                  //   color: '#fff'
                  // }}
                >
                  Close
                </Button>
              </Stack>
            ) : (
              <Stack
                width="100%"
                height="100%"
                spacing={1.5}
                sx={{
                  position: 'relative',
                  paddingX: 4,
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={STEPPER_STYLE_1}
                >
                  {steps.map(({ title, icon }, index) => (
                    <Step
                      key={`step-${title}-${index}`}
                      // Remove the onClick handler here
                      sx={{
                        position: 'sticky',
                        top: 0,
                      }}
                    >
                      <StepLabel
                        icon={
                          <Iconify
                            icon={icon}
                            width={25}
                          />
                        }
                        sx={{
                          borderRadius: 5,
                          padding: 1,
                          gap: 1,
                          marginTop: -1,
                          ...bgBlur({ opacity: 0.5 }),
                          '.MuiStepLabel-alternativeLabel': {
                            marginTop: -0.25,
                            minHeight: 0,
                          },
                        }}
                      >
                        {title}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Stack
                  padding={2}
                  width="100%"
                  height="100%"
                >
                  {activeStep === 0 && (
                    <>
                      <Stepper
                        activeStep={verticalStep}
                        orientation="vertical"
                      >
                        {Object.entries(assets?.connections ?? {})?.map(([assetId, c], index) => {
                          const connectionType = !typesInitialized
                            ? null
                            : types.find((t) => t.id === c.connection_type_id);
                          return (
                            <Step key={`conntype-step-${connectionType?.id}-${index}`}>
                              {!typesInitialized ? (
                                <Skeleton
                                  variant="rounded"
                                  width="100%"
                                  height={50}
                                />
                              ) : (
                                <>
                                  <StepLabel
                                    onClick={() => setVerticalStep(index)}
                                    icon={
                                      <IconRenderer
                                        icon={connectionType?.icon || ''}
                                        size={25}
                                      />
                                    }
                                  >
                                    {!connectionType && !allConnectionsSetUp ? (
                                      <Typography
                                        sx={{
                                          color: 'red',
                                          fontWight: 'bold',
                                        }}
                                      >
                                        [NOT FOUND] {c.connection_type_id}
                                      </Typography>
                                    ) : (
                                      <Chip
                                        label={connectionType?.name}
                                        size="small"
                                        sx={{
                                          ...(verticalStep === index && {
                                            display: 'none',
                                          }),
                                          boxShadow:
                                            theme.palette.mode === 'dark'
                                              ? '0 4px 15px rgba(0, 255, 255, 0.1)' // Neon glow in dark mode
                                              : '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow in light mode
                                        }}
                                      />
                                    )}
                                  </StepLabel>
                                  <StepContent
                                    sx={{
                                      ...(verticalStep === index &&
                                        !!connectionType && {
                                        marginTop: -5,
                                      }),
                                    }}
                                  >
                                    {stepContent}
                                  </StepContent>
                                </>
                              )}
                            </Step>
                          );
                        })}
                      </Stepper>
                    </>
                  )}
                  {activeStep !== 0 && stepContent}
                </Stack>
                {totalSetUpConnections === Object.keys(connectionsSetup).length ? (
                  <Chip
                    label={`${totalSetUpConnections} connections successfully selected. Feel free to change them any time.`}
                    sx={{
                      position: 'sticky',
                      bottom: 5,
                      minHeight: 30,
                      opacity: 1,
                    }}
                    variant="soft"
                    color="success"
                  />
                ) : null}
              </Stack>
            )
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                // background: 'rgba(0, 0, 0, 0.8)', // Dark background with opacity
              }}
            >
              <AltanLogo wrapped />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            // background: 'rgba(0, 0, 0, 0.6)', // Consistent with the content background
            padding: 0,
            // borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            justifyContent: 'space-between', // Spread out buttons
          }}
          disableSpacing
        >
          <Button
            onClick={onClose}
            color="error"
            // sx={{ color: '#FFFFFF' }}
          >
            Close
          </Button>
          {(activeStep > 0 || verticalStep > 0) && <Button onClick={handleBack}>Back</Button>}
          <FinishNextButton
            onClick={handleNext}
            activeStep={activeStep}
            allConnectionsSetUp={allConnectionsSetUp}
            numSteps={steps?.length}
            disabled={!clonedTemplate}
            loading={isSubmitting}
          />
        </DialogActions>
      </FormProvider>
    </CustomDialog>
  );
}

export default memo(CloneTemplate);
