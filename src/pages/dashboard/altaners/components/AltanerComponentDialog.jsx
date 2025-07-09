import {
  DialogTitle,
  DialogActions,
  Button,
  MenuItem,
  Stack,
  Tooltip,
  DialogContent,
} from '@mui/material';
import React, { useEffect, useCallback, memo, useMemo } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';

import ComponentTypeParams from './ComponentTypeParams';
import {
  CardDescription,
  CardTitle,
} from '../../../../components/aceternity/cards/card-hover-effect';
import InteractiveButton from '../../../../components/buttons/InteractiveButton';
import CustomDialog from '../../../../components/dialogs/CustomDialog.jsx';
import { RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/iconify/Iconify';
import useFeedbackDispatch from '../../../../hooks/useFeedbackDispatch';
import useKeyShortcutListener from '../../../../hooks/useKeyShortcutListener';
import {
  createAltanerComponent,
  selectCurrentAltaner,
  updateAltanerComponent,
} from '../../../../redux/slices/altaners';
import { useSelector } from '../../../../redux/store';

const componentTypes = {
  interface: {
    value: 'interface',
    label: 'Interface',
    icon: 'mdi:monitor-dashboard',
    paramsSchema: {
      type: 'object',
      properties: {
        id: {
          title: 'Interface',
          type: 'string',
          description: 'ID of the interface',
          'x-component': 'InterfaceAutocomplete',
        },
      },
      required: ['id'],
    },
  },
  agents: {
    value: 'agents',
    label: 'Agents',
    icon: 'fluent:bot-sparkle-20-filled',
    paramsSchema: {
      type: 'object',
      properties: {
        ids: {
          title: 'Agents',
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'AI Agents to include in the Altaner',
          'x-component': 'AgentAutocompleteMultiple',
        },
      },
      required: ['ids'],
    },
  },
  flows: {
    value: 'flows',
    label: 'Flows',
    icon: 'fluent:flash-flow-24-filled',
    paramsSchema: {
      type: 'object',
      properties: {
        ids: {
          title: 'Workflows',
          type: 'array',
          items: { type: 'string' },
          description: 'Workflows to include in the Altaner',
          'x-component': 'FlowAutocompleteMultiple',
        },
      },
      required: ['ids'],
    },
  },
  forms: {
    value: 'forms',
    label: 'Forms',
    icon: 'mdi:form',
    paramsSchema: {
      type: 'object',
      properties: {
        ids: {
          title: 'Forms',
          type: 'array',
          items: { type: 'string' },
          description: 'Forms to include in the Altaner',
          'x-component': 'FormAutocompleteMultiple',
        },
      },
      required: ['ids'],
    },
  },
  base: {
    value: 'base',
    label: 'Database',
    icon: 'material-symbols:database',
    paramsSchema: {
      type: 'object',
      properties: {
        ids: {
          title: 'Base',
          type: 'array',
          items: { type: 'string' },
          description: 'Base to include in the Altaner',
          'x-component': 'BaseAutocomplete',
        },
      },
      required: ['ids'],
    },
  },
  gate: {
    value: 'gate',
    label: 'Conversations',
    icon: 'fluent:chat-24-filled',
    paramsSchema: {
      type: 'object',
      properties: {
        id: {
          title: 'Gate',
          type: 'string',
          description: 'ID of the gate',
          'x-component': 'GateAutocomplete',
        },
      },
      required: ['id'],
    },
  },

  // products: {
  //   value: 'products',
  //   label: 'Products',
  //   icon: 'mdi:cart'
  // },
  // orders: {
  //   value: 'orders',
  //   label: 'Orders',
  //   icon: 'mdi:clipboard-list'
  // },
  // order_items: {
  //   value: 'order_items',
  //   label: 'Order Items',
  //   icon: 'mdi:clipboard-text'
  // },
  external_link: {
    value: 'external_link',
    label: 'External Link',
    icon: 'mdi:link',
    paramsSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          title: 'URL',
          description: 'The public url of the website',
          pattern: '^(https?://)?',
          example: 'https://www.example.com',
        },
      },
      required: ['url'],
    },
  },
  iframe: {
    value: 'iframe',
    label: 'iFrame',
    icon: 'mdi:iframe',
    paramsSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          title: 'URL',
          description: 'The public url of the website to be embedded',
          pattern: '^(https?://)?',
          example: 'https://www.example.com',
        },
      },
      required: ['url'],
    },
  },
  setup_flow: {
    value: 'setup_flow',
    label: 'Installer Workflow',
    icon: 'eos-icons:installing',
    defaultName: 'Installer',
    disableName: true,
    paramsSchema: {
      type: 'object',
      properties: {
        id: {
          title: 'Workflow',
          type: 'string',
          description: 'The workflow to execute when the Altaner is installed',
          'x-component': 'FlowAutocomplete',
        },
      },
      required: ['id'],
    },
  },
};

