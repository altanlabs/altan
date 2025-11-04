import { m, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

import { setSession } from '../../../../../utils/auth';
import { optimai_integration } from '../../../../../utils/axios';

const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'oauth1', label: 'OAuth 1.0' },
  { value: 'basic_auth', label: 'Basic Auth' },
  { value: 'bearer_token', label: 'Bearer Token' },
  { value: 'jwt', label: 'JWT' },
  { value: 'personal_access_token', label: 'Personal Access Token' },
  { value: 'service_account', label: 'Service Account' },
  { value: 'database_credentials', label: 'Database Credentials' },
  { value: 'custom_auth', label: 'Custom Auth' },
  { value: 'facebook_oauth', label: 'Facebook OAuth' },
  { value: 'google_cloud_service_account', label: 'Google Cloud Service Account' },
  { value: 'azure_ad', label: 'Azure AD' },
  { value: 'openid_connect', label: 'OpenID Connect' },
  { value: 'firebase_authentication', label: 'Firebase Authentication' },
  { value: 'oauth2_device_flow', label: 'OAuth2 Device Flow' },
  { value: 'webhook_secret', label: 'Webhook Secret' },
  { value: 'aws_access_key', label: 'AWS Access Key' },
  { value: 'iam_aws', label: 'IAM AWS' },
  { value: 'ssh_key', label: 'SSH Key' },
  { value: 'certificate_based_auth', label: 'Certificate Based Auth' },
  { value: 'x509_certificate', label: 'X.509 Certificate' },
  { value: 'client_certificates', label: 'Client Certificates' },
  { value: 'ldap', label: 'LDAP' },
  { value: 'saml', label: 'SAML' },
  { value: 'kerberos', label: 'Kerberos' },
  { value: 'scram', label: 'SCRAM' },
  { value: 'sasl', label: 'SASL' },
  { value: 'session_token', label: 'Session Token' },
  { value: 'gssapi', label: 'GSSAPI' },
  { value: 'token_based_auth', label: 'Token Based Auth' },
  { value: 'multi_factor_authentication', label: 'Multi-Factor Authentication' },
  { value: 'two_factor_authentication', label: 'Two-Factor Authentication' },
  { value: 'ntlm', label: 'NTLM' },
  { value: 'spiffe', label: 'SPIFFE' },
  { value: 'yubikey', label: 'YubiKey' },
  { value: 'biometric_auth', label: 'Biometric Auth' },
  { value: 'federated_identity', label: 'Federated Identity' },
  { value: 'htpasswd', label: 'htpasswd' },
  { value: 'windows_authentication', label: 'Windows Authentication' },
  { value: 'radius', label: 'RADIUS' },
  { value: 'magic_link', label: 'Magic Link' },
  { value: 'postgresql_md5', label: 'PostgreSQL MD5' },
  { value: 'postgresql_scram_sha256', label: 'PostgreSQL SCRAM-SHA-256' },
];

const CreateMCPAppDrawer = ({ open, onClose, cloudUrl, accountId, baseId, onSuccess, onError }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [authType, setAuthType] = useState('none');
  const [details, setDetails] = useState('{}');
  const [creating, setCreating] = useState(false);

  const handleClose = () => {
    setName('');
    setDescription('');
    setIcon('');
    setAuthType('none');
    setDetails('{}');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      onError('Please enter a name for the MCP app');
      return;
    }

    if (!cloudUrl) {
      onError('Cloud URL not available. Please wait for the API to load.');
      return;
    }

    // Validate JSON details
    let parsedDetails = {};
    if (details.trim()) {
      try {
        parsedDetails = JSON.parse(details);
      } catch {
        onError('Invalid JSON in details field');
        return;
      }
    }

    setCreating(true);

    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_integration);
          }
        } catch {
          // Ignore parse errors
        }
      }

      const openapiUrl = `${cloudUrl}/services/openapi.json`;

      await optimai_integration.post(
        `/account/${accountId}/mcp-app`,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          auth_type: authType,
          details: parsedDetails,
          openapi_schema_url: openapiUrl,
        },
        {
          params: {
            cloud_id: baseId,
          },
        }
      );

      onSuccess('MCP app created successfully!');
      handleClose();
    } catch (error) {
      onError(error.response?.data?.message || error.message || 'Failed to create MCP app');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300]"
          />

          {/* Drawer */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl z-[1400] overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Create MCP App
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    disabled={creating}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="flex-1 px-6 py-6">
                <div className="space-y-6 max-w-xl">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter MCP app name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                      autoFocus
                      disabled={creating}
                    />
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      A descriptive name for your MCP app
                    </p>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter MCP app description (optional)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      disabled={creating}
                    />
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Describe what this MCP app does
                    </p>
                  </div>

                  {/* Icon Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Icon URL
                    </label>
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="https://example.com/icon.png"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      disabled={creating}
                    />
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Public URL of the app icon (optional)
                    </p>
                  </div>

                  {/* Authentication Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Authentication Type
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      disabled={creating}
                    >
                      {AUTH_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Details JSON with Monaco Editor */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Details (JSON)
                    </label>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Editor
                        height="200px"
                        defaultLanguage="json"
                        value={details}
                        onChange={(value) => setDetails(value || '{}')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 2,
                          readOnly: creating,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Optional JSON object with additional configuration details
                    </p>
                  </div>

                  {/* OpenAPI URL Info */}
                  {cloudUrl && (
                    <div className="rounded-lg bg-muted/50 p-4 border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        OpenAPI Schema URL:
                      </p>
                      <p className="text-sm font-mono text-foreground break-all">
                        {cloudUrl}/services/openapi.json
                      </p>
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-4">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={creating}
                    className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={creating || !name.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create MCP App
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateMCPAppDrawer;

