import { Code, Edit2, Loader2, Lock, MoreVertical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import ApiDocsViewer from './services/ApiDocsViewer';
import { CreateMCPDialog } from './services/CreateMCPDialog';
import { CreateSecretDialog } from './services/CreateSecretDialog';
import { CreateServiceDialog } from './services/CreateServiceDialog';
import { ViewServiceDialog } from './services/ViewServiceDialog';
import { useToast } from '../../../hooks/use-toast';
import { selectAccountId } from '../../../redux/slices/general/index.ts';
import {
  createOrUpdateSecret,
  createService,
  deleteSecret,
  deleteService,
  fetchSecrets,
  fetchServiceDetails,
  fetchServices,
  selectSecretsForBase,
  selectServicesForBase,
  updateServiceThunk,
} from '../../../redux/slices/services';
import { dispatch, useSelector } from '../../../redux/store.ts';
import { setSession } from '../../../utils/auth';
import { optimai_cloud, optimai_integration } from '../../../utils/axios';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import { Card, CardContent } from '../../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Input } from '../../ui/input';
import { Skeleton } from '../../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

function formatRelativeDate(value) {
  if (!value) return 'N/A';
  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hrs ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return 'N/A';
  }
}

const CloudServices = () => {
  const { cloudId } = useParams();
  const { toast } = useToast();

  const servicesState = useSelector((s) => selectServicesForBase(s, cloudId));
  const secretsState = useSelector((s) => selectSecretsForBase(s, cloudId));
  const accountId = useSelector(selectAccountId);

  const [activeTab, setActiveTab] = useState('api');
  const [query, setQuery] = useState('');

  // API docs
  const [cloudUrl, setCloudUrl] = useState(null);

  // MCP
  const [checkingMcp, setCheckingMcp] = useState(false);
  const [existingMcp, setExistingMcp] = useState(null);

  // Service dialogs
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewService, setViewService] = useState(null);
  const [viewServiceCode, setViewServiceCode] = useState('');
  const [viewLoading, setViewLoading] = useState(false);

  // Secret dialog
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null);

  // MCP dialog
  const [mcpDialogOpen, setMcpDialogOpen] = useState(false);

  const services = useMemo(() => servicesState.items || [], [servicesState.items]);
  const secrets = useMemo(() => secretsState.items || [], [secretsState.items]);

  // Load services/secrets
  useEffect(() => {
    if (!cloudId) return;
    dispatch(fetchServices(cloudId));
    dispatch(fetchSecrets(cloudId));
  }, [cloudId]);

  // Fetch cloud url
  useEffect(() => {
    const run = async () => {
      if (!cloudId) return;
      try {
        const authData = localStorage.getItem('oaiauth');
        if (authData) {
          try {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) setSession(accessToken, optimai_cloud);
          } catch {}
        }
        const res = await optimai_cloud.get(`/v1/instances/metrics/cloud/${cloudId}`);
        if (res.data?.cloud_url) {
          setCloudUrl(res.data.cloud_url);
        }
      } catch {}
    };
    run();
  }, [cloudId]);

  // MCP check
  useEffect(() => {
    const checkMcp = async () => {
      if (!cloudUrl || !accountId) return;
      setCheckingMcp(true);
      setExistingMcp(null);
      try {
        const authData = localStorage.getItem('oaiauth');
        if (authData) {
          try {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) setSession(accessToken, optimai_integration);
          } catch {}
        }
        const response = await optimai_integration.get('/connection-type/find', {
          params: {
            openapi_schema_url: `${cloudUrl}/services/openapi.json`,
            account_id: accountId,
            is_compact: true,
          },
        });
        if (response.data?.connection_type) setExistingMcp(response.data.connection_type);
      } catch {
        // fine if 404
      } finally {
        setCheckingMcp(false);
      }
    };
    checkMcp();
  }, [cloudUrl, accountId]);

  const filteredServices = useMemo(() => {
    if (!query) return services;
    const q = query.toLowerCase();
    return services.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q),
    );
  }, [services, query]);

  // Handlers
  const handleRefresh = useCallback(() => {
    if (!cloudId) return;
    if (activeTab === 'code') {
      dispatch(fetchServices(cloudId));
    } else if (activeTab === 'secrets') {
      dispatch(fetchSecrets(cloudId));
    }
  }, [cloudId, activeTab]);

  const openCreateService = () => {
    setEditingService(null);
    setServiceDialogOpen(true);
  };

  const openEditService = async (svc) => {
    try {
      const details = await dispatch(fetchServiceDetails(cloudId, svc.name));
      setEditingService({
        name: svc.name,
        description: svc.description || '',
        code: details?.code || '',
        requirements: details?.requirements || [],
      });
    } catch {
      setEditingService({
        name: svc.name,
        description: svc.description || '',
        code: '',
        requirements: [],
      });
    }
    setServiceDialogOpen(true);
  };

  const submitService = async (formData) => {
    try {
      if (editingService) {
        await dispatch(updateServiceThunk(cloudId, editingService.name, formData));
        toast({ title: 'Service updated', description: editingService.name });
      } else {
        await dispatch(createService(cloudId, formData));
        toast({ title: 'Service created', description: formData.name });
      }
    } catch (e) {
      toast({
        title: 'Operation failed',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
      throw e;
    }
  };

  const handleDeleteService = async (svc) => {
    try {
      await dispatch(deleteService(cloudId, svc.name));
      toast({ title: 'Service deleted', description: svc.name });
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const openViewService = async (svc) => {
    setViewService(svc);
    setViewDialogOpen(true);
    setViewLoading(true);
    try {
      const data = await dispatch(fetchServiceDetails(cloudId, svc.name));
      setViewServiceCode(data?.code || '');
    } catch {
      setViewServiceCode('');
    } finally {
      setViewLoading(false);
    }
  };

  const openCreateSecret = () => {
    setEditingSecret(null);
    setSecretDialogOpen(true);
  };

  const openEditSecret = (sec) => {
    setEditingSecret({
      key: sec.key,
      value: '',
      description: sec.description || '',
    });
    setSecretDialogOpen(true);
  };

  const submitSecret = async (formData) => {
    try {
      await dispatch(createOrUpdateSecret(cloudId, formData));
      toast({ title: 'Secret saved', description: formData.key });
    } catch (e) {
      toast({
        title: 'Failed to save secret',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
      throw e;
    }
  };

  const handleDeleteSecret = async (sec) => {
    try {
      await dispatch(deleteSecret(cloudId, sec.key));
      toast({ title: 'Secret deleted', description: sec.key });
    } catch (e) {
      toast({
        title: 'Failed to delete secret',
        description: e?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleMcpClick = () => {
    if (existingMcp) {
      toast({ title: 'MCP Connector', description: `"${existingMcp.name}" already exists` });
    } else {
      setMcpDialogOpen(true);
    }
  };

  const handleMcpSuccess = (message) => {
    toast({ title: 'Success', description: message });
    // Refresh MCP check
    if (cloudUrl && accountId) {
      setTimeout(async () => {
        try {
          const authData = localStorage.getItem('oaiauth');
          if (authData) {
            const { access_token: accessToken } = JSON.parse(authData);
            if (accessToken) setSession(accessToken, optimai_integration);
          }
          const response = await optimai_integration.get('/connection-type/find', {
            params: {
              openapi_schema_url: `${cloudUrl}/services/openapi.json`,
              account_id: accountId,
              is_compact: true,
            },
          });
          if (response.data?.connection_type) setExistingMcp(response.data.connection_type);
        } catch {
          // ignore
        }
      }, 1000);
    }
  };

  const handleMcpError = (message) => {
    toast({ title: 'Error', description: message, variant: 'destructive' });
  };

  // UI
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        <div className="font-semibold text-foreground">Services</div>
        <div className="ml-auto flex items-center gap-2">
          {existingMcp ? (
            <Button size="sm" className="h-8" onClick={handleMcpClick}>
              <Code className="h-4 w-4 mr-2" />
              View MCP
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={handleMcpClick}
              disabled={!cloudUrl || checkingMcp}
            >
              {checkingMcp ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Turn into MCP
            </Button>
          )}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleRefresh}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="api">API Overview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
          </TabsList>

          {/* API DOCS */}
          <TabsContent value="api" className="mt-0">
            {cloudUrl ? (
              <ApiDocsViewer cloudUrl={cloudUrl} />
            ) : (
              <div className="h-[500px] flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>

          {/* SERVICES */}
          <TabsContent value="code" className="mt-0 space-y-3">
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8" onClick={openCreateService}>
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
              <Input
                placeholder="Search by name or description"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-[280px] ml-auto"
              />
            </div>
            {servicesState.loading && services.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Mounted At</TableHead>
                        <TableHead>Requirements</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="py-8 text-center space-y-3">
                              <Code className="h-12 w-12 mx-auto text-muted-foreground/50" />
                              <p className="text-sm text-muted-foreground">
                                {query ? 'No services found' : 'No services yet'}
                              </p>
                              {!query && (
                                <Button size="sm" onClick={openCreateService}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Your First Service
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServices.map((svc) => (
                          <TableRow
                            key={svc.name}
                            className="cursor-pointer"
                            onClick={() => openEditService(svc)}
                          >
                            <TableCell className="font-medium font-mono text-sm">
                              {svc.name}
                            </TableCell>
                            <TableCell className="max-w-[320px] truncate text-muted-foreground">
                              {svc.description || '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {svc.mounted_at || '-'}
                            </TableCell>
                            <TableCell>
                              {svc.requirements?.length > 0 ? (
                                <Badge variant="secondary">{svc.requirements.length}</Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatRelativeDate(svc.created_at)}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openViewService(svc)}>
                                    <Code className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditService(svc)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteService(svc)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SECRETS */}
          <TabsContent value="secrets" className="mt-0 space-y-3">
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8" onClick={openCreateSecret}>
                <Plus className="h-4 w-4 mr-2" />
                Create Secret
              </Button>
            </div>
            {secretsState.loading && secrets.length === 0 ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {secrets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="py-8 text-center space-y-3">
                              <Lock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  No secrets configured
                                </p>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                  Secrets are encrypted environment variables accessible to your
                                  services
                                </p>
                              </div>
                              <Button size="sm" onClick={openCreateSecret}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Secret
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        secrets.map((sec) => (
                          <TableRow key={sec.key}>
                            <TableCell className="font-mono text-sm font-medium">
                              {sec.key}
                            </TableCell>
                            <TableCell className="max-w-[380px] truncate text-muted-foreground">
                              {sec.description || '-'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatRelativeDate(sec.created_at)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatRelativeDate(sec.updated_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditSecret(sec)}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteSecret(sec)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateServiceDialog
        open={serviceDialogOpen}
        onClose={() => setServiceDialogOpen(false)}
        onSubmit={submitService}
        editingService={editingService}
      />

      <ViewServiceDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        service={viewService}
        code={viewServiceCode}
        loading={viewLoading}
      />

      <CreateSecretDialog
        open={secretDialogOpen}
        onClose={() => setSecretDialogOpen(false)}
        onSubmit={submitSecret}
        editingSecret={editingSecret}
      />

      <CreateMCPDialog
        open={mcpDialogOpen}
        onClose={() => setMcpDialogOpen(false)}
        cloudUrl={cloudUrl}
        accountId={accountId}
        baseId={cloudId}
        onSuccess={handleMcpSuccess}
        onError={handleMcpError}
      />
    </div>
  );
};

export default CloudServices;
