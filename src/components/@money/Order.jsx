import { Box, Typography, Grid } from '@mui/material';
import React, { useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  OrderItems,
  OrderHeader,
  OrderHistory,
  OrderClient,
  PaymentDetails,
  ErrorView,
} from './@order';
import { fetchOrderDetails } from '../../redux/slices/money';
import LoadingFallback from '../../routes/loader/LoadingFallback';

const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleString() : 'N/A');

const Order = ({ orderId }) => {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.money.order);
  const loading = useSelector((state) => state.money.loading);
  const error = useSelector((state) => state.money.error);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = () => dispatch(fetchOrderDetails(orderId));

      fetchOrder();

      const intervalId = setInterval(fetchOrder, 8000);

      return () => clearInterval(intervalId);
    }
  }, [dispatch, orderId]);

  if (loading && !(order || error)) return <LoadingFallback />;
  if (error) return <ErrorView error={error} />;
  if (!order) return <Typography>No order found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto', maxHeight: '100vh', overflow: 'auto' }}>
      <OrderHeader order={order} />
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          xs={12}
          md={8}
        >
          <OrderItems order={order} />
          <OrderHistory
            order={order}
            formatDate={formatDate}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
        >
          <OrderClient order={order} />
          <PaymentDetails order={order} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(Order);
