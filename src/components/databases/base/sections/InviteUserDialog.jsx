import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import React, { useState } from 'react';
import { Mail } from 'lucide-react';

function InviteUserDialog({ open, onClose, baseId, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    surname: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate email
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement Supabase admin API call via PostgREST
      // Example endpoint: POST /auth/v1/admin/users
      // Body: { email, user_metadata: { name, surname }, email_confirm: false }
      
      console.log('Inviting user:', formData);
      
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success - call callback to refresh user list
      if (onSuccess) {
        onSuccess();
      }

      // Reset form and close
      setFormData({ email: '', name: '', surname: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ email: '', name: '', surname: '' });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <Mail size={20} />
          <Typography variant="h6">Invite User</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Send an invitation email to a new user. They will receive a link to set up their account.
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="user@example.com"
            required
            fullWidth
            autoFocus
            disabled={loading}
          />

          <TextField
            label="First Name"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="John"
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Last Name"
            value={formData.surname}
            onChange={handleChange('surname')}
            placeholder="Doe"
            fullWidth
            disabled={loading}
          />

          <Alert severity="info">
            The user will receive an email with a link to set their password and complete registration.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.email}
          startIcon={loading ? <CircularProgress size={16} /> : <Mail size={16} />}
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InviteUserDialog;
