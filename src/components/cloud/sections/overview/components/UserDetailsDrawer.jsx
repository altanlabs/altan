import { useState, useEffect } from 'react';
import { Copy, Mail, CheckCircle2, XCircle, Calendar, Clock, Shield, Key } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../../ui/sheet';
import { Button } from '../../../../ui/button.tsx';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Badge } from '../../../../ui/badge';
import { Separator } from '../../../../ui/separator';
import { ScrollArea } from '../../../../ui/scroll-area';
import { Switch } from '../../../../ui/switch';

function formatDate(value) {
  if (!value) return 'Never';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'Never';
    return d.toLocaleString();
  } catch {
    return 'Never';
  }
}

const UserDetailsDrawer = ({ user, open, onOpenChange, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    banned_until: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        role: user.role || 'authenticated',
        banned_until: user.banned_until || null,
      });
    }
  }, [user]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
    } catch {
      // no-op
    }
  };

  const handleSave = async () => {
    if (!user || !onSave) return;
    setSaving(true);
    try {
      await onSave(user.id, formData);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const isEmailVerified = !!user.email_confirmed_at;
  const isPhoneVerified = !!user.phone_confirmed_at;
  const isBanned = user.banned_until && new Date(user.banned_until) > new Date();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            {/* Verification Status */}
            <div>
              <h3 className="text-sm font-medium mb-3">Verification Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </div>
                  {isEmailVerified ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Phone</span>
                    </div>
                    {isPhoneVerified ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div>
              <h3 className="text-sm font-medium mb-3">Information</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={user.id} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(user.id)}
                      className="h-9 w-9 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {user.phone && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input 
                      value={user.phone} 
                      readOnly 
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Status */}
            <div>
              <h3 className="text-sm font-medium mb-3">Account Status</h3>
              <div className="space-y-3">
                {isBanned && (
                  <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/5">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Account Banned</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Until: {formatDate(user.banned_until)}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Anonymous User</Label>
                    <p className="text-xs text-muted-foreground">User signed in anonymously</p>
                  </div>
                  <Switch
                    checked={!!user.is_anonymous}
                    disabled
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">SSO User</Label>
                    <p className="text-xs text-muted-foreground">Single sign-on enabled</p>
                  </div>
                  <Switch
                    checked={!!user.is_sso_user}
                    disabled
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity */}
            <div>
              <h3 className="text-sm font-medium mb-3">Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last Sign In</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(user.last_sign_in_at)}</span>
                </div>

                {user.email_confirmed_at && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email Confirmed</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(user.email_confirmed_at)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            {user.raw_user_meta_data && Object.keys(user.raw_user_meta_data).length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3">User Metadata</h3>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(user.raw_user_meta_data, null, 2)}
                    </pre>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {user.raw_app_meta_data && Object.keys(user.raw_app_meta_data).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">App Metadata</h3>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(user.raw_app_meta_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserDetailsDrawer;

