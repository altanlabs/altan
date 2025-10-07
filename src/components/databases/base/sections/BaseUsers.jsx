import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserPlus, Settings, MoreVertical, CheckCircle, Mail, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';

import {
  selectBaseById,
  selectUserCacheForBase,
  selectUserCacheState,
  preloadUsersForBase,
} from '../../../../redux/slices/bases';
import { dispatch } from '../../../../redux/store';
import InviteUserDialog from './InviteUserDialog.jsx';

// Helper to extract login method from Supabase auth.users
const getLoginMethod = (user) => {
  // Supabase stores provider in raw_app_meta_data
  const provider = user.raw_app_meta_data?.provider;
  if (provider) {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
  return 'Email';
};

// Helper to get user display name from Supabase auth.users
const getUserDisplayName = (user) => {
  const metadata = user.raw_user_meta_data || {};
  const name = metadata.name || '';
  const surname = metadata.surname || '';
  
  if (name && surname) {
    return `${name} ${surname}`;
  }
  if (name) return name;
  if (surname) return surname;
  
  return user.email || 'Unknown User';
};

// Helper to get user email
const getUserEmail = (user) => {
  return user.email || 'No email';
};

// Helper to check if email is verified
const isEmailVerified = (user) => {
  return !!user.email_confirmed_at || user.raw_user_meta_data?.email_verified === true;
};

// Simple signup chart component
const SignupChart = ({ timeRange, users }) => {
  // Generate signup data from real user data
  const data = useMemo(() => {
    const days = timeRange === 'Last 7 days' ? 7 : timeRange === 'Last 30 days' ? 30 : 90;
    const now = new Date();
    const startDate = new Date(now - days * 24 * 60 * 60 * 1000);
    
    // Initialize all days with 0 signups
    const signupsByDay = Array.from({ length: days }, (_, i) => ({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
      signups: 0,
    }));

    // Count signups per day from real user data
    if (users && users.length > 0) {
      users.forEach((user) => {
        const createdDate = user.created_at || user.createdAt || user.date_created || user.signup_date;
        if (createdDate) {
          const userDate = new Date(createdDate);
          if (userDate >= startDate) {
            const dayIndex = Math.floor((userDate - startDate) / (24 * 60 * 60 * 1000));
            if (dayIndex >= 0 && dayIndex < days) {
              signupsByDay[dayIndex].signups++;
            }
          }
        }
      });
    }

    return signupsByDay;
  }, [timeRange, users]);

  const maxSignups = Math.max(...data.map((d) => d.signups), 1);
  const totalSignups = data.reduce((sum, d) => sum + d.signups, 0);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Signups</Typography>
            <Typography variant="h4" color="primary">
              {totalSignups}
            </Typography>
          </Stack>
          <Box sx={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
            {data.map((item, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  bgcolor: 'primary.main',
                  height: `${(item.signups / maxSignups) * 100}%`,
                  minHeight: item.signups > 0 ? '2px' : 0,
                  borderRadius: 0.5,
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
                title={`${item.date.toLocaleDateString()}: ${item.signups} signups`}
              />
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

function BaseUsers({ baseId }) {
  const base = useSelector((state) => selectBaseById(state, baseId));
  const userCacheObject = useSelector((state) => selectUserCacheForBase(state, baseId));
  const userCacheState = useSelector(selectUserCacheState);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Fetch users from database on mount
  useEffect(() => {
    dispatch(preloadUsersForBase(baseId));
  }, [baseId]);

  // Convert user cache object to array
  const users = useMemo(() => {
    return Object.values(userCacheObject);
  }, [userCacheObject]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const email = getUserEmail(user).toLowerCase();
      const name = getUserDisplayName(user).toLowerCase();
      const userId = (user.id || '').toString().toLowerCase();
      return email.includes(query) || name.includes(query) || userId.includes(query);
    });
  }, [users, searchQuery]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} Minutes Ago`;
    if (diffHours < 24) return `${diffHours} Hours Ago`;
    return `${diffDays} Days Ago`;
  };

  const handleMenuOpen = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleVerifyEmail = () => {
    // TODO: Implement email verification via Supabase admin API
    console.log('Verify email for user:', selectedUser?.email);
    handleMenuClose();
  };

  const handleDeleteUser = () => {
    // TODO: Implement user deletion via Supabase admin API
    console.log('Delete user:', selectedUser?.email);
    handleMenuClose();
  };

  const handleInviteSuccess = () => {
    // Refresh user list after successful invitation
    dispatch(preloadUsersForBase(baseId));
  };

  // Show loading state
  if (userCacheState.loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading users...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Show error state if there's an error
  if (userCacheState.error && users.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <Typography variant="h6" color="error">
                Unable to load users
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {userCacheState.error}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Make sure your database has a users table (auth.users, users, or similar).
              </Typography>
              <Button
                variant="outlined"
                onClick={() => dispatch(preloadUsersForBase(baseId))}
              >
                Try Again
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users and view signups over time.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Settings size={20} />}
          >
            Auth settings
          </Button>
        </Stack>

        {/* Signup Chart */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              Signups
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                <MenuItem value="Last 90 days">Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <SignupChart timeRange={timeRange} users={users} />
        </Box>

        {/* Users Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage individual users.
            </Typography>
          </Stack>

          {/* Actions Bar */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              size="small"
              onClick={() => setInviteDialogOpen(true)}
            >
              Add User
            </Button>
            <TextField
              size="small"
              placeholder="Search by email, phone, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
          </Stack>

          {/* Users Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Login methods</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>Last signed in</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const email = getUserEmail(user);
                      const displayName = getUserDisplayName(user);
                      const loginMethod = getLoginMethod(user);
                      const lastSignIn = user.last_sign_in_at || user.last_login || user.updated_at || user.created_at;
                      const verified = isEmailVerified(user);
                      
                      return (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: 'primary.main',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {displayName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {displayName}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip label={loginMethod} size="small" />
                          </TableCell>
                          <TableCell>
                            {verified ? (
                              <Chip
                                icon={<CheckCircle size={14} />}
                                label="Verified"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                label="Unverified"
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {lastSignIn ? formatDate(lastSignIn) : 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, user)}
                            >
                              <MoreVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Pagination info */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredUsers.length} users found
            </Typography>
            <Stack direction="row" spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Page
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                1
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                1
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      {/* User Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedUser && !isEmailVerified(selectedUser) && (
          <MenuItem onClick={handleVerifyEmail}>
            <ListItemIcon>
              <CheckCircle size={18} />
            </ListItemIcon>
            <ListItemText>Verify Email</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Mail size={18} />
          </ListItemIcon>
          <ListItemText>Send Reset Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Trash2 size={18} color="currentColor" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        baseId={baseId}
        onSuccess={handleInviteSuccess}
      />
    </Box>
  );
}

export default BaseUsers;
