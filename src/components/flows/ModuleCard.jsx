// import InternalModule from './modules/InternalModule';
import Stack from '@mui/material/Stack';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getDefaultValues, getModuleSchema } from '@utils/schemas';

import ActionModule from './modules/ActionModule.jsx';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import ModuleHeader from './modules/helpers/ModuleHeader.jsx';
import RouterModule from './modules/RouterModule.jsx';
import SearchModule from './modules/SearchModule.jsx';
import {
  addNewModule,
  createModule,
  currentToolSchemaSelector,
  editModule,
  selectFlowId,
  makeSelectFullModule,
  setNewModuleType,
} from '../../redux/slices/flows';
import { dispatch, useSelector } from '../../redux/store';
import formatData from '../../utils/formatData';
import FormParameter from '../tools/form/FormParameter.jsx';

const CUSTOM_MODULES_COMPONENTS = {
  action: ActionModule,
  search: SearchModule,
  // repeater: RepeaterModule,
  // aggregator: AggregatorModule,
  router: RouterModule,
  // internal: InternalModule,
};

// const getToolParametersSchema = (tool) => {
//   const action = tool?.action_type;
//   if (!action) {
//     return {};
//   }
//   return {
//     ...(action?.headers?.properties || {}),
//     ...(action?.path_params?.properties || {}),
//     ...(action?.query_params?.properties || {}),
//     ...(action?.body?.properties || {})
//   };
// };

const ModuleCard = ({ onClose, id = null, after = null }) => {
  const currentToolSchema = useSelector(currentToolSchemaSelector);
  const { enqueueSnackbar } = useSnackbar();
  const flowId = useSelector(selectFlowId);
  const moduleSelector = useMemo(makeSelectFullModule, []);
  const module = useSelector((state) => moduleSelector(state, id, after));
  const [submitSuccessful, setSubmitSuccessful] = useState(false);
  const [dispatchWithFeedback] = useFeedbackDispatch();

  const { moduleSchema, uiModuleSchema } = useMemo(() => {
    if (!module) return {};

    const moduleSchema = getModuleSchema(module);
    if (!moduleSchema) return {};

    const filteredNonUiProperties = Object.entries(moduleSchema.properties || {})
      .filter(([, schema]) => !schema['x-ignore-ui'])
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const uiModuleSchema = { ...moduleSchema, properties: filteredNonUiProperties };

    return { moduleSchema, uiModuleSchema };
  }, [module]);
  const defaultValues = useMemo(
    () => !!moduleSchema && getDefaultValues(moduleSchema, module || {}),
    [moduleSchema, module],
  );

  const methods = useForm({ defaultValues });

  const {
    formState: { isDirty },
    reset,
  } = methods;

  const onSubmit = useCallback(
    async (data) => {
      if (!flowId) {
        enqueueSnackbar('Cannot update or create module in undefined flow', { variant: 'error' });
      }
      const { after, position, meta_data, ...oldModuleData } = module;
      const formattedNewData = {};
      try {
        // Use the formatData function to format the entire data object according to the moduleSchema
        const formattedData = formatData(data, moduleSchema.properties);
        if (['action', 'search'].includes(module.type) && !formattedData?.tool?.connection_id) {
          throw new Error('you must select a connection');
        }
        if (formattedData.tool && currentToolSchema?.properties) {
          if ('action_type' in formattedData.tool) {
            delete formattedData.tool.action_type;
          }
          formattedData.tool = formatData(formattedData.tool, currentToolSchema?.properties);
          // formattedData.tool.parameters = formatData(formattedData.tool.parameters);
        }
        Object.assign(formattedNewData, formattedData);
      } catch (e) {
        const errorMessage = `Error formatting module parameters: ${e.message}`;
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error(errorMessage);
        return;
      }
      const moduleData = {
        module: {
          ...(oldModuleData || {}),
          ...(formattedNewData || {}),
        },
      };

      const mustCreate = !module.workflow_id;

      if (mustCreate) {
        moduleData.module.canvas_position = module.meta_data.position;
      }

      const mustCreateModuleAfter = moduleData.module.type === 'trigger';
      let createModuleAfter = null;
      if (!!mustCreateModuleAfter && moduleData.module.action) {
        createModuleAfter = { ...moduleData.module.action };
        delete moduleData.module.action;
      }

      dispatchWithFeedback(
        !!mustCreate
          ? createModule({ flowId, data: moduleData, after })
          : editModule({ id: module.id, data: moduleData }),
        {
          successMessage: `Module ${mustCreate ? 'created' : 'updated'} successfully`,
          errorMessage: `There was an error ${mustCreate ? 'creating' : 'updating'} the module`,
          useSnackbar: true,
        },
      ).then((createdModuleId) => {
        setSubmitSuccessful(true);
        if (!!mustCreateModuleAfter) {
          const after = {
            type: 'trigger',
            id: mustCreate ? createdModuleId : module.id,
          };
          const prevPosition = module.meta_data.position;
          dispatch(
            addNewModule({
              after,
              position: { x: (prevPosition?.x ?? 0) + 200, y: prevPosition?.y ?? 0 },
            }),
          );
          if (!!createModuleAfter) {
            dispatch(setNewModuleType({ ...createModuleAfter, after }));
          }
        }
      });
    },
    [
      currentToolSchema?.properties,
      dispatchWithFeedback,
      enqueueSnackbar,
      flowId,
      module,
      moduleSchema?.properties,
    ],
  );

  useEffect(() => {
    if (!!submitSuccessful) {
      setSubmitSuccessful(false);
      reset(undefined, { keepValues: true, keepDirty: false });
    }
  }, [submitSuccessful]);

  useEffect(() => {
    if (isDirty) {
      reset(undefined, { keepValues: true, keepDirty: false });
    }
  }, [defaultValues]);

  const renderExtraFields = useCallback(
    (schema) =>
      Object.entries(schema.properties).map(([key, fieldSchema]) => {
        const required = (schema.required || []).includes(key);
        return (
          <FormParameter
            key={key}
            fieldKey={key}
            schema={fieldSchema}
            required={required}
            enableLexical={true}
          />
        );
      }),
    [],
  );

  const renderContent = useMemo(() => {
    if (!module) {
      return null;
    }
    const ModuleComponent = CUSTOM_MODULES_COMPONENTS[module.type];
    const required = uiModuleSchema.required;
    const { before, after } = Object.entries(uiModuleSchema.properties).reduce(
      (acc, [key, value]) => {
        acc[value['x-before'] ? 'before' : 'after'][key] = value;
        return acc;
      },
      { before: {}, after: {} },
    );
    return (
      <Stack
        paddingY={1}
        spacing={0.75}
        paddingBottom={10}
        height="100%"
      >
        {!!Object.keys(before).length && renderExtraFields({ properties: before, required })}
        {!!ModuleComponent && (
          <ModuleComponent
            module={module}
            schema={moduleSchema}
            uiSchema={uiModuleSchema}
          />
        )}
        {!!Object.keys(after).length && renderExtraFields({ properties: after, required })}
      </Stack>
    );
  }, [module, uiModuleSchema, renderExtraFields, moduleSchema]);

  if (!module) {
    return null;
  }

  return (
    <FormProvider
      {...methods}
      onSubmit={onSubmit}
    >
      <ModuleHeader
        module={module}
        onClose={onClose}
      />
      <Stack
        paddingX={1.5}
        height="100%"
        spacing={1}
        className="h-full w-full md:w-auto"
      >
        {renderContent}
      </Stack>
    </FormProvider>
  );
};

export default memo(ModuleCard);
