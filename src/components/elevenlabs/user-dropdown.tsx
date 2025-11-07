/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/await-thenable */
/* global console */

import { Icon } from '@iconify/react';
import { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

// @ts-expect-error - JS file without type definitions
import { useAuthContext } from '../../auth/useAuthContext';
import { cn } from '../../lib/utils';
// @ts-expect-error - JS file without type definitions
import { useLocales } from '../../locales';
// @ts-expect-error - JS file without type definitions
import { useHermesWebSocket } from '../../providers/websocket/HermesWebSocketProvider';
// @ts-expect-error - JS file without type definitions
import { selectAccount, selectAccountCreditBalance, selectAccountSubscriptions } from '../../redux/slices/general';
// @ts-expect-error - JS file without type definitions
import { updateEntry } from '../../redux/slices/superadmin';
// @ts-expect-error - JS file without type definitions
import { useDispatch, useSelector } from '../../redux/store';
// @ts-expect-error - JS file without type definitions
import { useSnackbar } from '../snackbar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
// @ts-expect-error - JS file without type definitions
import UpgradeButton from '../UpgradeButton';

// Format credit count for display
const formatCredits = (credits: number) => {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(1)}M`;
  } else if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`;
  }
  return credits.toString();
};

export const UserDropdown = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const ws = useHermesWebSocket();
  const { user, logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { currentLang, onChangeLang, allLangs } = useLocales();
  
  const [superAdminExpanded, setSuperAdminExpanded] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<string | null>(null);
  const [editingAccountCredit, setEditingAccountCredit] = useState(false);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  const activeSubscriptions = useSelector(selectAccountSubscriptions);
  const accountCreditBalance = useSelector(selectAccountCreditBalance);
  const account = useSelector(selectAccount);

  const handleLogout = useCallback(async () => {
    try {
      logout();
      history.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  }, [enqueueSnackbar, logout, history]);

  const handleProfile = () => {
    history.push('/me');
  };

  const handleSettings = () => {
    history.push('/account/settings');
  };

  const handleIntegration = () => {
    history.push('/integration');
  };

  const handleUsage = () => {
    history.push('/usage');
  };

  const handleUpdateSubscriptionStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      await dispatch(updateEntry('Subscription', subscriptionId, { status: newStatus }));
      enqueueSnackbar('Subscription status updated successfully', { variant: 'success' });
      setEditingSubscription(null);
    } catch (error) {
      enqueueSnackbar(`Failed to update subscription: ${error}`, { variant: 'error' });
    }
  };

  const handleUpdateSubscriptionCredits = async (subscriptionId: string, newCredits: string) => {
    try {
      const creditsInCents = Math.round(parseFloat(newCredits) * 100);
      await dispatch(updateEntry('Subscription', subscriptionId, { credit_balance: creditsInCents }));
      enqueueSnackbar('Subscription credits updated successfully', { variant: 'success' });
      setEditingSubscription(null);
      setTempValues({});
    } catch (error) {
      enqueueSnackbar(`Failed to update credits: ${error}`, { variant: 'error' });
    }
  };

  const handleUpdateAccountCredit = async (accountId: string, newCredits: string) => {
    try {
      const creditsInCents = Math.round(parseFloat(newCredits) * 100);
      await dispatch(updateEntry('Account', accountId, { credit_balance: creditsInCents }));
      enqueueSnackbar('Account credit balance updated successfully', { variant: 'success' });
      setEditingAccountCredit(false);
      setTempValues({});
    } catch (error) {
      enqueueSnackbar(`Failed to update account credit: ${error}`, { variant: 'error' });
    }
  };

  const personProfile = useMemo(
    () => ({
      avatar: {
        url: user?.avatar_url,
        alt: user?.user_name,
      },
      name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      email: user?.email,
      initials: `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U',
    }),
    [user?.avatar_url, user?.email, user?.first_name, user?.last_name, user?.user_name]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative outline-none focus:outline-none">
          <Avatar className="cursor-pointer size-8 border border-white dark:border-gray-700 transition-transform hover:scale-110">
            <AvatarImage
              src={personProfile.avatar.url}
              alt={personProfile.avatar.alt}
            />
            <AvatarFallback>{personProfile.initials}</AvatarFallback>
          </Avatar>
          {!!(user?.xsup && ws?.activeSubscriptions?.length) && (
            <div className="absolute -bottom-0.5 -left-0.5 size-2.5 bg-blue-500 rounded-full border border-white dark:border-gray-900" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          'no-scrollbar rounded-2xl bg-gray-50 dark:bg-black/90 p-0',
          superAdminExpanded && user?.xsup ? 'w-[660px]' : 'w-[310px]',
        )}
        align="end"
      >
        <div className="flex">
          {/* SuperAdmin Panel (Left Side) */}
          {user?.xsup && superAdminExpanded && (
            <div className="w-[350px] border-r border-gray-200 dark:border-gray-700/20 p-3 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Icon
                  icon="solar:lock-keyhole-bold-duotone"
                  className="size-4 text-blue-600"
                />
                SuperAdmin Details
              </h3>

              {/* Account Information */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">Account</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Account ID
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-right break-all flex-1">
                      {account?.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Account Name
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 text-right break-all flex-1">
                      {account?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Stripe ID
                    </span>
                    {account?.stripe_id ? (
                      <a
                        href={`https://dashboard.stripe.com/customers/${account.stripe_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-mono text-right break-all flex-1 hover:underline"
                      >
                        {account.stripe_id} ↗
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-mono text-right flex-1">
                        N/A
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Credit Balance
                    </span>
                    {editingAccountCredit ? (
                      <div className="flex items-center gap-1 flex-1 justify-end">
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            tempValues.accountCredit ??
                            ((accountCreditBalance ?? 0) / 100).toFixed(2)
                          }
                          onChange={(e) =>
                            setTempValues({ ...tempValues, accountCredit: e.target.value })
                          }
                          className="w-20 h-6 text-xs"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleUpdateAccountCredit(account?.id, tempValues.accountCredit)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Icon
                            icon="mdi:check"
                            className="size-4 text-green-600"
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingAccountCredit(false);
                            setTempValues({ ...tempValues, accountCredit: undefined });
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Icon
                            icon="mdi:close"
                            className="size-4 text-red-600"
                          />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 flex-1 justify-end">
                        <span className="text-gray-900 dark:text-gray-100">
                          {formatCredits(accountCreditBalance ?? 0)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingAccountCredit(true)}
                          className="h-6 w-6 p-0"
                        >
                          <Icon
                            icon="mdi:pencil"
                            className="size-3.5"
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Organisation ID
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-right break-all flex-1">
                      {account?.organisation_id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Organisation
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 text-right break-all flex-1">
                      {account?.organisation?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  User (Account Owner)
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      User ID
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-right break-all flex-1">
                      {account?.owner?.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Email
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 text-right break-all flex-1">
                      {account?.owner?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                      Name
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 text-right break-all flex-1">
                      {account?.owner?.first_name} {account?.owner?.last_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscriptions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Subscriptions ({activeSubscriptions?.length || 0})
                </h4>
                {activeSubscriptions && activeSubscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {[...activeSubscriptions]
                      .sort(
                        (a, b) =>
                          new Date(b.date_creation || 0).getTime() -
                          new Date(a.date_creation || 0).getTime(),
                      )
                      .map((sub: any, idx: number) => (
                        <div
                          key={sub.id || idx}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50 space-y-1.5"
                        >
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Sub ID
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono text-right break-all flex-1 text-[10px]">
                              {sub.id}
                            </span>
                          </div>
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Status
                            </span>
                            {editingSubscription === sub.id ? (
                              <div className="flex items-center gap-1">
                                <Select
                                  value={tempValues[`${sub.id}_status`] ?? sub.status}
                                  onValueChange={(value) =>
                                    setTempValues({ ...tempValues, [`${sub.id}_status`]: value })
                                  }
                                >
                                  <SelectTrigger className="h-6 w-24 text-[10px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">active</SelectItem>
                                    <SelectItem value="inactive">inactive</SelectItem>
                                    <SelectItem value="trialing">trialing</SelectItem>
                                    <SelectItem value="paused">paused</SelectItem>
                                    <SelectItem value="cancelled">cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleUpdateSubscriptionStatus(
                                      sub.id,
                                      tempValues[`${sub.id}_status`] ?? sub.status,
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Icon
                                    icon="mdi:check"
                                    className="size-3.5 text-green-600"
                                  />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingSubscription(null);
                                    setTempValues({
                                      ...tempValues,
                                      [`${sub.id}_status`]: undefined,
                                    });
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Icon
                                    icon="mdi:close"
                                    className="size-3.5 text-red-600"
                                  />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={sub.status === 'active' ? 'default' : 'secondary'}
                                  className="h-5 text-[10px]"
                                >
                                  {sub.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingSubscription(sub.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Icon
                                    icon="mdi:pencil"
                                    className="size-3"
                                  />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Plan
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                              {sub.meta_data?.custom_subscription
                                ? sub.meta_data?.plan_name || 'Custom'
                                : sub.billing_option?.plan?.name || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Credits (Rem)
                            </span>
                            {editingSubscription === sub.id ? (
                              <div className="flex items-center gap-1 flex-1 justify-end">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    tempValues[`${sub.id}_credits`] ??
                                    Number(sub.credit_balance / 100 || 0).toFixed(2)
                                  }
                                  onChange={(e) =>
                                    setTempValues({
                                      ...tempValues,
                                      [`${sub.id}_credits`]: e.target.value,
                                    })
                                  }
                                  className="w-16 h-6 text-[10px]"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleUpdateSubscriptionCredits(
                                      sub.id,
                                      tempValues[`${sub.id}_credits`],
                                    )
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Icon
                                    icon="mdi:check"
                                    className="size-3.5 text-green-600"
                                  />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                                {formatCredits(Number(sub.credit_balance || 0))} /{' '}
                                {sub.meta_data?.custom_subscription
                                  ? formatCredits(Number(sub.meta_data?.total_credits || 0))
                                  : formatCredits(Number(sub.billing_option?.plan?.credits || 0))}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Price
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                              {sub.billing_option?.currency || '€'}
                              {Number(sub.billing_option?.price / 100 || 0).toFixed(2)} /{' '}
                              {sub.billing_option?.billing_frequency || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                              Created
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                              {sub.date_creation
                                ? new Date(sub.date_creation).toLocaleDateString()
                                : 'N/A'}
                            </span>
                          </div>
                          {sub.current_period_end && (
                            <div className="flex justify-between items-start gap-2 text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                                Period End
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                                {new Date(sub.current_period_end).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {sub.trial_end && (
                            <div className="flex justify-between items-start gap-2 text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[110px]">
                                Trial End
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 text-right flex-1">
                                {new Date(sub.trial_end).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No active subscriptions
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main Dropdown Content (Right Side) */}
          <div className={superAdminExpanded && user?.xsup ? 'w-[310px]' : 'w-full'}>
            <section className="bg-white dark:bg-gray-100/10 backdrop-blur-lg rounded-2xl p-1 shadow border border-gray-200 dark:border-gray-700/20">
              <div className="flex items-center p-2">
                <div className="flex-1 flex items-center gap-2">
                  <Avatar className="cursor-pointer size-10 border border-white dark:border-gray-700">
                    <AvatarImage
                      src={personProfile.avatar.url}
                      alt={personProfile.avatar.alt}
                    />
                    <AvatarFallback>{personProfile.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {personProfile.name || 'User'}
                    </h3>
                    <p className="text-muted-foreground text-xs">{personProfile.email}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-500/50 border-[0.5px] text-[11px] rounded-sm">
                  Online
                </Badge>
              </div>

              {/* Upgrade Button */}
              <div className="px-2 pb-2">
                <UpgradeButton
                  prominent
                  superAdminExpanded={superAdminExpanded}
                  onToggleSuperAdmin={() => setSuperAdminExpanded(!superAdminExpanded)}
                />
              </div>

              <DropdownMenuSeparator />

              {/* Profile Actions */}
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  className="p-2 rounded-lg cursor-pointer"
                  onClick={handleProfile}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      icon="solar:user-circle-line-duotone"
                      className="size-5 text-gray-500 dark:text-gray-400"
                    />
                    Your profile
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="p-2 rounded-lg cursor-pointer"
                  onClick={handleIntegration}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      icon="fluent:window-dev-tools-16-filled"
                      className="size-5 text-gray-500 dark:text-gray-400"
                    />
                    Integration
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-2 rounded-lg cursor-pointer"
                  onClick={handleUsage}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      icon="solar:chart-2-line-duotone"
                      className="size-5 text-gray-500 dark:text-gray-400"
                    />
                    Usage
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-2 rounded-lg cursor-pointer"
                  onClick={handleSettings}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      icon="solar:settings-line-duotone"
                      className="size-5 text-gray-500 dark:text-gray-400"
                    />
                    Settings
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Preferences */}
              <div className="p-3">
                <div>
                  <Label className="text-xs mb-1 block">Language</Label>
                  <Select
                    value={currentLang.value}
                    onValueChange={onChangeLang}
                  >
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          icon={currentLang.icon}
                          className="size-6"
                        />
                        <span className="text-xs">{currentLang.label}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {allLangs.map((option: any) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              icon={option.icon}
                              className="size-6"
                            />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Logout */}
            <section className="mt-1 p-1 rounded-2xl">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="p-2 rounded-lg cursor-pointer text-red-600 dark:text-red-400"
                  onClick={handleLogout}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon
                      icon="solar:logout-2-bold-duotone"
                      className="size-5"
                    />
                    Log out
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </section>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
