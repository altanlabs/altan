import { capitalize } from 'lodash';
import { lazy } from 'react';

import { DynamicLoadable } from '../component/DynamicLoadable.jsx';

const getOptionsFromSchema = (schema) =>
  schema.enum?.map((o, i) => ({
    value: o,
    label: capitalize(o),
    description: schema.enumDescriptions ? schema.enumDescriptions[i] : '',
  })) ||
  (schema.oneOf || schema.anyOf)
    ?.map((o) => ({
      value: o.const,
      label: o.title,
      description: o.description,
    }))
    .filter((o) => !!o.value);

const overrideLabel = (schema) => {
  if (schema['x-override-label']) {
    return {
      title: schema['x-override-label'],
    };
  }
  return {};
};

export const getComponentProps = (params) => {
  const {
    fieldKey,
    fieldType,
    title,
    schema,
    enableLexical,
    expanded,
    hasProperties,
    hasOfProperties,
    ofValue,
    ofOption,
    // relationship,
    sortKey,
  } = params;

  const props = { fieldKey, title, schema };

  switch (fieldType) {
    case 'integer':
    case 'number':
    case 'float':
    case 'decimal':
      return {
        Component: 'NumericInput',
        props: { ...props, type: fieldType },
      };
    case 'string': {
      if (!!schema['x-comma-separated']) {
        return {
          Component: 'MultiSelectAutocomplete',
          props: {
            ...props,
            ...overrideLabel(schema),
            commaSeparated: true,
          },
        };
      }
      const options = getOptionsFromSchema(schema);
      if (options?.length) {
        return {
          Component: 'SingleSelectAutocomplete',
          props: {
            ...props,
            options,
            selectedSchema: schema,
            ...overrideLabel(schema),
          },
        };
      }
      return {
        Component: 'FreeModeTextField',
        props: {
          ...props,
          enableLexical,
          expanded,
          ...overrideLabel(schema),
        },
      };
    }
    case 'array':
    case 'object':
      const isString = schema?.items?.type === 'string';
      const itemsXComponent = !!schema?.items?.['x-component'];
      const isEnum = schema?.items?.enum?.length > 0;
      if (isString && !isEnum) {
        return {
          Component: 'FreesoloArrayAutocomplete',
          props: {
            ...props,
            ...overrideLabel(schema),
          },
        };
      } else if (isEnum) {
        return {
          Component: 'MultiSelectAutocomplete',
          props: {
            ...props,
            ...overrideLabel(schema),
          },
        };
      } else if (hasProperties || itemsXComponent) {
        if (fieldType === 'object') {
          return {
            Component: 'DynamicFormFieldObject',
            props: {
              ...props,
              hasOfProperties,
              ofValue,
              ofOption,
              enableLexical,
              sortKey,
            },
            wrapper: true,
          };
        } else {
          return {
            Component: 'DynamicFormFieldArray',
            props: { ...props, enableLexical },
          };
        }
      }
      return {
        Component: 'ArrayOrObjectAceWrapper',
        props: { ...props, fieldType, expanded },
      };
    default:
      return {
        Component: 'Typography',
        props: {
          children: `Unsupported field type for ${fieldKey}: ${fieldType}`,
        },
      };
  }
};

// 1) Lazy imports
const ArrayOrObjectAceWrapper = DynamicLoadable(
  lazy(() => import('../editors/ArrayOrObjectAceWrapper.jsx')),
);
const DynamicFormFieldAutocompleteMapping = DynamicLoadable(
  lazy(() => import('../DynamicFormFieldAutocompleteMapping.jsx')),
);
const DynamicFormFieldObject = DynamicLoadable(lazy(() => import('../DynamicFormFieldObject.jsx')));
const DynamicFormFieldArray = DynamicLoadable(lazy(() => import('../DynamicFormFieldArray.jsx')));
const FreeModeTextField = DynamicLoadable(lazy(() => import('../editors/FreeModeTextField.jsx')));
const FreesoloArrayAutocomplete = DynamicLoadable(
  lazy(() => import('../autocompletes/FreesoloArrayAutocomplete.jsx')),
);
const MultiSelectAutocomplete = DynamicLoadable(
  lazy(() => import('../autocompletes/MultiSelectAutocomplete.jsx')),
);
const NumericInput = DynamicLoadable(lazy(() => import('../editors/NumericInput.jsx')));
const DynamicFormFieldCustomComponent = DynamicLoadable(
  lazy(() => import('../DynamicFormFieldCustomComponent.jsx')),
);
const SingleSelectAutocomplete = DynamicLoadable(
  lazy(() => import('../autocompletes/SingleSelectAutocomplete.jsx')),
);

