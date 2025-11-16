import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import Iconify from '../../../../components/iconify';
import { selectAccount } from '../../../../redux/slices/general/index.ts';
import { optimai_shop } from '../../../../utils/axios';
import { openUrl } from '../../../../utils/auth';

// Invoice Status Colors
const getInvoiceStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'open':
      return 'info';
    case 'void':
      return 'default';
    case 'draft':
      return 'default';
    case 'uncollectible':
      return 'error';
    default:
      return 'default';
  }
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

function AccountBilling() {
  const account = useSelector(selectAccount);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Fetch billing data
  const fetchBillingData = useCallback(async () => {
    if (!account?.stripe_id) {
      setError('No Stripe customer ID found for this account');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch customer data and invoices
      const [customerRes, invoicesRes] = await Promise.all([
        optimai_shop.get(`/stripe/customer/${account.stripe_id}`),
        optimai_shop.get(`/stripe/invoices/${account.stripe_id}`),
      ]);

      setCustomer(customerRes.data);
      setInvoices(invoicesRes.data || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [account?.stripe_id]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Handle opening Stripe Customer Portal
  const handleOpenPortal = async () => {
    if (!account?.id) {
      setError('Account ID not found');
      return;
    }

    try {
      setPortalLoading(true);
      setError(null);

      const response = await optimai_shop.get('/stripe/portal-session', {
        params: {
          account_id: account.id,
        },
      });

      if (response.data.url) {
        // Open using platform-aware utility
        await openUrl(response.data.url);
      } else {
        setError('Failed to create portal session. Please try again.');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await optimai_shop.get(`/stripe/invoice/${invoiceId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack
          spacing={3}
          alignItems="center"
        >
          <CircularProgress />
          <Typography>Loading billing information...</Typography>
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchBillingData}
          startIcon={<Iconify icon="eva:refresh-fill" />}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Customer Information */}
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              Billing Information
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenPortal}
              disabled={portalLoading}
              startIcon={
                portalLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Iconify icon="eva:external-link-outline" />
                )
              }
            >
              {portalLoading ? 'Opening...' : 'Manage Billing'}
            </Button>
          </Stack>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Customer ID
              </Typography>
              <Typography variant="body1">{customer?.id || 'N/A'}</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Email
              </Typography>
              <Typography variant="body1">{customer?.email || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardContent>
          <Typography variant="h6">Invoice History</Typography>
          {invoices.length === 0 ? (
            <Alert severity="info">No invoices found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                        >
                          {invoice.number || invoice.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {invoice.created
                          ? format(new Date(invoice.created * 1000), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amount_paid || invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          color={getInvoiceStatusColor(invoice.status)}
                          size="small"
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Iconify icon="eva:download-outline" />
                            </IconButton>
                          </Tooltip>
                          {invoice.hosted_invoice_url && (
                            <Tooltip title="View Online">
                              <IconButton
                                size="small"
                                onClick={() => openUrl(invoice.hosted_invoice_url)}
                              >
                                <Iconify icon="eva:external-link-outline" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AccountBilling;
