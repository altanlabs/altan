// import { Skeleton } from '@mui/material';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { optimai } from '../../../../utils/axios';
import FormParameters from '../../form/FormParameters';

const parseInput = (inputValue) => {
  if (!inputValue) {
    return {};
  }
  return inputValue.reduce((acc, item) => {
    acc[item.name.replace('[', '$').replace(']', '%')] = item.value;
    return acc;
  }, {});
};

const transformOutput = (schema, obj) => {
  return Object.entries(obj)
    .filter(([k, v]) => schema.properties[k] && !['', undefined, null].includes(v))
    .map(([k, v]) => ({
      name: k.replace('$', '[').replace('%', ']'),
      value: v,
      type: schema.properties[k].type,
    }));
};

const isEqual = (a, b) => {
  // simple deep equality check via JSON stringify (ensure order is stable)
  return JSON.stringify(a) === JSON.stringify(b);
};

const InvokeFlowInputVarsForm = memo(({ defaultValues, flowSchema, onChange }) => {
  const [initialized, setInitialized] = useState(false);
  const prevTransformedRef = useRef(null);

  // Initialize the form with default values
  const flowArgsMethods = useForm({ defaultValues });

  // Reset the form when default values change
  useEffect(() => {
    flowArgsMethods.reset(defaultValues);
  }, [defaultValues, flowArgsMethods]);

  // Watch the entire form state
  const watchFields = flowArgsMethods.watch();

  // Transform the output in real time and trigger onChange only if the result changes.
  useEffect(() => {
    const transformed = transformOutput(flowSchema, watchFields);

    // On the very first run, initialize without firing onChange.
    if (!initialized) {
      prevTransformedRef.current = transformed;
      setInitialized(true);
      return;
    }

    if (!isEqual(transformed, prevTransformedRef.current)) {
      prevTransformedRef.current = transformed;
      onChange(transformed);
    }
  }, [watchFields, flowSchema, initialized, onChange]);

  return (
    <FormProvider {...flowArgsMethods}>
      <div className="flex flex-col p-2 w-full">
        <FormParameters
          formSchema={flowSchema}
          enableLexical={true}
          enableAIFill={false}
          path=""
        />
      </div>
    </FormProvider>
  );
});

InvokeFlowInputVarsForm.displayName = 'InvokeFlowInputVarsForm';

const InvokeFlowInputVars = ({ onChange, value }) => {
  // Assuming 'workflow_id' is available in a parent form context.
  const flowId = useWatch({ name: 'workflow_id' });
  const [flowSchema, setFlowSchema] = useState(null);

  useEffect(() => {
    const fetchFlowSchema = async () => {
      try {
        const response = await optimai.get(`/flow/${flowId}/json-schema`);
        setFlowSchema(response.data.input_schema);
      } catch (err) {
        console.error('Error fetching flow schema:', err);
        setFlowSchema(null);
      }
    };

    if (flowId) {
      fetchFlowSchema();
    } else {
      setFlowSchema(null);
    }
  }, [flowId]);

  // Calculate default values only when both flowId and schema are available.
  const defaultValues = useMemo(() => {
    return flowId && flowSchema ? parseInput(value) : undefined;
  }, [flowId, flowSchema, value]);

  if (!flowId) {
    return <div>Select a target workflow</div>;
  }

  if (!flowSchema) {
    return <div>Loading schema...</div>;
  }

  if (!Object.keys(flowSchema?.properties ?? {}).length) {
    return <div>No input to set</div>;
  }

  // Wait until default values are ready
  if (!defaultValues) {
    return <div>Loading default values...</div>;
  }

  return (
    <InvokeFlowInputVarsForm
      defaultValues={defaultValues}
      flowSchema={flowSchema}
      onChange={onChange}
    />
  );
};

export default memo(InvokeFlowInputVars);