const VoiceSelection = DynamicLoadable(
  lazy(() => import('../../../../sections/@dashboard/agents/VoiceSelection.jsx')),
);
const FormAutocomplete = DynamicLoadable(lazy(() => import('../../../FormAutocomplete.jsx')));
const CreateWithAI = DynamicLoadable(lazy(() => import('../../../CreateWithAI.jsx')));
const AgentAutocomplete = DynamicLoadable(lazy(() => import('../../../AgentAutocomplete.jsx')));
const AppsAutocomplete = DynamicLoadable(lazy(() => import('../../../AppsAutocomplete.jsx')));
const AccountId = DynamicLoadable(lazy(() => import('../../../AccountId.jsx')));
const TriggerType = DynamicLoadable(lazy(() => import('../../../TriggerType.jsx')));
const IteratorAutocomplete = DynamicLoadable(
  lazy(() => import('../../../IteratorAutocomplete.jsx')),
);
const Webhook = DynamicLoadable(lazy(() => import('../../../webhook/Webhook.jsx')));
const SystemFields = DynamicLoadable(lazy(() => import('../../../SystemFields.jsx')));
const FilterSpec = DynamicLoadable(
  lazy(() => import('../../../graphqueryspec/filterspec/FilterSpec.jsx')),
);
const FileToUrl = DynamicLoadable(lazy(() => import('../../../FileToUrl.jsx')));
const AddressAutocompleteReal = DynamicLoadable(
  lazy(() => import('../../../AddressAutocompleteReal.jsx')),
);
const ThreadSelector = DynamicLoadable(lazy(() => import('../../../ThreadSelector.jsx')));
const TableAutocomplete = DynamicLoadable(lazy(() => import('../../../TableAutocomplete.jsx')));
const GateAutocomplete = DynamicLoadable(lazy(() => import('../../../GateAutocomplete.jsx')));
const InterfaceAutocomplete = DynamicLoadable(
  lazy(() => import('../../../InterfaceAutocomplete.jsx')),
);
const BaseAutocomplete = DynamicLoadable(
  lazy(() => import('../../../BaseAutocomplete.jsx')),
);
const HTMLEditor = DynamicLoadable(lazy(() => import('../../../HTMLEditor.jsx')));
const AltanerSubscriptionGroup = DynamicLoadable(
  lazy(() => import('../../../AltanerSubscriptionGroup.jsx')),
);
const TemplatePublicName = DynamicLoadable(lazy(() => import('../../../TemplatePublicName.jsx')));

const PriceEditor = DynamicLoadable(lazy(() => import('../../../PriceEditor.jsx')));
const ActionTypeSelector = DynamicLoadable(lazy(() => import('../../../ActionTypeSelector.jsx')));
const MembersAutocomplete = DynamicLoadable(
  lazy(() => import('../../../members/MembersAutocomplete.jsx')),
);
const SchemaFormLoader = DynamicLoadable(lazy(() => import('../component/SchemaFormLoader.jsx')));
const RichAceEditor = DynamicLoadable(lazy(() => import('../editors/RichAceEditor.jsx')));
const IconAutocomplete = DynamicLoadable(lazy(() => import('../../../IconAutocomplete.jsx')));
const FlowAutocomplete = DynamicLoadable(lazy(() => import('../../../FlowAutocomplete.jsx')));
const RoomAutocomplete = DynamicLoadable(lazy(() => import('../../../RoomAutocomplete.jsx')));
const CronAutocomplete = DynamicLoadable(
  lazy(() => import('../autocompletes/CronAutocomplete.jsx')),
);
const AltanerVariablesInstallationOverride = DynamicLoadable(
  lazy(() => import('../../../AltanerVariablesInstallationOverride.jsx')),
);

const InvokeFlowInputVars = DynamicLoadable(
  lazy(() => import('../component/InvokeFlowInputVars.jsx')),
);

// 2) Export them as an object
export const COMPONENTS = {
  ArrayOrObjectAceWrapper,
  DynamicFormFieldAutocompleteMapping,
  DynamicFormFieldObject,
  DynamicFormFieldArray,
  FreeModeTextField,
  FreesoloArrayAutocomplete,
  MultiSelectAutocomplete,
  NumericInput,
  DynamicFormFieldCustomComponent,
  SingleSelectAutocomplete,

  // X-COMPONENTS
  AccountId,
  TriggerType,
  VoiceSelection,
  TemplatePublicName,
  FormAutocomplete,
  CreateWithAI,
  AgentAutocomplete,
  AppsAutocomplete,
  Webhook,
  SystemFields,
  FilterSpec,
  FileToUrl,
  AddressAutocompleteReal,
  ThreadSelector,
  TableAutocomplete,
  GateAutocomplete,
  InterfaceAutocomplete,
  BaseAutocomplete,
  HTMLEditor,
  AltanerSubscriptionGroup,
  PriceEditor,
  ActionTypeSelector,
  MembersAutocomplete,
  RichAceEditor,
  IconAutocomplete,
  FlowAutocomplete,
  RoomAutocomplete,
  CronAutocomplete,
  IteratorAutocomplete,
  AltanerVariablesInstallationOverride,
  InvokeFlowInputVars,
  SchemaFormLoader,
};
