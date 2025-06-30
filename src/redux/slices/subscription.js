import { createSlice } from '@reduxjs/toolkit';
// utils
import { loadStripe } from '@stripe/stripe-js';

import { optimai } from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {};

const slice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
});

// Reducer
export default slice.reducer;

// Actions
export const {} = slice.actions;

// ----------------------------------------------------------------------

export const createSubscription = (data) => async (dispatch, getState) => {
  const { userEmail, plan, account_id, isYearly } = data;
  try {
    // Call the backend API to create a Checkout Session
    const response = await optimai.post('/subscription/stripe/checkout-session', {
      user_email: userEmail,
      plan: plan,
      account_id: account_id,
      isYearly: isYearly,
    });
    // Get the session ID from the response
    const { sessionId } = response.data;
    // Redirect the user to the Checkout Session
    const stripe = await loadStripe(
      'pk_live_51Mj4IpKUsA7CGHPxJVhuDrZovWp1WECSlGPJOENau8v4TCzi957R1tdwCM7374ChcH0Yo4xOCqvq3wsrKyOoxBeS00YqiEJO5n',
    );
    await stripe.redirectToCheckout({ sessionId });
  } catch (e) {
    console.error(`error: could not create subscription: ${e}`);
  } finally {
  }
};

export const adminCreateSub = (account_id, plan) => async (dispatch, getState) => {
  try {
    const response = await optimai.post(`/subscription/${account_id}/${plan}`);
    const { subscription } = response.data;
    return subscription;
  } catch (e) {
    console.error(`error: could not create subscription: ${e}`);
  } finally {
  }
};

export const pauseSubscription = (subscription_id) => async (dispatch, getState) => {
  try {
    const response = await optimai.patch(`/subscription/${subscription_id}/pause`);
    const { msg } = response.data;
  } catch (e) {
    console.error(`error: could not create subscription: ${e}`);
  } finally {
  }
};

export const createCustomerPortal = (data) => async (dispatch) => {
  const { stripeCustomerId } = data;
  try {
    const response = await optimai.post('/subscription/stripe/customer-portal/', {
      customer_id: stripeCustomerId,
    });
    const { url } = response.data;
    window.location.assign(url);
  } catch (e) {
    console.error(`error: could not create customer portal: ${e}`);
  } finally {
  }
};

export const createEmailSubs = (name, email) => async (dispatch) => {
  try {
    const response = await optimai.post('/subscription/email', { name: name, email: email });
    return Promise.resolve(response.subscription);
  } catch (e) {
    console.error(`error: could not create email subscription: ${e}`);
    return Promise.reject(e);
  }
};