const AltanerComponentDialog = ({ altanerId, open, onClose, altanerComponentId }) => {
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const altaner = useSelector(selectCurrentAltaner);

  const component = useMemo(() => {
    if (!altaner || !altanerComponentId) return null;
    return altaner.components?.items?.find((item) => item.id === altanerComponentId);
  }, [altaner, altanerComponentId]);

  const defaultValues = useMemo(
    () => ({
      type: component?.type ?? '',
      name: component?.name ?? '',
      params: component?.params || {},
    }),
    [component?.name, component?.params, component?.type],
  );

  const methods = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
    watch,
    setValue,
    control,
  } = methods;
  const selectedType = watch('type');
  const params = useWatch({ control, name: 'params' });

  const onSubmit = useCallback(
    (data) => {
      if (!isValid) {
        console.log('its not valid');
        return;
      }
      const selectedComponentType = componentTypes[data.type];
      const componentData = {
        ...data,
        icon: selectedComponentType ? selectedComponentType.icon : '',
      };
      dispatchWithFeedback(
        altanerComponentId
          ? updateAltanerComponent(altanerId, altanerComponentId, componentData)
          : createAltanerComponent(altanerId, componentData),
      ).then(onClose);
    },
    [isValid, dispatchWithFeedback, altanerComponentId, altanerId, onClose],
  );

  const eventMappings = [
    {
      condition: (event) => (event.metaKey || event.ctrlKey) && event.key === 'Enter',
      handler: handleSubmit(onSubmit),
    },
    {
      condition: (event) => (event.metaKey || event.ctrlKey) && event.key === 'Enter',
      handler: onClose,
    },
  ];

  useKeyShortcutListener({
    eventsMapping: eventMappings,
    debounceTime: 300,
    stopPropagation: true,
  });

  const selectedComponent = useMemo(() => componentTypes[selectedType], [selectedType]);

  useEffect(() => {
    if (selectedType && !component?.name) {
      const selectedComponent = componentTypes[selectedType];
      const defaultName =
        selectedComponent?.defaultName || selectedComponent?.label || selectedType;
      setValue('name', defaultName);
    }
  }, [selectedType, setValue]);

  const isSubmitDisabled = useMemo(() => {
    if (!isValid) return true;
    if (['forms', 'flows', 'agents'].includes(selectedType)) {
      return !params.ids || params.ids.length === 0;
    }
    return false;
  }, [isValid, selectedType, params]);

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <DialogTitle>
        <CardTitle>{altanerComponentId ? 'Edit' : 'Create'} Altaner Component</CardTitle>
        <CardDescription className="text-xs font-light">
          Altaner components link assets into a single entity without merging them. Deleting a
          component only removes the association, not the assets.
        </CardDescription>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormProvider {...methods}>
            <Stack spacing={1}>
              <RHFTextField
                name="type"
                select
                label="Component Type"
                size="small"
                variant="filled"
                controllerProps={{
                  rules: { required: 'Component type is required' },
                }}
              >
                {Object.values(componentTypes).map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    <div className="flex flex-row items-center w-full gap-1 antialiased">
                      <Iconify
                        icon={option.icon}
                        width={17}
                      />
                      <CardTitle className="text-left text-sm truncate w-full ml-2">
                        {option.label}
                      </CardTitle>
                    </div>
                  </MenuItem>
                ))}
              </RHFTextField>
              {!!selectedComponent && (
                <RHFTextField
                  name="name"
                  label="Component Name"
                  size="small"
                  controllerProps={{
                    rules: { required: 'Component name is required' },
                  }}
                  autoFocus
                  disabled={selectedComponent?.disableName}
                />
              )}

              {!!selectedComponent?.paramsSchema && (
                <ComponentTypeParams schema={selectedComponent.paramsSchema} />
              )}
            </Stack>
          </FormProvider>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Tooltip
          title={
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              <Iconify icon="solar:command-linear" />
              <Iconify icon="mdi:backspace-outline" />
            </Stack>
          }
        >
          <Button onClick={onClose}>Cancel</Button>
        </Tooltip>
        <Tooltip
          title={
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
            >
              <Iconify
                icon="solar:command-linear"
                width={15}
              />
              <Iconify
                icon="mi:enter"
                width={15}
              />
            </Stack>
          }
        >
          <InteractiveButton
            icon="mdi:check"
            title={altanerComponentId ? 'Update' : 'Create'}
            onClick={handleSubmit(onSubmit)}
            duration={8000}
            containerClassName="h-[40]"
            borderClassName="h-[80px] w-[250px]"
            enableBorder={true}
            className="p-2"
            loading={false}
            disabled={isSubmitDisabled}
            loadingIcon="svg-spinners:12-dots-scale-rotate"
          />
        </Tooltip>
      </DialogActions>
    </CustomDialog>
  );
};

export default memo(AltanerComponentDialog);
