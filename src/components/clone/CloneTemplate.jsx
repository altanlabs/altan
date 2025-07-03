import { IconButton } from '@mui/material';
import React, { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import { cn } from '@lib/utils';

import ConnectionsSetupStep from './steps/ConnectionsSetupStep.jsx';
import VarsStep from './steps/VarsStep.jsx';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { selectConnections } from '../../redux/slices/connections';
import { cloneTemplate, selectAccount } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import { optimai_shop, optimai_integration } from '../../utils/axios';
import Iconify from '../iconify';

// Simple capitalize function to replace lodash
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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

function CloneTemplate({ clonedTemplateId, onClose }) {
  const history = useHistory();
  const [activeStep, setActiveStep] = useState(0);
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);
  const [connectionsSetup, setConnectionsSetup] = useState({});
  const [mode, setMode] = useState(null);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [clonedTemplate, setClonedTemplate] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
            onClose();
            history.push(`/${MAP_REDIRECT[mode]}/${clone}?fromtemplate=true`);
          })
          .catch((err) => console.error(err))
          .finally(() => setIsLoading(false));
      }
    },
    [
      clonedTemplate,
      dispatchWithFeedback,
      connectionsSetup,
      methods,
      defaultValues,
      onClose,
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

  // Memoize the dialog content to prevent re-renders
  const memoizedContent = useMemo(() => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clone {clonedTemplate?.version?.public_details?.name}
          </h1>
          <IconButton
            onClick={onClose}
            variant="icon"
          >
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFetched ? (
            !clonedTemplate?.version ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-red-600 dark:text-red-400">
                  Invalid or non-existing {capitalize(mode)} Template.
                </p>
                <IconButton
                  onClick={onClose}
                  variant="icon"
                >
                  <Iconify icon="eva:arrow-back-fill" />
                </IconButton>
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

        {/* Sticky Footer */}
        {isFetched && clonedTemplate?.version && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
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

              {/* Install Button */}
              <Button
                onClick={() => handleInstall(skipSetup)}
                disabled={!canProceedToInstall || isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Iconify
                      icon="svg-spinners:blocks-shuffle-3"
                      width={16}
                      className="mr-2"
                    />
                    Installing...
                  </>
                ) : (
                  <>
                    <Iconify
                      icon="mdi:check"
                      width={16}
                      className="mr-2"
                    />
                    Install Template
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  ), [
    clonedTemplate?.version?.public_details?.name,
    clonedTemplate?.version,
    onClose,
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
  ]);

  if (!clonedTemplateId) return null;

  return (
    <FormProvider {...methods}>
      {memoizedContent}
    </FormProvider>
  );
}

export default memo(CloneTemplate);
