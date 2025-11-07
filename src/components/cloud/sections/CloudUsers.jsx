import { MoreVertical, Trash2, RefreshCw, Copy, Mail, Chrome, Settings, CheckCircle2, XCircle } from 'lucide-react';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { fetchUsers, deleteUser, selectUsersForCloud } from '../../../redux/slices/cloud';
import { dispatch, useSelector } from '../../../redux/store';
import { setSession } from '../../../utils/auth';
import { optimai_cloud } from '../../../utils/axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Input } from '../../ui/input';
import { ScrollArea } from '../../ui/scroll-area';
import { Skeleton } from '../../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../elevenlabs/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import UserDetailsDrawer from './overview/components/UserDetailsDrawer';

function formatDate(value) {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  } catch {
    return '-';
  }
}

const CloudUsers = () => {
  const { cloudId } = useParams();
  const users = useSelector((state) => selectUsersForCloud(state, cloudId));
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [range, setRange] = useState('7d'); // '7d' | '30d' | '90d'
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('main'); // main | email | google
  const [authLoading, setAuthLoading] = useState(false);
  const [authSaving, setAuthSaving] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authConfig, setAuthConfig] = useState({
    mail: { host: '', port: '', user: '', password: '', admin_email: '' },
    google: { enabled: false, client_id: '', secret: '' },
    github: { enabled: false, client_id: '', secret: '' },
    facebook: { enabled: false, client_id: '', secret: '' },
    general: { disable_signup: false, site_url: '', jwt_expiry: '3600', auto_confirm: false },
  });

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    if (!cloudId) return;
    setLoading(true);
    dispatch(fetchUsers(cloudId))
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [cloudId]);

  const ensureAxiosAuth = useCallback(() => {
    try {
      const authData = localStorage.getItem('oaiauth');
      if (!authData) return;
      const { access_token: accessToken } = JSON.parse(authData);
      if (accessToken) setSession(accessToken, optimai_cloud);
    } catch {
      // ignore
    }
  }, []);

  const openAuth = useCallback(async () => {
    if (!cloudId) return;
    setAuthOpen(true);
    setAuthTab('main');
    setAuthLoading(true);
    setAuthError(null);
    try {
      ensureAxiosAuth();
      const res = await optimai_cloud.get(`/v1/instances/config/gotrue/${cloudId}`);
      if (res?.data) {
        setAuthConfig({
          mail: { host: '', port: '', user: '', password: '', admin_email: '', ...(res.data.mail || {}) },
          google: { enabled: false, client_id: '', secret: '', ...(res.data.google || {}) },
          github: { enabled: false, client_id: '', secret: '', ...(res.data.github || {}) },
          facebook: { enabled: false, client_id: '', secret: '', ...(res.data.facebook || {}) },
          general: { disable_signup: false, site_url: '', jwt_expiry: '3600', auto_confirm: false, ...(res.data.general || {}) },
        });
      }
    } catch (err) {
      setAuthError(err?.response?.data?.message || err?.message || 'Failed to load configuration');
    } finally {
      setAuthLoading(false);
    }
  }, [cloudId, ensureAxiosAuth]);

  const saveAuthConfig = useCallback(
    async (provider, data) => {
      if (!cloudId) return;
      setAuthSaving(true);
      setAuthError(null);
      try {
        ensureAxiosAuth();
        const nextConfig = { ...authConfig, [provider]: { ...authConfig[provider], ...data } };
        await optimai_cloud.put(`/v1/instances/config/gotrue/${cloudId}`, nextConfig);
        setAuthConfig(nextConfig);
      } catch (err) {
        setAuthError(err?.response?.data?.message || err?.message || 'Failed to save configuration');
      } finally {
        setAuthSaving(false);
      }
    },
    [cloudId, authConfig, ensureAxiosAuth],
  );

  const signupsData = useMemo(() => {
    const days =
      range === '90d' ? 90 : range === '30d' ? 30 : 7;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
    const byDay = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay.set(key, 0);
    }
    (users || []).forEach((u) => {
      const created = u.created_at || u.createdAt || u.date_created || u.signup_date;
      if (!created) return;
      const dayKey = new Date(created).toISOString().slice(0, 10);
      if (byDay.has(dayKey)) {
        byDay.set(dayKey, (byDay.get(dayKey) || 0) + 1);
      }
    });
    return Array.from(byDay.entries()).map(([key, value]) => {
      const d = new Date(key);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      return { date: label, signups: value };
    });
  }, [users, range]);

  const filtered = useMemo(() => {
    if (!Array.isArray(users)) return [];
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter((u) => {
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      return email.includes(q) || id.includes(q);
    });
  }, [users, query]);

  const handleRefresh = useCallback(() => {
    if (!cloudId) return;
    setLoading(true);
    dispatch(fetchUsers(cloudId))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cloudId]);

  const confirmDelete = useCallback(
    async (userId) => {
      if (!cloudId || !userId) return;
      setLoading(true);
      try {
        await dispatch(deleteUser(cloudId, userId));
      } finally {
        setLoading(false);
        setUserToDelete(null);
      }
    },
    [cloudId],
  );

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
    } catch {
      // no-op
    }
  }, []);

  const handleSaveUser = useCallback(async (userId, formData) => {
    // TODO: Implement user update API call
    console.log('Saving user:', userId, formData);
    // Example:
    // ensureAxiosAuth();
    // await optimai_cloud.put(`/v1/instances/${cloudId}/users/${userId}`, formData);
    // await dispatch(fetchUsers(cloudId));
  }, [cloudId]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        <div className="font-semibold text-foreground">Users</div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search by email or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 w-[260px]"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={openAuth}
          >
            <Settings className="h-4 w-4 mr-2" />
            Auth config
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {/* Signups chart */}
        <div className="p-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-base">Signups</CardTitle>
              <Tabs
                value={range}
                onValueChange={setRange}
              >
                <TabsList>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="90d">90d</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer
                config={{
                  signups: {
                    label: 'Signups',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-40 w-full"
              >
                <AreaChart data={signupsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    stroke="var(--color-signups)"
                    fill="var(--color-signups)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        {loading && (!users || users.length === 0) ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              No users found{query ? ' for this search' : ''}.
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36px]">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u, idx) => {
                  const email = u.email || u.raw_user_meta_data?.email || '-';
                  const isEmailVerified = !!u.email_confirmed_at;
                  const isPhoneVerified = !!u.phone_confirmed_at;
                  return (
                    <TableRow 
                      key={u.id || idx}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedUser(u)}
                    >
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <div className="font-medium">{email}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge
                                variant="secondary"
                                className="px-1 py-0 h-5"
                              >
                                ID
                              </Badge>
                              <button
                                className="hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(u.id);
                                }}
                                title="Copy user ID"
                              >
                                <span className="truncate max-w-[280px] align-middle">{u.id}</span>
                              </button>
                              <Copy className="h-3 w-3 opacity-60" />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isEmailVerified ? (
                            <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(u.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserToDelete(u);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the user and their access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete(userToDelete?.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
        onSave={handleSaveUser}
      />

      {/* Auth configuration dialog */}
      <Dialog
        open={authOpen}
        onOpenChange={setAuthOpen}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="border-b px-6 py-4">
            <DialogTitle>Authentication</DialogTitle>
            {authError && <p className="text-xs text-destructive mt-1">{authError}</p>}
          </div>
          <div className="p-6">
            {authLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <Tabs
                  value={authTab}
                  onValueChange={setAuthTab}
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="main">General</TabsTrigger>
                    <TabsTrigger
                      value="email"
                      className="flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> Email
                    </TabsTrigger>
                    <TabsTrigger
                      value="google"
                      className="flex items-center gap-1"
                    >
                      <Chrome className="h-3 w-3" /> Google
                    </TabsTrigger>
                  </TabsList>

                  {/* General */}
                  <TabsContent
                    value="main"
                    className="mt-0"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Disable sign‑up</Label>
                          <p className="text-xs text-muted-foreground">
                            Prevent new users from signing up
                          </p>
                        </div>
                        <Switch
                          checked={!!authConfig.general?.disable_signup}
                          onCheckedChange={(v) =>
                            setAuthConfig((p) => ({
                              ...p,
                              general: { ...p.general, disable_signup: v },
                            }))
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Auto confirm email</Label>
                          <p className="text-xs text-muted-foreground">
                            Skip email confirmation step
                          </p>
                        </div>
                        <Switch
                          checked={!!authConfig.general?.auto_confirm}
                          onCheckedChange={(v) =>
                            setAuthConfig((p) => ({
                              ...p,
                              general: { ...p.general, auto_confirm: v },
                            }))
                          }
                        />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-sm">Site URL</Label>
                          <Input
                            placeholder="https://your-site.com"
                            value={authConfig.general?.site_url || ''}
                            onChange={(e) =>
                              setAuthConfig((p) => ({
                                ...p,
                                general: { ...p.general, site_url: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">JWT Expiry (seconds)</Label>
                          <Input
                            type="number"
                            value={authConfig.general?.jwt_expiry || '3600'}
                            onChange={(e) =>
                              setAuthConfig((p) => ({
                                ...p,
                                general: { ...p.general, jwt_expiry: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          disabled={authSaving}
                          onClick={() => saveAuthConfig('general', authConfig.general)}
                        >
                          {authSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Email */}
                  <TabsContent
                    value="email"
                    className="mt-0"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label className="text-sm">SMTP Host</Label>
                        <Input
                          placeholder="smtp.example.com"
                          value={authConfig.mail?.host || ''}
                          onChange={(e) =>
                            setAuthConfig((p) => ({
                              ...p,
                              mail: { ...p.mail, host: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">SMTP Port</Label>
                        <Input
                          placeholder="587"
                          value={authConfig.mail?.port || ''}
                          onChange={(e) =>
                            setAuthConfig((p) => ({
                              ...p,
                              mail: { ...p.mail, port: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">SMTP User</Label>
                        <Input
                          placeholder="notifications@example.com"
                          value={authConfig.mail?.user || ''}
                          onChange={(e) =>
                            setAuthConfig((p) => ({
                              ...p,
                              mail: { ...p.mail, user: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">SMTP Password</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={authConfig.mail?.password || ''}
                          onChange={(e) =>
                            setAuthConfig((p) => ({
                              ...p,
                              mail: { ...p.mail, password: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Admin Email</Label>
                        <Input
                          placeholder="admin@example.com"
                          value={authConfig.mail?.admin_email || ''}
                          onChange={(e) =>
                            setAuthConfig((p) => ({
                              ...p,
                              mail: { ...p.mail, admin_email: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button
                        disabled={authSaving}
                        onClick={() => saveAuthConfig('mail', authConfig.mail)}
                      >
                        {authSaving ? 'Saving…' : 'Save email settings'}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Google */}
                  <TabsContent
                    value="google"
                    className="mt-0"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Enable Google sign‑in</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow users to sign in with Google
                          </p>
                        </div>
                        <Switch
                          checked={!!authConfig.google?.enabled}
                          onCheckedChange={(v) =>
                            setAuthConfig((p) => ({ ...p, google: { ...p.google, enabled: v } }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-sm">Client ID</Label>
                          <Input
                            placeholder="123456789-abc.apps.googleusercontent.com"
                            value={authConfig.google?.client_id || ''}
                            onChange={(e) =>
                              setAuthConfig((p) => ({
                                ...p,
                                google: { ...p.google, client_id: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">Client Secret</Label>
                          <Input
                            type="password"
                            placeholder="•••"
                            value={authConfig.google?.secret || ''}
                            onChange={(e) =>
                              setAuthConfig((p) => ({
                                ...p,
                                google: { ...p.google, secret: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">Callback URL</Label>
                          <Input
                            readOnly
                            value={`${authConfig.general?.site_url || ''}/auth/v1/callback`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          disabled={authSaving}
                          onClick={() => saveAuthConfig('google', authConfig.google)}
                        >
                          {authSaving ? 'Saving…' : 'Save Google settings'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
          <div className="border-t px-6 py-3 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setAuthOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CloudUsers;