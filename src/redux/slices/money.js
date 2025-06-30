import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { optimai_shop } from '../../utils/axios';

const initialState = {
  order: null,
  clientSecret: null,
  checkoutSession: null,
  loading: false,
  error: null,
  isOrderValid: false,
};

export const updateOrder = createAsyncThunk(
  'money/updateOrder',
  async ({ orderId, data }, { dispatch, getState }) => {
    const state = getState();
    const clientId = state.money.order?.client_id;

    if (!clientId) {
      throw new Error('Client ID not found in the current order');
    }

    const response = await optimai_shop.patch(
      `/order/${orderId}/public?client_id=${clientId}`,
      data,
    );
    return response.data;
  },
);

export const validateOrderItems = createAsyncThunk(
  'money/validateOrderItems',
  async (_, { getState }) => {
    const { order } = getState().money;
    if (!order || !order.order_items || !order.order_items.items) return false;

    const invalidItems = order.order_items.items.filter((item) => {
      if (item.subscription_plan_billing) {
        return false;
      }

      const product = item.product;
      return !(product && (product.parent || (product.variants && product.variants.length === 0)));
    });

    return invalidItems.length === 0;
  },
);

export const fetchOrderDetails = createAsyncThunk(
  'money/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.get(`/order/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const setUpPayment = createAsyncThunk(
  'money/setUpPayment',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.post(`/payment/setup?order_id=${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createPaymentIntent = createAsyncThunk(
  'money/createPaymentIntent',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.post(`/payment/intent?order_id=${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateOrderItem = createAsyncThunk(
  'money/updateOrderItem',
  async ({ orderId, itemId, data }, { dispatch }) => {
    const response = await optimai_shop.patch(`/order/items/${itemId}`, data);
    // After updating the item, fetch the entire order again
    dispatch(fetchOrderDetails(orderId));
    return response.data;
  },
);

export const deleteOrderItem = createAsyncThunk(
  'money/deleteOrderItem',
  async ({ orderId, itemId }, { dispatch }) => {
    await optimai_shop.delete(`/order/items/${itemId}`);
    // After deleting the item, fetch the entire order again
    dispatch(fetchOrderDetails(orderId));
    return itemId;
  },
);

const moneySlice = createSlice({
  name: 'money',
  initialState,
  reducers: {
    clearState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        // state.error = null;
      })
      .addCase(validateOrderItems.fulfilled, (state, action) => {
        state.isOrderValid = action.payload;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order details';
      })
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create payment intent';
      })
      .addCase(setUpPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setUpPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(setUpPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set up payment';
      })
      .addCase(updateOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderItem.fulfilled, (state) => {
        state.loading = false;
        // We don't update the state here, as we're fetching the entire order again
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order item';
      })
      .addCase(deleteOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        state.loading = false;
        // We don't update the state here, as we're fetching the entire order again
        // However, you might want to show a temporary indication of deletion
        if (state.order && state.order.items) {
          state.order.items = state.order.items.filter((item) => item.id !== action.payload);
        }
      })
      .addCase(deleteOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete order item';
      });
  },
});

export const { clearState: clearMoneyState } = moneySlice.actions;

export default moneySlice.reducer;

export const createClient = async (accountId) => {
  try {
    console.log('Creating client for account:', accountId);
    const params = new URLSearchParams({ account_id: accountId });
    const response = await optimai_shop.post(`/client/?${params}`, {
      nickname: 'Unknown Client',
      origin: window.location.origin,
    });
    return response.data.client;
  } catch (error) {
    console.error('Failed to create client:', error);
    throw error;
  }
};

export const findClient = async (accountId, personId) => {
  try {
    console.log('Finding client for account:', accountId, 'and person:', personId);
    const params = new URLSearchParams({ account_id: accountId, person_id: personId });
    const response = await optimai_shop.get(`/client/?${params}`);
    return response.data.client;
  } catch (error) {
    console.error('Failed to find client:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await optimai_shop.post('/order/', orderData);
    return response.data.order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const prepareOrderData = (selectedPlans, currency, yearly) => {
  console.log('selectedPlans', selectedPlans);
  const items = Object.values(selectedPlans).map((plan) => ({
    name: plan.name,
    subscription_plan_billing_id: yearly
      ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly').id
      : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly').id,
    quantity: 1,
    price: yearly
      ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly').price
      : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly').price,
  }));

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return {
    account_id: selectedPlans[0].account_id,
    currency: currency,
    items: items,
    total_price: totalPrice,
  };
};

export const transferSubscription = async (subscriptionId, newAccountId) => {
  try {
    const params = new URLSearchParams({ account_id: newAccountId });
    const response = await optimai_shop.patch(
      `/subscriptions/${subscriptionId}/transfer?${params}`,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to find client:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await optimai_shop.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to find client:', error);
    throw error;
  }
};

export const reactivateSubscription = async (subscriptionId) => {
  try {
    const response = await optimai_shop.patch(`/subscriptions/${subscriptionId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Failed to find client:', error);
    throw error;
  }
};

export const updateSubscription = async ({ subscriptionId, billingOptionId, autoincrease }) => {
  try {
    const response = await optimai_shop.patch(`/subscriptions/${subscriptionId}`, {
      billing_option_id: billingOptionId,
      autoincrease: autoincrease,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to find client:', error);
    throw error;
  }
};
