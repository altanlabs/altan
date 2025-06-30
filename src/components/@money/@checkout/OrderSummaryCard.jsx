import { Card, Box, Typography, Button } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { validateOrderItems } from '../../../redux/slices/money';
import Auth from '../../auth/Auth';
import Iconify from '../../iconify/Iconify';
import OrderItem from '../@order/items/OrderItem';

const OrderSummaryCard = ({ order, handleNext, step, user, renderAccountSelector }) => {
  const dispatch = useDispatch();
  const isOrderValid = useSelector((state) => state.money.isOrderValid);

  useEffect(() => {
    dispatch(validateOrderItems());
  }, [dispatch, order]);

  if (!order || !order.order_items) return null;

  return (
    <Card
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        height: '60%',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        p: 3,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 500, mb: 1 }}
      >
        {step === 0 ? 'Order Summary' : 'Login to your account'}
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          mb: 2,
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            outline: '1px solid slategrey',
          },
        }}
      >
        {step === 0 ? (
          order.order_items.items.map((item, index) => (
            <OrderItem
              key={index}
              item={item}
              currency={order.currency}
            />
          ))
        ) : !user ? (
          <Auth noGuest={true} />
        ) : (
          order.meta_data && order.meta_data.altan_auth && renderAccountSelector()
        )}
      </Box>
      <Box>
        <Button
          endIcon={
            <Iconify
              rotate={90}
              icon="material-symbols:arrow-back"
            />
          }
          fullWidth
          size="large"
          variant="contained"
          onClick={handleNext}
          disabled={!isOrderValid}
          sx={{
            width: '100%',
            bgcolor: '#006BFF',
            color: 'white',
            borderRadius: 2,
            py: 1.5,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&:disabled': {
              opacity: 0.7,
            },
          }}
        >
          Continue
        </Button>
      </Box>
    </Card>
  );
};

export default OrderSummaryCard;
