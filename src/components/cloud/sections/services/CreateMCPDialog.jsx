import Editor from '@monaco-editor/react';
import { Loader2, Plus } from 'lucide-react';
import React, { useState } from 'react';

import { setSession } from '../../../../utils/auth';
import { optimai_integration } from '../../../../utils/axios';
import { Button } from '../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';

const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'bearer_token', label: 'Bearer Token' },
  { value: 'basic_auth', label: 'Basic Auth' },
  { value: 'jwt', label: 'JWT' },
];

export const CreateMCPDialog = ({ open, onClose, cloudUrl, accountId, baseId, onSuccess, onError }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [authType, setAuthType] = useState('none');
  const [details, setDetails] = useState('{}');
  const [creating, setCreating] = useState(false);

  const handleClose = () => {
    if (!creating) {
      setName('');
      setDescription('');
      setIcon('');
      setAuthType('none');
      setDetails('{}');
      onClose();
    }
  };

  const handleSubmit = async () => {
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh]">
        <div className="border-b px-6 py-4">
          <DialogTitle>Create MCP App</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Turn your services into an MCP connector for AI agents
          </p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <Label className="text-sm">Name *</Label>
            <Input
              placeholder="My Database MCP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              A descriptive name for your MCP app
            </p>
          </div>

          <div>
            <Label className="text-sm">Description</Label>
            <Textarea
              placeholder="What does this MCP app do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              rows={3}
            />
          </div>

          <div>
            <Label className="text-sm">Icon URL</Label>
            <Input
              type="url"
              placeholder="https://example.com/icon.png"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Public URL of the app icon (optional)
            </p>
          </div>

          <div>
            <Label className="text-sm">Authentication Type</Label>
            <Select value={authType} onValueChange={setAuthType} disabled={creating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTH_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">Details (JSON)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Optional JSON object with additional configuration
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <Editor
                height="180px"
                defaultLanguage="json"
                value={details}
                onChange={(value) => setDetails(value || '{}')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  readOnly: creating,
                }}
              />
            </div>
          </div>

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
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating || !name.trim()}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create MCP App
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

