import { memo, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { COMPONENTS } from './components/index.js';

/**
 * Maps x-component schema values to actual component implementations
 * This allows dynamic loading of specialized form components
 */
const componentMapping = {
  // Core components
  TriggerType: 'TriggerType',
  AccountId: 'AccountId',
  IteratorAutocomplete: 'IteratorAutocomplete',

  // Editors
  HTMLEditor: 'HTMLEditor',
  markdown: 'RichAceEditor',
  CodeEditor: 'RichAceEditor',
  python: 'RichAceEditor',
  java: 'RichAceEditor',
  javascript: 'RichAceEditor',
  jsx: 'RichAceEditor',

  // Autocomplete variants
  ClientAutocomplete: 'ClientAutocomplete',
  GateAutocomplete: 'GateAutocomplete',
  InterfaceAutocomplete: 'InterfaceAutocomplete',
  AddressAutocompleteReal: 'AddressAutocompleteReal',
  AgentAutocomplete: 'AgentAutocomplete',
  AgentAutocompleteMultiple: 'AgentAutocomplete',
  RoomAutocomplete: 'RoomAutocomplete',
  FlowAutocomplete: 'FlowAutocomplete',
  FlowAutocompleteMultiple: 'FlowAutocomplete',
  MembersAutocomplete: 'MembersAutocomplete',
  IconAutocomplete: 'IconAutocomplete',

  // Specialized components
  TemplatePublicName: 'TemplatePublicName',
  AltanerVariablesInstallationOverride: 'AltanerVariablesInstallationOverride',
  InvokeFlowInputVars: 'InvokeFlowInputVars',
  CreateWithAI: 'CreateWithAI',
  PriceEditor: 'PriceEditor',
  ThreadSelector: 'ThreadSelector',
  FileToUrl: 'FileToUrl',
  SchemaFormLoader: 'SchemaFormLoader',
  ActionTypeSelector: 'ActionTypeSelector',
  webhook: 'Webhook',
  filterspec: 'FilterSpec',
  cron: 'CronAutocomplete',
};

/**
 * Returns component-specific props based on the x-component type
 * Each component may require different configuration
 */
const getComponentProps = ({ title, schema, fieldKey }) => ({
  // Core components (no special props)
  TriggerType: {},
  AccountId: {},
  IteratorAutocomplete: {},
  HTMLEditor: {},
  TemplatePublicName: {},
  FormAutocomplete: {},
  CreateWithAI: {},
  VoiceSection: {},
  ClientAutocomplete: {},
  GateAutocomplete: {},
  InterfaceAutocomplete: {},
  PriceEditor: {},
  ThreadSelector: {},
  IconAutocomplete: {},
  ActionTypeSelector: {},
  webhook: {},
  filterspec: {},
  cron: {},

  // Components with special props
  AltanerVariablesInstallationOverride: { fieldKey },
  FormAutocompleteMultiple: { multiple: true },
  AgentAutocompleteMultiple: { multiple: true },
  FlowAutocompleteMultiple: { multiple: true },
  AddressAutocompleteReal: { name: title || fieldKey },
  FileToUrl: { name: title || fieldKey },
  AgentAutocomplete: {},
  FlowAutocomplete: {},
  RoomAutocomplete: {},

  // Code editors with mode configuration
  markdown: { key: fieldKey, mode: 'markdown' },
  CodeEditor: { key: fieldKey, mode: 'python', placeholder: 'Put your code here...' },
  python: { key: fieldKey, mode: 'python', placeholder: 'Put your code here...' },
  java: { key: fieldKey, mode: 'java' },
  javascript: { key: fieldKey, mode: 'jsx' },
  jsx: { key: fieldKey, mode: 'jsx' },

  // Complex components with schema arguments
  SchemaFormLoader: {
    ...(schema['x-arguments'] ?? { args: {}, request: {}, response: {}, schema_url: null }),
    path: fieldKey,
    name: title,
  },
  MembersAutocomplete: schema['x-arguments'] ?? { multiple: false, label: 'Owner' },
});

/**
 * Renders a custom component based on the schema's x-component property
 * Dynamically loads the appropriate component and passes required props
 */
const DynamicFormFieldCustomComponent = ({ fieldKey, title, schema, onChange }) => {
  const value = useWatch({ name: fieldKey });

  // Get the lazy-loaded component from the mapping
  const LazyComponent = COMPONENTS[componentMapping[schema['x-component']]];

  // Get component-specific props
  const { key, ...props } = useMemo(
    () =>
      getComponentProps({
        fieldKey,
        title,
        schema,
      })[schema['x-component']] ?? {},
    [fieldKey, schema, title],
  );

  if (!LazyComponent) {
    return null;
  }

  return (
    <LazyComponent
      key={key}
      value={value ?? null}
      onChange={onChange}
      {...props}
    />
  );
};

export default memo(DynamicFormFieldCustomComponent);
