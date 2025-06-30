import {
  Stack,
  Typography,
  Button,
  IconButton,
  List,
  Chip,
  Checkbox,
  Drawer,
  Divider,
  Card,
  Box,
  TextField,
  Select,
  MenuItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import { memo, useState, useMemo, useEffect } from 'react';

import AddSubscription from './AddSubscription';
import AddUser from './AddUser';
import Iconify from '../../../../components/iconify/Iconify';
import Scrollbar from '../../../../components/scrollbar/Scrollbar';
import { useSnackbar } from '../../../../components/snackbar';
import { getRoles, updateAccountMeta } from '../../../../redux/slices/general';
import { pauseSubscription } from '../../../../redux/slices/subscription';
import { setCreditBalance, changeAccountOwner } from '../../../../redux/slices/superadmin';
import { dispatch } from '../../../../redux/store';
import SkeletonWidgetItem from '../../../../sections/@dashboard/widgets/drawers/attributes/components/SkeletonWidgetItem';

export const subscriptionPlanColor = {
  Free: '#008000',
  Bronze:
    'radial-gradient(circle farthest-corner at center, rgba(169, 113, 66, 1) 20%, rgba(169, 104, 49, 1) 40%, rgba(169, 95, 32, 1) 60%, rgba(169, 85, 15, 1) 80%, rgba(169, 77, 0, 1) 100%);',
  Silver: 'linear-gradient(to bottom, #C0C0C0 0%, #B1B1B1 100%)',
  Gold: 'linear-gradient(to top, #ebd197 0%,#b48811 50%,#a2790d 51%,#bb9b49 100%);',
};

const AccountInfo = ({ account }) => {
  // Default state values
  const defaultMeta = {
    industry: '',
    website: '',
    channels: '',
    referral: '',
    notion: '',
  };

  // Initialize state only if account is available
  const [editModes, setEditModes] = useState({
    industry: false,
    website: false,
    channels: false,
    referral: false,
    notion: false,
    analytics: false,
  });

  const [accountMeta, setAccountMeta] = useState(
    account
      ? {
          industry: account.meta_data?.industry || '',
          website: account.meta_data?.website || '',
          channels: account.meta_data?.channels || '',
          referral: account.meta_data?.referral || '',
          notion: account.meta_data?.notion || '',
          analytics: account.meta_data?.analytics || '',
        }
      : { ...defaultMeta },
  );

  const { enqueueSnackbar } = useSnackbar();

  const handleEditToggle = (field) => {
    setEditModes((prevModes) => ({ ...prevModes, [field]: !prevModes[field] }));
  };

  const handleInputChange = (field, value) => {
    setAccountMeta((prevMeta) => ({ ...prevMeta, [field]: value }));
  };

  const handleSave = (field) => {
    console.log(`Saving ${field}`, accountMeta[field]);
    dispatch(updateAccountMeta(account.id, { [field]: accountMeta[field] }))
      .then(() => {
        enqueueSnackbar(`Successfully updated ${field}`, { variant: 'success' });
        handleEditToggle(field);
      })
      .catch((e) => enqueueSnackbar(`Error updating ${field}: ${e}`, { variant: 'error' }));
  };

  const accountInfo = [
    { title: 'Industry', icon: 'carbon:industry', key: 'industry' },
    { title: 'Website', icon: 'fluent-mdl2:website', key: 'website' },
    { title: 'Channels', icon: 'uil:channel', key: 'channels' },
    { title: 'Referral', icon: 'nimbus:marketing', key: 'referral' },
    { title: 'Notion', icon: 'mingcute:notion-fill', key: 'notion' },
    { title: 'Analytics', icon: 'majesticons:analytics-plus', key: 'analytics' },
  ];
  return !!account ? (
    <Stack sx={{ px: 2 }}>
      <Typography
        variant="h6"
        sx={{ py: 2 }}
      >
        Info
      </Typography>
      {accountInfo.map(({ title, icon, key }) => (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            key={key}
          >
            <Stack
              direction="row"
              spacing={2}
            >
              <Chip
                label={title}
                icon={<Iconify icon={icon} />}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
            >
              {editModes[key] ? (
                <>
                  <TextField
                    size="small"
                    value={accountMeta[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => handleSave(key)}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {Array.isArray(accountMeta[key]) ? (
                    accountMeta[key].map((val, index) => (
                      <Chip
                        size="small"
                        label={val}
                        key={index}
                      />
                    ))
                  ) : (
                    <Typography>{accountMeta[key]}</Typography>
                  )}
                </>
              )}
            </Stack>
            <IconButton
              onClick={() => handleEditToggle(key)}
              sx={{ position: 'absolue', top: 0, right: 0 }}
            >
              <Iconify
                icon="material-symbols:edit"
                width={12}
              />
            </IconButton>
          </Stack>
        </>
      ))}
    </Stack>
  ) : (
    <Typography
      variant="h6"
      sx={{ p: 2 }}
    >
      Loading account information...
    </Typography>
  );
};

const accountStats = (account) => [
  {
    title: 'Created at',
    icon: 'mdi:clock',
    value: new Date(account.date_creation).toLocaleString(),
  },
  {
    title: 'Apps',
    icon: 'fluent:bot-sparkle-20-filled',
    value: account.chatbots,
  },
  {
    title: 'Files',
    icon: 'tabler:file-filled',
    value: account.files,
  },
  {
    title: 'Connections',
    icon: 'uil:channel',
    value: account.channels,
  },
  {
    title: 'Clients',
    icon: 'ic:twotone-people-alt',
    value: account.clients,
  },
];

const ownerDetails = (user) => [
  {
    title: 'Name',
    icon: 'wpf:name',
    value: `${user.first_name} ${user.last_name}`,
  },
  {
    title: 'Email',
    icon: 'ic:baseline-email',
    value: user.email,
  },
  {
    title: 'Phone',
    icon: 'solar:phone-bold-duotone',
    value: user.meta_data?.phone,
  },
  {
    title: 'Since',
    icon: 'mdi:clock',
    value: new Date(user.date_creation).toLocaleString(),
  },
];

const AccountDrawer = ({ account, open, onClose }) => {
  const [editingCredits, setEditingCredits] = useState({});
  const [selectedUserRoles, setSelectedUserRoles] = useState({});
  const [roles, setRoles] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handlePauseSubscription = (subId) => {
    console.log('Pausing Subscription');
    dispatch(pauseSubscription(subId))
      .then(() => {
        enqueueSnackbar('Paused subscription page');
        onClose();
      })
      .catch((e) =>
        enqueueSnackbar(`Error: Could not pause subscription ${e}`, { variant: 'error' }),
      );
  };

  const baseUrl = 'https://storage.googleapis.com/logos-chatbot-optimai/account/';
  const logoUrl = `${baseUrl}${account?.id}`;
  const onEditCredits = (subscription) => {
    if (editingCredits.id === subscription.id) {
      if (!!editingCredits.credits && editingCredits.credits !== subscription.credit_balance)
        dispatch(setCreditBalance(account.id, subscription.id, parseInt(editingCredits.credits)))
          .then((cred) => {
            enqueueSnackbar(
              `Credit balance for ${subscription.plan.name} plan of account ${account.id} successfully set to ${cred}`,
            );
            setEditingCredits({});
            onClose();
          })
          .catch((e) =>
            enqueueSnackbar(`Error: Could not change credit balance: ${e}`, { variant: 'error' }),
          );
      else setEditingCredits({});
    } else
      setEditingCredits({
        id: subscription.id,
        credits: subscription.credit_balance,
      });
  };

  const handleMakeOwner = (user) => {
    console.log('Creating new owner:', user);
    dispatch(changeAccountOwner(account.id, user.id))
      .then((cred) => {
        enqueueSnackbar('Made new owner');
      })
      .catch((e) => enqueueSnackbar(`Error: Could not change owner: ${e}`, { variant: 'error' }));
  };

  const handleKeyDown = (e, subscription) => {
    if (e.key === 'Enter') onEditCredits(subscription);
  };

  const onSelectedRolesChange = (userId, roles) => {
    setSelectedUserRoles((prev) => {
      const newSelected = { ...prev };
      newSelected[userId] = roles;
      return newSelected;
    });
  };

  useEffect(() => {
    if (!!account?.organisation?.users)
      setSelectedUserRoles((prev) => {
        const newSelected = { ...prev };
        account.organisation.users.forEach(
          (u) => (newSelected[u.user.id] = u.roles.map((r) => r.id)),
        );
        return newSelected;
      });
  }, [account]);

  useEffect(() => {
    if (!roles) dispatch(getRoles()).then((res) => setRoles(res));
  }, []);

  const renderHead = (
    <Stack
      alignItems="center"
      sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}
    >
      <Typography
        variant="h6"
        sx={{ flexGrow: 1 }}
      >
        {account?.meta_data?.name || 'Unknown name'}
      </Typography>
      <Typography
        variant="subtitle"
        sx={{ flexGrow: 1 }}
      >
        Workspace Info
      </Typography>
    </Stack>
  );

  const renderSubscriptions = useMemo(
    () =>
      account?.subscriptions && (
        <List disablePadding>
          {account.subscriptions.map((subscription) => {
            const subscriptionBalance = subscription.credit_balance;
            return (
              <Card
                key={`subscription_${subscription.id}_${subscriptionBalance}`}
                sx={{ p: 1.5, m: 1.5 }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="column"
                    justifyContent="left"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: subscriptionPlanColor[subscription.plan.name],
                        }}
                      />
                      <Typography>{subscription.plan.name}</Typography>
                      <Typography
                        noWrap
                        variant="caption"
                        sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                      >
                        Created: {subscription.date_creation.substring(0, 10)}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      {subscription.id === editingCredits.id ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          value={editingCredits.credits}
                          onChange={(e) =>
                            setEditingCredits((prev) => {
                              const newEditingCredits = { ...prev };
                              newEditingCredits.credits = e.target.value;
                              return newEditingCredits;
                            })}
                          onKeyDown={(e) => handleKeyDown(e, subscription)}
                        />
                      ) : (
                        <Typography variant="caption">Credits: {subscriptionBalance}</Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => onEditCredits(subscription)}
                        color="primary"
                        disabled={'id' in editingCredits && subscription.id !== editingCredits.id}
                      >
                        <Iconify
                          width={15}
                          icon={
                            subscription.id === editingCredits.id
                              ? !!editingCredits.credits &&
                                editingCredits.credits !== subscriptionBalance
                                  ? 'mdi:tick'
                                  : 'mdi:close'
                              : 'material-symbols:edit'
                          }
                        />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {/* <Button onClick={() => handlePauseSubscription(subscription.id)}>
                </Button> */}
                  <IconButton
                    onClick={() => handlePauseSubscription(subscription.id)}
                    disabled={subscription.status !== 'active'}
                    children={
                      <Iconify
                        icon={
                          subscription.status === 'active'
                            ? 'ic:twotone-toggle-on'
                            : 'ic:twotone-toggle-off'
                        }
                        sx={{
                          color: 'green',
                          ...(subscription.status !== 'active' && {
                            color: 'red',
                          }),
                        }}
                      />
                    }
                  />
                </Stack>
              </Card>
            );
          })}
        </List>
      ),
    [account?.id, account?.subscription, editingCredits.id, editingCredits.credits],
  );

  const renderUsers = useMemo(
    () =>
      account?.organisation?.users && (
        <List>
          {[
            ...account.organisation.users,
            { role: { name: 'AccountOwner' }, user: account.owner },
          ].map((u) => {
            return (
              <Card
                key={`org_user_${u.user.id}`}
                sx={{ p: 1.5, m: 1.5 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack
                    direction="column"
                    justifyContent="left"
                  >
                    <Typography>
                      {u.user.meta_data.first_name} {u.user.meta_data.last_name}
                    </Typography>
                    <Typography variant="caption">{u.user.email}</Typography>
                  </Stack>
                  {u.user.id === account.owner.id ? (
                    <Typography variant="caption">AccountOwner</Typography>
                  ) : (
                    !!roles &&
                    u.user.id in selectedUserRoles && (
                      <Select
                        size="small"
                        multiple
                        placeholder="Subscription"
                        value={selectedUserRoles[u.user.id]}
                        renderValue={(selected) =>
                          selected.map((s) => roles.find((r) => r.id === s)?.name).join(', ')}
                        onChange={(event) => onSelectedRolesChange(u.user.id, event.target.value)}
                        sx={{ typography: 'body2', width: 200 }}
                      >
                        {roles.map((option) => (
                          <MenuItem
                            key={option.id}
                            value={option.id}
                            sx={{
                              borderRadius: 0.75,
                              typography: 'body2',
                              textTransform: 'capitalize',
                            }}
                          >
                            <Checkbox checked={selectedUserRoles[u.user.id].includes(option.id)} />
                            <ListItemText primary={option.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    )
                  )}
                </Stack>
                <Button onClick={() => handleMakeOwner(u.user)}>Make owner</Button>
              </Card>
            );
          })}
        </List>
      ),
    [account?.id, account?.organisation?.users, selectedUserRoles],
  );

  const renderStats = useMemo(
    () =>
      !!account ? (
        <Stack sx={{ px: 2 }}>
          <Typography
            variant="h6"
            sx={{ py: 2 }}
          >
            Stats
          </Typography>
          {accountStats(account).map((stat) => (
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={2}
              >
                <Iconify icon={stat.icon} />
                <Typography>{stat.title}:</Typography>
              </Stack>
              <Typography>{stat.value}</Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        [...Array(2)].map((_, index) => <SkeletonWidgetItem key={index} />)
      ),
    [account],
  );

  const renderOwner = useMemo(
    () =>
      !!account?.owner ? (
        <Stack sx={{ px: 2 }}>
          <Typography
            variant="h6"
            sx={{ py: 2 }}
          >
            Owner
          </Typography>
          {ownerDetails(account.owner).map((stat) => (
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={2}
              >
                <Iconify icon={stat.icon} />
                <Typography>{stat.title}:</Typography>
              </Stack>
              <Typography>{stat.value}</Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        [...Array(2)].map((_, index) => <SkeletonWidgetItem key={index} />)
      ),
    [account],
  );

  return (
    <Scrollbar>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 500, pb: 4, overflowX: 'hidden' },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 6, right: 6 }}
        >
          <Iconify
            icon="mdi:close"
            width={18}
          />
        </IconButton>

        <Avatar
          src={logoUrl}
          name={account?.meta_data?.name}
          sx={{ position: 'absolute', top: 20, left: 30 }}
        />

        {renderHead}

        <Divider />

        <AccountInfo account={account} />

        <Divider sx={{ mt: 1 }} />

        {renderStats}

        <Divider sx={{ mt: 1 }} />

        {renderOwner}

        <Divider sx={{ mt: 1 }} />

        <Typography
          variant="h6"
          sx={{ ml: 2, mt: 1 }}
        >
          Subscriptions
        </Typography>
        {!!account && renderSubscriptions}

        <AddSubscription accountId={account?.id} />

        <Divider sx={{ m: 1 }} />
        <Typography
          variant="h6"
          sx={{ ml: 3 }}
        >
          Users
        </Typography>
        {!!account && renderUsers}
        <AddUser accountId={account?.id} />
      </Drawer>
    </Scrollbar>
  );
};

export default memo(AccountDrawer);
