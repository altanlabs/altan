import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';

import { cn } from '@lib/utils';

import ConnectionsSetupStep from './steps/ConnectionsSetupStep.jsx';
import VarsStep from './steps/VarsStep.jsx';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { selectConnections } from '../../redux/slices/connections';
import { cloneTemplate, selectAccount } from '../../redux/slices/general/index.ts';
import { useSelector } from '../../redux/store.ts';
import { optimai_shop, optimai_integration } from '../../utils/axios';
import Iconify from '../iconify';

// Simple capitalize function to replace lodash
const capitalize = (str) => str && str.charAt(0).toUpperCase() + str.slice(1);

export const fetchClonedTemplate = async (clonedTemplateId) => {
  try {
    const response = await optimai_shop.get(`/v2/clones/${clonedTemplateId}`);
    const { cloned_template } = response.data;
    return cloned_template;
  } catch (error) {
    throw new Error(error.message);
  }
};

const Button = memo(
  ({
    children,
    onClick,
    disabled = false,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
  }) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

const StepIndicator = memo(({ step, isActive, isCompleted }) => {
  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
        isCompleted
          ? 'bg-blue-600 text-white'
          : isActive
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
      )}
    >
      {isCompleted ? (
        <Iconify
          icon="mdi:check"
          width={16}
        />
      ) : (
        step + 1
      )}
    </div>
  );
});

StepIndicator.displayName = 'StepIndicator';

const MAP_REDIRECT = {
  workflow: 'workflow',
  altaner: 'project',
  agent: 'agent',
  form: 'form',
};

