// BUENO

import { memo, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { COMPONENTS } from './components/index.js';

const componentMapping = {
  TriggerType: 'TriggerType',
  AccountId: 'AccountId',
  IteratorAutocomplete: 'IteratorAutocomplete',
  HTMLEditor: 'HTMLEditor',
  TemplatePublicName: 'TemplatePublicName',
  AltanerVariablesInstallationOverride: 'AltanerVariablesInstallationOverride',
  InvokeFlowInputVars: 'InvokeFlowInputVars',
  AltanerSubscriptionGroup: 'AltanerSubscriptionGroup',
  CreateWithAI: 'CreateWithAI',
  markdown: 'RichAceEditor',
  CodeEditor: 'RichAceEditor', // same RichAceEditor for these
  python: 'RichAceEditor',
  java: 'RichAceEditor',
  javascript: 'RichAceEditor',
  jsx: 'RichAceEditor',
  ClientAutocomplete: 'ClientAutocomplete',
  GateAutocomplete: 'GateAutocomplete',
  InterfaceAutocomplete: 'InterfaceAutocomplete',
  BaseAutocomplete: 'BaseAutocomplete',
  PriceEditor: 'PriceEditor',
  ThreadSelector: 'ThreadSelector',
  TableAutocomplete: 'TableAutocomplete',
  AddressAutocompleteReal: 'AddressAutocompleteReal',
  FileToUrl: 'FileToUrl',
  AgentAutocomplete: 'AgentAutocomplete',
  AgentAutocompleteMultiple: 'AgentAutocomplete', // same component
  RoomAutocomplete: 'RoomAutocomplete',
  FlowAutocomplete: 'FlowAutocomplete',
  FlowAutocompleteMultiple: 'FlowAutocomplete', // same component
  MembersAutocomplete: 'MembersAutocomplete',
  SchemaFormLoader: 'SchemaFormLoader',
  IconAutocomplete: 'IconAutocomplete',
  ActionTypeSelector: 'ActionTypeSelector',
  webhook: 'Webhook',
  filterspec: 'FilterSpec',
  cron: 'CronAutocomplete',
};

const getComponentProps = ({ title, schema, fieldKey }) => ({
  TriggerType: {},
  AccountId: {},
  IteratorAutocomplete: {},
  HTMLEditor: {},
  TemplatePublicName: {},
  AltanerVariablesInstallationOverride: { fieldKey },
  AltanerSubscriptionGroup: {},
  FormAutocomplete: {},
  CreateWithAI: {},
  FormAutocompleteMultiple: { multiple: true },
  VoiceSection: {},
  TableAutocomplete: {},
  markdown: { key: fieldKey, mode: 'markdown' },
  CodeEditor: {
    key: fieldKey,
    mode: 'python',
    placeholder: 'Put your code here...',
  },
  python: {
    key: fieldKey,
    mode: 'python',
    placeholder: 'Put your code here...',
  },
  java: { key: fieldKey, mode: 'java' },
  javascript: { key: fieldKey, mode: 'jsx' },
  jsx: { key: fieldKey, mode: 'jsx' },
  ClientAutocomplete: {},
  GateAutocomplete: {},
  InterfaceAutocomplete: {},
  BaseAutocomplete: {},
  PriceEditor: {},
  ThreadSelector: {},
  AddressAutocompleteReal: { name: title || fieldKey },
  FileToUrl: { name: title || fieldKey },
  AgentAutocomplete: {},
  AgentAutocompleteMultiple: { multiple: true },
  FlowAutocomplete: {},
  RoomAutocomplete: {},
  FlowAutocompleteMultiple: { multiple: true },
  SchemaFormLoader: {
    ...(schema['x-arguments'] ?? { args: {}, request: {}, response: {}, schema_url: null }),
    path: fieldKey,
    name: title,
  },
  MembersAutocomplete: schema['x-arguments'] ?? { multiple: false, label: 'Owner' },
  IconAutocomplete: {},
  ActionTypeSelector: {},
  webhook: {},
  filterspec: {},
  cron: {},
});

const DynamicFormFieldCustomComponent = ({ fieldKey, title, schema, onChange }) => {
  const value = useWatch({ name: fieldKey });

  const LazyComponent = COMPONENTS[componentMapping[schema['x-component']]];

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
