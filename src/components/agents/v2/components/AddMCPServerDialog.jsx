import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2, Search, X, ArrowRight, PlusCircle, ExternalLink, Server } from 'lucide-react';

import {
  selectAccountConnectionsByType,
  getConnections,
} from '../../../../redux/slices/connections';
import { selectAccount } from '../../../../redux/slices/general';
import { optimai, optimai_integration } from '../../../../utils/axios';
import Iconify from '../../../iconify';
import IconRenderer from '../../../icons/IconRenderer';
import ConnectionCreator from '../../../tools/ConnectionCreator';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../../ui/sheet';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Badge } from '../../../ui/badge';
import { Skeleton } from '../../../ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Label } from '../../../ui/label';
import { Separator } from '../../../ui/separator';
import { cn } from '../../../../lib/utils';

function AddMCPServerDrawer({ open, onClose, accountServers, onConnect, onCreateNew, agentId }) {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);
  const [searchTerm, setSearchTerm] = useState('');
  const [mcpConnectionTypes, setMcpConnectionTypes] = useState([]);
  const [mcpAccountConnections, setMcpAccountConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccountConnections, setLoadingAccountConnections] = useState(false);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedConnectionType, setSelectedConnectionType] = useState(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [creatingMCPServer, setCreatingMCPServer] = useState(false);
  const [linkingServerId, setLinkingServerId] = useState(null);

  // Fetch MCP-compatible connection types
  useEffect(() => {
    if (open) {
      setLoading(true);
      setSearchTerm('');
      optimai_integration
        .get('/connection-type/all', {
          params: {
            is_mcp: true,
            is_compact: false,
            account_id: account?.id,
          },
        })
        .then((response) => {
          const { items } = response.data;
          setMcpConnectionTypes(items || []);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch MCP connection types:', error);
          setMcpConnectionTypes([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Create a map of connection types for quick lookup
  const connectionTypeMap = useMemo(() => {
    const map = {};
    mcpConnectionTypes.forEach((type) => {
      map[type.id] = type;
    });
    return map;
  }, [mcpConnectionTypes]);

  // Get existing connections for the selected connection type
  const existingConnections = useSelector(
    selectedConnectionType ? selectAccountConnectionsByType(selectedConnectionType.id) : () => null,
  );

  const handleConnectionTypeClick = (connType) => {
    setSelectedConnectionType(connType);
    setSelectedConnectionId(null);
  };

  const handleCloseConnectionDialog = () => {
    setSelectedConnectionType(null);
    setSelectedConnectionId(null);
  };

  const handleConfirmConnection = async () => {
    if (!selectedConnectionId) return;

    setCreatingMCPServer(true);
    try {
      const response = await optimai.post(
        '/mcp/servers/from-connection',
        {
          connection_id: selectedConnectionId,
        },
        {
          params: agentId ? { agent_id: agentId } : {},
        },
      );

      // eslint-disable-next-line no-console
      console.log('MCP server created:', response.data);

      // Close the connection dialog
      handleCloseConnectionDialog();

      // Close the main drawer
      onClose();

      // Optionally call onConnect callback if needed for parent refresh
      if (onConnect) {
        onConnect(response.data.mcp_server?.id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create MCP server from connection:', error);
      // TODO: Show error notification to user
    } finally {
      setCreatingMCPServer(false);
    }
  };

  const handleLinkExistingServer = async (serverId) => {
    if (!agentId) return;

    setLinkingServerId(serverId);
    try {
      await optimai.post(`/mcp/servers/${serverId}/connect-agent/${agentId}`, {
        access_level: 'user',
      });

      // eslint-disable-next-line no-console
      console.log('Linked MCP server to agent:', serverId);

      // Close the main drawer
      onClose();

      // Refresh the parent list
      if (onConnect) {
        onConnect(serverId);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to link MCP server to agent:', error);
      // TODO: Show error notification to user
    } finally {
      setLinkingServerId(null);
    }
  };

  // Filter connection types and account servers based on search term
  const filteredConnectionTypes = useMemo(() => {
    if (!searchTerm.trim()) return mcpConnectionTypes;
    const lower = searchTerm.toLowerCase();
    return mcpConnectionTypes.filter(
      (type) =>
        type.name?.toLowerCase().includes(lower) || type.description?.toLowerCase().includes(lower),
    );
  }, [mcpConnectionTypes, searchTerm]);

  const filteredAccountServers = useMemo(() => {
    if (!searchTerm.trim()) return accountServers;
    const lower = searchTerm.toLowerCase();
    return accountServers.filter(
      (server) =>
        server.name?.toLowerCase().includes(lower) || server.url?.toLowerCase().includes(lower),
    );
  }, [accountServers, searchTerm]);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-xl font-semibold">Add MCP Server</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Connect to MCP-compatible services
            </SheetDescription>
          </SheetHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="available" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-semibold"
                >
                  Available Services
                </TabsTrigger>
                <TabsTrigger 
                  value="yours" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 font-semibold"
                >
                  Your Servers {filteredAccountServers.length > 0 && `(${filteredAccountServers.length})`}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="p-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'available' ? 'Search available services...' : 'Search your servers...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Content */}
            <TabsContent value="available" className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar mt-0">
              {/* New Custom MCP Server Button - Always at top */}
              <div
                onClick={onCreateNew}
                className="flex items-center gap-3 p-4 border-2 border-dashed rounded-xl bg-muted/20 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-0.5">
                    New Custom MCP Server
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connect to your own MCP server
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Section Header */}
              {!loading && (filteredConnectionTypes.length > 0 || searchTerm) && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Altan Hosted MCPs
                    </div>
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <a
                        href="https://github.com/modelcontextprotocol/servers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                      >
                        Find more
                      </a>
                    </div>
                  </div>
                </>
              )}

              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-[72px] w-full rounded-xl"
                    />
                  ))}
                </div>
              ) : filteredConnectionTypes.length > 0 ? (
                filteredConnectionTypes.map((connType) => (
                  <div
                    key={connType.id}
                    onClick={() => handleConnectionTypeClick(connType)}
                    className="flex items-center gap-3 p-4 border rounded-xl bg-card transition-all cursor-pointer hover:bg-primary/5 hover:border-primary"
                  >
                    {/* Connection Type Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 flex-shrink-0">
                      <IconRenderer
                        icon={connType.icon || 'mdi:server'}
                        size={40}
                        color={connType.meta_data?.color}
                      />
                    </div>

                    {/* Connection Type Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-sm">
                          {connType.name}
                        </div>
                        {connType.is_official && (
                          <Badge variant="default" className="h-4 text-[10px] px-2 py-0">
                            Official
                          </Badge>
                        )}
                      </div>
                      {connType.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {connType.description}
                        </div>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))
              ) : searchTerm ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <div className="text-sm text-muted-foreground mb-1">
                    No MCP services found
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    Try a different search term
                  </div>
                </div>
              ) : null}
            </TabsContent>

            {/* Tab 1: Your MCP Servers */}
            <TabsContent value="yours" className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 no-scrollbar mt-0">
              {filteredAccountServers.length > 0 ? (
                filteredAccountServers.map((server) => {
                  const connType = server.connection_type
                    ? connectionTypeMap[server.connection_type]
                    : null;
                  return (
                    <div
                      key={server.id}
                      className="flex items-center gap-3 p-4 border rounded-xl bg-card transition-all hover:bg-primary/5 hover:border-primary"
                    >
                      {/* Server Icon */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 flex-shrink-0">
                        <IconRenderer
                          icon={server.meta_data?.icon || connType?.icon || 'mdi:server'}
                          size={20}
                          color={connType?.meta_data?.color}
                        />
                      </div>

                      {/* Server Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm mb-0.5">
                          {server.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {server.url}
                        </div>
                      </div>

                      {/* Link Button */}
                      <Button
                        size="sm"
                        onClick={() => handleLinkExistingServer(server.id)}
                        disabled={linkingServerId === server.id}
                        className="min-w-[80px]"
                      >
                        {linkingServerId === server.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Link'
                        )}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <div className="text-sm text-muted-foreground mb-1">
                    No MCP servers found
                  </div>
                  <div className="text-xs text-muted-foreground/70">
                    {searchTerm ? 'Try a different search' : 'Create one to get started'}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Connection Selection Dialog */}
      <Dialog open={!!selectedConnectionType} onOpenChange={(open) => !open && handleCloseConnectionDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <IconRenderer
                  icon={selectedConnectionType?.icon || 'mdi:server'}
                  size={40}
                  color={selectedConnectionType?.meta_data?.color}
                />
              </div>
              <div>
                <DialogTitle className="text-lg">Connect {selectedConnectionType?.name}</DialogTitle>
                <div className="text-xs text-muted-foreground">
                  Select or create a connection
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing Connections */}
            {existingConnections && existingConnections.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Your Connections</h4>
                <RadioGroup
                  value={selectedConnectionId || ''}
                  onValueChange={(value) => setSelectedConnectionId(value)}
                  className="space-y-2"
                >
                  {existingConnections.map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnectionId(conn.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:bg-primary/5",
                        selectedConnectionId === conn.id && "bg-primary/5 border-primary"
                      )}
                    >
                      <RadioGroupItem value={conn.id} id={conn.id} className="mt-0.5" />
                      <Label htmlFor={conn.id} className="flex-1 cursor-pointer">
                        <div className="font-semibold text-sm">{conn.name}</div>
                        {conn.details?.url && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {conn.details.url}
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Create New Connection - Always visible */}
            {selectedConnectionType && (
              <div>
                {existingConnections && existingConnections.length > 0 && (
                  <h4 className="text-sm font-semibold mb-3">Create New Connection</h4>
                )}
                <ConnectionCreator
                  connectionType={selectedConnectionType}
                  setIsCreatingNewConnection={async (value) => {
                    if (!value) {
                      // Connection was created or dialog closed
                      // eslint-disable-next-line no-console
                      console.log('🔄 Connection creator closed, refreshing connections...');
                      // Refresh connections list
                      if (account?.id) {
                        // eslint-disable-next-line no-console
                        console.log('Fetching connections for account:', account.id);
                        await dispatch(getConnections(account.id, true)); // Force refresh

                        // Small delay to ensure Redux state is updated
                        setTimeout(() => {
                          // Auto-select the newest connection of this type
                          const updatedConnections = existingConnections;
                          // eslint-disable-next-line no-console
                          console.log('Updated connections after refresh:', updatedConnections);
                          if (updatedConnections && updatedConnections.length > 0) {
                            // Get the most recently created connection
                            const newest = [...updatedConnections].sort(
                              (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
                            )[0];
                            // eslint-disable-next-line no-console
                            console.log('Auto-selecting newest connection:', newest);
                            if (newest) {
                              setSelectedConnectionId(newest.id);
                            }
                          }
                        }, 500);
                      }
                    }
                  }}
                  disableClose={false}
                  popup={false}
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCloseConnectionDialog}
              disabled={creatingMCPServer}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmConnection}
              disabled={!selectedConnectionId || creatingMCPServer}
            >
              {creatingMCPServer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Connect to Agent'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

AddMCPServerDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountServers: PropTypes.array.isRequired,
  onConnect: PropTypes.func,
  onCreateNew: PropTypes.func.isRequired,
  agentId: PropTypes.string,
};

export default AddMCPServerDrawer;