function CloneTemplate({ clonedTemplateId }) {
  const history = useHistory();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
  const [connectionsSetup, setConnectionsSetup] = useState({});
  const [mode, setMode] = useState(null);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [clonedTemplate, setClonedTemplate] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [installationProgress, setInstallationProgress] = useState('');
  const [types, setTypes] = useState([]);
  const [typesInitialized, setTypesInitialized] = useState(false);
  const [skipSetup, setSkipSetup] = useState(false);

  const connections = useSelector(selectConnections);
  const account = useSelector(selectAccount);

  const vars = useMemo(() => clonedTemplate?.version?.vars || {}, [clonedTemplate?.version?.vars]);

  const defaultValues = useMemo(
    () =>
      Object.entries(vars).reduce((acc, [key, fieldSchema]) => {
        acc[key] = fieldSchema.default;
        return acc;
      }, {}),
    [vars],
  );

  const methods = useForm({ defaultValues });

  const steps = useMemo(
    () => [
      {
        label: 'Connections',
        description: 'Set up the required connections for your template.',
        content: (
          <ConnectionsSetupStep
            clonedTemplate={clonedTemplate}
            assets={clonedTemplate?.version?.public_details?.assets || {}}
            vars={vars}
            isCreatingNewConnection={isCreatingNewConnection}
            setIsCreatingNewConnection={setIsCreatingNewConnection}
            connectionsSetup={connectionsSetup}
            setConnectionsSetup={setConnectionsSetup}
            types={types}
            typesInitialized={typesInitialized}
            connections={connections}
            account={account}
          />
        ),
        // Add this condition to only show when connections are required
        condition: (version) => {
          const connsMap = version?.public_details?.assets?.connections;
          return connsMap && Object.keys(connsMap).length > 0;
        },
        required: true,
      },
      {
        label: 'Variables',
        description: 'Configure template variables.',
        content: (
          <VarsStep
            clonedTemplate={clonedTemplate}
            assets={clonedTemplate?.version?.public_details?.assets || {}}
            vars={vars}
          />
        ),
        condition: (version) => !!Object.keys(version?.vars ?? {}).length,
        required: false,
      },
    ],
    [
      account,
      connections,
      connectionsSetup,
      isCreatingNewConnection,
      types,
      typesInitialized,
      clonedTemplate,
      vars,
    ],
  );

  const filteredSteps = useMemo(
    () => steps.filter((s) => !s.condition || s.condition(clonedTemplate?.version)),
    [steps, clonedTemplate?.version],
  );

  useEffect(() => {
    if (clonedTemplateId && !isFetched && account?.id) {
      fetchClonedTemplate(clonedTemplateId)
        .then(async (ct) => {
          setClonedTemplate(ct);
          setMode(ct.version.entity_type);
          setIsFetched(true);
          const connsMap = ct.version.public_details?.assets?.connections;
          if (connsMap) {
            // Initialize with empty connections before we try to match them
            setConnectionsSetup(
              Object.keys(connsMap).reduce((acc, c) => {
                acc[c] = null;
                return acc;
              }, {}),
            );

            const response = await optimai_integration.get('/connection-type/all', {
              params: {
                is_compact: true,
                filter_ids: Object.keys(connsMap).map((c) => c.replace('_', '-')),
              },
            });
            const { items } = response.data;
            setTypes(items);
            setTypesInitialized(true);

            // Auto-match existing connections
            if (connections && connections.length > 0) {
              const autoMatchedConnections = {};

              Object.keys(connsMap).forEach((connKey) => {
                const connType = connKey.replace('_', '-');
                // Find a matching connection by type
                const matchingConnection = connections.find(
                  (conn) => conn.connection_type === connType && conn.is_active,
                );

                if (matchingConnection) {
                  autoMatchedConnections[connKey] = matchingConnection.id;
                } else {
                  autoMatchedConnections[connKey] = null;
                }
              });

              // Apply the auto-matched connections
              setConnectionsSetup(autoMatchedConnections);
            }
          }
        })
        .catch((error) => {
          console.error('Failed to fetch product', error);
          setIsFetched(true);
        });
    }
  }, [clonedTemplateId, account?.id, isFetched, connections]);

  const handleInstall = useCallback(
    (useDefaults = false) => {
      if (clonedTemplate?.id) {
        const version = clonedTemplate.version.version;
        const name = clonedTemplate.version.name;
        const vName = name.includes(version) ? name : `${name}:${version}`;
        setIsLoading(true);
        
        // Progress messages for better UX
        const progressMessages = [
          'Initializing installation...',
          'Setting up connections...',
          'Configuring variables...',
          'Creating resources...',
          'Almost there...',
        ];
        
        let progressIndex = 0;
        setInstallationProgress(progressMessages[0]);
        
        const progressInterval = setInterval(() => {
          progressIndex++;
          if (progressIndex < progressMessages.length) {
            setInstallationProgress(progressMessages[progressIndex]);
          }
        }, 1500);

        const installData = {
          connections: useDefaults ? {} : connectionsSetup,
          vars: useDefaults ? defaultValues : methods.getValues(),
        };

        dispatchWithFeedback(
          cloneTemplate(
            clonedTemplate.id,
            installData,
            ['altaner', 'workflow'].includes(mode) ? 3 : 0,
          ),
          {
            successMessage: `${vName} ${['altaner', 'workflow'].includes(mode) ? 'cloning process started' : 'was cloned'} successfully`,
            errorMessage: `${vName} ${['altaner', 'workflow'].includes(mode) ? 'cloning process could not be started' : 'could not be cloned'}`,
            useSnackbar: true,
          },
        )
          .then((clone) => {
            clearInterval(progressInterval);
            setInstallationProgress('Installation complete!');
            setTimeout(() => {
              history.push(`/${MAP_REDIRECT[mode]}/${clone}?fromtemplate=true`);
            }, 800);
          })
          .catch((err) => {
            clearInterval(progressInterval);
            console.error(err);
            setIsLoading(false);
            setInstallationProgress('');
          });
      }
    },
    [
      clonedTemplate,
      dispatchWithFeedback,
      connectionsSetup,
      methods,
      defaultValues,
      history.push,
      mode,
    ],
  );

  const totalSetUpConnections = useMemo(
    () => Object.values(connectionsSetup).filter((c) => !!c).length,
    [connectionsSetup],
  );

  const allConnectionsSetUp = useMemo(
    () => totalSetUpConnections === Object.keys(connectionsSetup).length,
    [connectionsSetup, totalSetUpConnections],
  );

  const { watch } = methods;
  const values = watch();
  const allRequiredFieldsFilled = useMemo(() => {
    return Object.values(values).every((v) => !['', null, undefined].includes(v));
  }, [values]);

  const canProceedToInstall = useMemo(() => {
    if (skipSetup) return true;
    return allConnectionsSetUp && (filteredSteps.length <= 1 || allRequiredFieldsFilled);
  }, [skipSetup, allConnectionsSetUp, filteredSteps.length, allRequiredFieldsFilled]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Vintage Installation Overlay
  const installationOverlay = useMemo(
    () => (
      <AnimatePresence>
        {isLoading && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background:
                theme.palette.mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Animated vintage background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 10px,
                    ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 20px
                  )`,
                }}
              />
            </div>

            {/* Main Content */}
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              className="relative z-10 text-center max-w-md"
            >
              {/* Vintage Card */}
              <div
                className="relative px-12 py-10 rounded-2xl backdrop-blur-xl border-2 shadow-2xl"
                style={{
                  background:
                    theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.4)'
                      : 'rgba(255, 255, 255, 0.8)',
                  borderColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Vintage decorative corners */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl-lg opacity-60" />
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr-lg opacity-60" />
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl-lg opacity-60" />
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br-lg opacity-60" />

                {/* Animated Icon */}
                <m.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                  style={{
                    background:
                      theme.palette.mode === 'dark'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(59, 130, 246, 0.1)',
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
                  }}
                >
                  <Iconify
                    icon="mdi:package-variant-closed"
                    width={32}
                    style={{
                      color: theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6',
                    }}
                  />
                </m.div>

                {/* Title */}
                <div
                  className="text-3xl font-light tracking-widest mb-6 uppercase"
                  style={{
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    fontFamily: '"Georgia", serif',
                    letterSpacing: '0.2em',
                  }}
                >
                  Installing
                </div>

                {/* Progress Message */}
                <m.div
                  key={installationProgress}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-base tracking-wide mb-8 min-h-[24px]"
                  style={{
                    color:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                    fontFamily: '"Georgia", serif',
                  }}
                >
                  {installationProgress}
                </m.div>

                {/* Vintage Progress Bar */}
                <div
                  className="relative h-2 rounded-full overflow-hidden"
                  style={{
                    background:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <m.div
                    className="absolute inset-y-0 left-0"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      width: '50%',
                      background:
                        'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)',
                    }}
                  />
                </div>

                {/* Decorative dots */}
                <div className="flex gap-3 justify-center mt-8">
                  {[0, 1, 2].map((i) => (
                    <m.div
                      key={i}
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: 'easeInOut',
                      }}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.8)'
                            : 'rgba(59, 130, 246, 0.6)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Subtle glow effect */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent)',
                }}
              />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    ),
    [isLoading, installationProgress, theme.palette.mode],
  );

  // Memoize the dialog content to prevent re-renders
  const memoizedContent = useMemo(
    () => (
      <div className="max-w-4xl mx-auto p-6">
        <div
          className="rounded-xl shadow-lg border"
          style={{
            background:
              theme.palette.mode === 'dark'
                ? 'rgba(26, 32, 44, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Vintage Header */}
          <div
            className="flex justify-between items-center p-6 border-b relative"
            style={{
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Decorative line accent */}
            <div
              className="absolute top-0 left-6 right-6 h-[1px]"
              style={{
                background: `linear-gradient(to right, transparent, ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}, transparent)`,
              }}
            />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                }}
              >
                <Iconify
                  icon="mdi:package-variant"
                  width={20}
                  style={{
                    color: theme.palette.mode === 'dark' ? '#60a5fa' : '#3b82f6',
                  }}
                />
              </div>
              <h1
                className="text-2xl font-light tracking-wide"
                style={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  fontFamily: '"Georgia", serif',
                }}
              >
                Clone {clonedTemplate?.version?.public_details?.name}
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isFetched ? (
              !clonedTemplate?.version ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <p className="text-red-600 dark:text-red-400">
                    Invalid or non-existing {capitalize(mode) || 'Template'}.
                  </p>
                </div>
              ) : (
                <>
                  {!skipSetup && filteredSteps.length > 0 ? (
                    <>
                      {/* Setup Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Setup Steps
                        </h2>
                        <Button
                          onClick={() => setSkipSetup(true)}
                          variant="ghost"
                          size="sm"
                        >
                          Skip Setup
                        </Button>
                      </div>

                      {/* Steps */}
                      <div className="space-y-6">
                        {filteredSteps.map((step, index) => (
                          <div
                            key={step.label}
                            className="flex gap-4"
                          >
                            {/* Step Indicator */}
                            <div className="flex flex-col items-center">
                              <StepIndicator
                                step={index}
                                isActive={activeStep === index}
                                isCompleted={activeStep > index}
                              />
                              {index < filteredSteps.length - 1 && (
                                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 mt-2" />
                              )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {step.label}
                                </h3>
                                {step.required && (
                                  <span className="ml-2 text-xs text-red-500">*</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {step.description}
                              </p>

                              {activeStep === index && (
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                                  {step.content}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                        <Iconify
                          icon="mdi:check"
                          className="text-green-600 dark:text-green-400"
                          width={24}
                        />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Ready to Install
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {skipSetup
                          ? 'Default settings will be used for this template.'
                          : 'All setup steps completed successfully.'}
                      </p>
                      {skipSetup && (
                        <Button
                          onClick={() => setSkipSetup(false)}
                          variant="outline"
                          className="mb-4"
                        >
                          Configure Setup
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-3">
                  <Iconify
                    icon="svg-spinners:blocks-shuffle-3"
                    width={32}
                    className="text-blue-600 mx-auto"
                  />
                  <p className="text-gray-600 dark:text-gray-400">Loading template...</p>
                </div>
              </div>
            )}
          </div>

          {/* Vintage Sticky Footer */}
          {isFetched && clonedTemplate?.version && (
            <div
              className="border-t p-6 relative"
              style={{
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                background:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.2)'
                    : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex justify-between items-center">
                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {!skipSetup && filteredSteps.length > 0 && activeStep > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="outline"
                    >
                      Back
                    </Button>
                  )}
                  {!skipSetup &&
                    filteredSteps.length > 0 &&
                    activeStep < filteredSteps.length - 1 && (
                      <Button
                        onClick={handleNext}
                        disabled={activeStep === 0 && !allConnectionsSetUp}
                      >
                        Next
                      </Button>
                    )}
                </div>

                {/* Vintage Install Button */}
                <button
                  onClick={() => handleInstall(skipSetup)}
                  disabled={!canProceedToInstall || isLoading}
                  className="relative px-6 py-2.5 rounded-lg font-light tracking-wide transition-all duration-300 min-w-[160px]"
                  style={{
                    background:
                      !canProceedToInstall || isLoading
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(59, 130, 246, 0.3)'
                        : theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
                    color: 'white',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
                    boxShadow:
                      !canProceedToInstall || isLoading
                        ? 'none'
                        : '0 4px 20px rgba(59, 130, 246, 0.3)',
                    cursor: !canProceedToInstall || isLoading ? 'not-allowed' : 'pointer',
                    opacity: !canProceedToInstall || isLoading ? 0.6 : 1,
                    fontFamily: '"Georgia", serif',
                  }}
                >
                  {/* Decorative corners */}
                  {!isLoading && canProceedToInstall && (
                    <>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white opacity-50" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white opacity-50" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white opacity-50" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white opacity-50" />
                    </>
                  )}
                  <span className="flex items-center justify-center gap-2">
                    <Iconify
                      icon={isLoading ? 'svg-spinners:blocks-shuffle-3' : 'mdi:package-down'}
                      width={18}
                    />
                    {isLoading ? 'Installing...' : 'Install Template'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [
      clonedTemplate?.version?.public_details?.name,
      clonedTemplate?.version,
      isFetched,
      mode,
      skipSetup,
      filteredSteps,
      activeStep,
      handleBack,
      handleNext,
      allConnectionsSetUp,
      handleInstall,
      canProceedToInstall,
      isLoading,
      theme.palette.mode,
    ],
  );

  if (!clonedTemplateId) return null;

  return (
    <FormProvider {...methods}>
      {installationOverlay}
      {memoizedContent}
    </FormProvider>
  );
}

export default memo(CloneTemplate);
