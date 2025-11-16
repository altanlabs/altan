import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { optimai_shop } from '../../utils/axios';
import { RootState } from '../store';

// Types
interface Product {
  parent?: any;
  variants?: any[];
  [key: string]: any;
}

interface SubscriptionPlanBilling {
  id: string;
  [key: string]: any;
}

interface OrderItem {
  id: string;
  product?: Product;
  subscription_plan_billing?: SubscriptionPlanBilling;
  [key: string]: any;
}

interface OrderItems {
  items: OrderItem[];
  [key: string]: any;
}

interface Order {
  id: string;
  client_id?: string;
  order_items?: OrderItems;
  items?: OrderItem[];
  [key: string]: any;
}

interface MoneyState {
  order: Order | null;
  clientSecret: string | null;
  checkoutSession: any;
  loading: boolean;
  error: string | null;
  isOrderValid: boolean;
}

const initialState: MoneyState = {
  order: null,
  clientSecret: null,
  checkoutSession: null,
  loading: false,
  error: null,
  isOrderValid: false,
};

export const updateOrder = createAsyncThunk(
  'money/updateOrder',
  async ({ orderId, data }: { orderId: string; data: any }, { dispatch, getState }) => {
    const state = getState() as RootState;
    const clientId = state.money.order?.client_id;

    if (!clientId) {
      throw new Error('Client ID not found in the current order');
    }

    const response = await optimai_shop.patch(
      `/order/${orderId}/public?client_id=${clientId}`,
      data
    );
    return response.data;
  }
);

export const validateOrderItems = createAsyncThunk('money/validateOrderItems', async (_, { getState }) => {
  const { order } = (getState() as RootState).money;
  if (!order || !order.order_items || !order.order_items.items) return false;

  const invalidItems = order.order_items.items.filter((item) => {
    if (item.subscription_plan_billing) {
      return false;
    }

    const product = item.product;
    return !(product && (product.parent || (product.variants && product.variants.length === 0)));
  });

  return invalidItems.length === 0;
});

export const fetchOrderDetails = createAsyncThunk(
  'money/fetchOrderDetails',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.get(`/order/${orderId}`);
      return response.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setUpPayment = createAsyncThunk(
  'money/setUpPayment',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.post(`/payment/setup?order_id=${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'money/createPaymentIntent',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await optimai_shop.post(`/payment/intent?order_id=${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrderItem = createAsyncThunk(
  'money/updateOrderItem',
  async (
    { orderId, itemId, data }: { orderId: string; itemId: string; data: any },
    { dispatch }
  ) => {
    const response = await optimai_shop.patch(`/order/items/${itemId}`, data);
    // After updating the item, fetch the entire order again
    dispatch(fetchOrderDetails(orderId));
    return response.data;
  }
);

export const deleteOrderItem = createAsyncThunk(
  'money/deleteOrderItem',
  async ({ orderId, itemId }: { orderId: string; itemId: string }, { dispatch }) => {
    await optimai_shop.delete(`/order/items/${itemId}`);
    // After deleting the item, fetch the entire order again
    dispatch(fetchOrderDetails(orderId));
    return itemId;
  }
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
      })
      .addCase(validateOrderItems.fulfilled, (state, action) => {
        state.isOrderValid = action.payload;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch order details';
      })
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action: PayloadAction<{ clientSecret: string }>) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create payment intent';
      })
      .addCase(setUpPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setUpPayment.fulfilled, (state, action: PayloadAction<{ clientSecret: string }>) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(setUpPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to set up payment';
      })
      .addCase(updateOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateOrderItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order item';
      })
      .addCase(deleteOrderItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
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

// Async helper functions
export const createClient = async (accountId: string): Promise<any> => {
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

export const findClient = async (accountId: string, personId: string): Promise<any> => {
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

export const createOrder = async (orderData: any): Promise<Order> => {
  try {
    const response = await optimai_shop.post('/order/', orderData);
    return response.data.order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

interface BillingOption {
  id: string;
  billing_frequency: string;
  price: number;
}

interface Plan {
  name: string;
  billing_options: {
    items: BillingOption[];
  };
  account_id?: string;
  [key: string]: any;
}

export const prepareOrderData = (
  selectedPlans: Record<string, Plan> | Plan[],
  currency: string,
  yearly: boolean
): any => {
  console.log('selectedPlans', selectedPlans);
  const plansArray = Array.isArray(selectedPlans) ? selectedPlans : Object.values(selectedPlans);
  
  const items = plansArray.map((plan) => ({
    name: plan.name,
    subscription_plan_billing_id: yearly
      ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly')!.id
      : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly')!.id,
    quantity: 1,
    price: yearly
      ? plan.billing_options.items.find((b) => b.billing_frequency === 'yearly')!.price
      : plan.billing_options.items.find((b) => b.billing_frequency === 'monthly')!.price,
  }));

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return {
    account_id: plansArray[0].account_id,
    currency: currency,
    items: items,
    total_price: totalPrice,
  };
};

export const transferSubscription = async (
  subscriptionId: string,
  newAccountId: string
): Promise<any> => {
  try {
    const params = new URLSearchParams({ account_id: newAccountId });
    const response = await optimai_shop.patch(
      `/subscriptions/${subscriptionId}/transfer?${params}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to transfer subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<any> => {
  try {
    const response = await optimai_shop.delete(`/subscriptions/${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
};

export const reactivateSubscription = async (subscriptionId: string): Promise<any> => {
  try {
    const response = await optimai_shop.patch(`/subscriptions/${subscriptionId}/reactivate`);
    return response.data;
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    throw error;
  }
};

export const updateSubscription = async ({
  subscriptionId,
  billingOptionId,
  autoincrease,
}: {
  subscriptionId: string;
  billingOptionId?: string;
  autoincrease?: boolean;
}): Promise<any> => {
  try {
    const response = await optimai_shop.patch(`/subscriptions/${subscriptionId}`, {
      billing_option_id: billingOptionId,
      autoincrease: autoincrease,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }
};

