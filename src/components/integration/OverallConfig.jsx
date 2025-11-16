import { LoadingButton } from '@mui/lab';
import React, { memo, useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getDefaultValues } from '@utils/schemas';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { updateConnectionType } from '../../redux/slices/general/index.ts';
import formatData from '../../utils/formatData';
import FormParameter from '../tools/form/FormParameter';

const OVERALL_CONFIG_SCHEMA = {
  title: 'OverallConfig',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the connection type.',
      'x-hide-label': true,
    },
    description: {
      type: 'string',
      description: 'The description of the connection type.',
      'x-hide-label': true,
    },
    icon: {
      type: 'string',
      description: 'The public URL of the icon.',
      'x-hide-label': true,
    },
    auth_type: {
      type: 'string',
      title: 'Authentication Type',
      description: 'The type of authentication for this app',
      'x-hide-label': true,
      enum: [
        'none',
        'api_key',
        'oauth',
        'basic_auth',
        'bearer_token',
        // "service_account",
        // "database_credentials",
        // "ldap",
        // "saml",
        // "kerberos",
        // "jwt",
        // "iam_aws",
        // "scram",
        // "x509_certificate",
        // "sasl",
        // "personal_access_token",
        // "session_token",
        // "gssapi",
        // "token_based_auth",
        // "multi_factor_authentication",
        // "aws_access_key",
        // "ssh_key",
        // "certificate_based_auth",
        // "oauth1",
        // "postgresql_md5",
        // "postgresql_scram_sha256",
        // "google_cloud_service_account",
        // "azure_ad",
        // "openid_connect",
        // "firebase_authentication",
        // "custom_auth",
        // "oauth2_device_flow",
        // "webhook_secret",
        // "ntlm",
        // "spiffe",
        // "yubikey",
        // "biometric_auth",
        // "federated_identity",
        // "htpasswd",
        // "windows_authentication",
        // "radius",
        // "two_factor_authentication",
        // "client_certificates",
        // "magic_link"
      ],
    },
    details: {
      type: 'object',
      description: 'Optional details for the app',
      properties: {
        location: {
          type: 'string',
          default: 'headers',
          enum: ['headers', 'query_params'],
          'x-conditional-render': {
            auth_type: 'api_key',
          },
        },
        name: {
          title: 'Name',
          type: 'string',
          'x-conditional-render': {
            auth_type: 'api_key',
          },
        },
        oauth_settings: {
          type: 'object',
          description: 'The configuration settings for OAuth authentication.',
          'x-conditional-render': {
            auth_type: 'oauth',
          },
          properties: {
            authorize_url: {
              type: 'string',
              title: 'Authorization URL',
              description: 'The URL for the OAuth authorization endpoint',
            },
            code_challenge_method: {
              type: 'string',
              title: 'Code Challenge Method',
              description: 'The method used for generating the code challenge (e.g., S256)',
            },
            grant_type: {
              type: 'string',
              title: 'Grant Type',
              description: 'The grant type for OAuth (e.g., authorization_code)',
            },
            response_type: {
              type: 'string',
              title: 'Response Type',
              description: 'The response type expected from the OAuth provider (usually "code")',
            },
            scope: {
              type: 'string',
              title: 'Scope',
              description: 'A space-separated list of permission scopes',
            },
            token_url: {
              type: 'string',
              title: 'Token URL',
              description: 'The URL for the OAuth token endpoint',
            },
          },
          required: ['authorize_url', 'response_type', 'token_url'],
        },
      },
    },
  },
  required: ['name', 'icon'],
};

function OverallConfig({ connectionType }) {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const defaultValues = useMemo(
    () => (!connectionType ? {} : getDefaultValues(OVERALL_CONFIG_SCHEMA, connectionType)),
    [connectionType],
  );

  const methods = useForm({ defaultValues });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const formattedData = formatData(data, OVERALL_CONFIG_SCHEMA.properties);
      dispatchWithFeedback(updateConnectionType(connectionType.id, formattedData), {
        useSnackbar: true,
        successMessage: 'Configuration updated successfully',
        errorMessage: 'Could not update configuration',
      });
    }),
    [connectionType.id, dispatchWithFeedback],
  );

  return (
    <FormProvider {...methods}>
      <div className="relative flex flex-col h-full dark:bg-black bg-white rounded-lg shadow-md overflow-y-auto ">
        {/* Header */}
        <div className="sticky top-0 z-[10] p-2 rounded-lg bg-white dark:bg-black flex-shrink-0 flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white text-gray-900">
            Overall Configuration
          </h2>
          <LoadingButton
            color="primary"
            variant="contained"
            loading={isSubmitting}
            onClick={onSubmit}
            disabled={!isDirty}
          >
            Save Changes
          </LoadingButton>
        </div>
        {/* Scrollable content */}
        <div className="relative -z-1 flex-1 min-h-0 p-4 space-y-">
          {Object.entries(OVERALL_CONFIG_SCHEMA.properties).map(([key, fieldSchema]) => {
            const required = OVERALL_CONFIG_SCHEMA.required.includes(key);
            return (
              <FormParameter
                key={key}
                fieldKey={key}
                schema={fieldSchema}
                required={required}
                enableLexical={false}
              />
            );
          })}
        </div>
      </div>
    </FormProvider>
  );
}

export default memo(OverallConfig);
