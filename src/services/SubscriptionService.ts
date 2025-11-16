/**
 * Subscription Service - Business logic layer for subscription operations
 */
import { loadStripe } from '@stripe/stripe-js';

import { BaseService } from './BaseService';
import { optimai } from '../utils/axios';

export interface CreateSubscriptionData {
  userEmail: string;
  plan: string;
  account_id: string;
  isYearly: boolean;
}

export interface CreateCustomerPortalData {
  stripeCustomerId: string;
}

export interface Subscription {
  id: string;
  plan: {
    name: string;
  };
  credit_balance: number;
  date_creation: string;
  status: string;
}

export interface EmailSubscription {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  [key: string]: unknown;
}

/**
 * Subscription Service - Handles all subscription-related operations
 */
export class SubscriptionService extends BaseService {
  /**
   * Create a subscription with Stripe checkout
   * @param data - Subscription creation data
   * @returns Promise that resolves when redirect happens
   */
  async createSubscription(data: CreateSubscriptionData): Promise<void> {
    return this.execute(async () => {
      const { userEmail, plan, account_id, isYearly } = data;
      
      // Call the backend API to create a Checkout Session
      const response = await optimai.post<{ sessionId: string }>('/subscription/stripe/checkout-session', {
        user_email: userEmail,
        plan: plan,
        account_id: account_id,
        isYearly: isYearly,
      });
      
      // Get the session ID from the response
      const sessionId = response.data.sessionId;
      
      // Redirect the user to the Checkout Session
      const stripe = await loadStripe(
        'pk_live_51Mj4IpKUsA7CGHPxJVhuDrZovWp1WECSlGPJOENau8v4TCzi957R1tdwCM7374ChcH0Yo4xOCqvq3wsrKyOoxBeS00YqiEJO5n',
      );
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    }, 'Error creating subscription');
  }

  /**
   * Admin creates a subscription for an account
   * @param account_id - Account ID
   * @param plan - Subscription plan
   * @returns Created subscription
   */
  async adminCreateSubscription(account_id: string, plan: string): Promise<Subscription> {
    return this.execute(async () => {
      const response = await optimai.post<{ subscription: Subscription }>(`/subscription/${account_id}/${plan}`);
      return response.data.subscription;
    }, 'Error creating subscription (admin)');
  }

  /**
   * Pause a subscription
   * @param subscription_id - Subscription ID
   * @returns Response message
   */
  async pauseSubscription(subscription_id: string): Promise<{ msg: string }> {
    return this.execute(async () => {
      const response = await optimai.patch<{ msg: string }>(`/subscription/${subscription_id}/pause`);
      return response.data;
    }, 'Error pausing subscription');
  }

  /**
   * Create a Stripe customer portal session
   * @param data - Customer portal data
   * @returns Promise that resolves when redirect happens
   */
  async createCustomerPortal(data: CreateCustomerPortalData): Promise<void> {
    return this.execute(async () => {
      const { stripeCustomerId } = data;
      
      const response = await optimai.post<{ url: string }>('/subscription/stripe/customer-portal/', {
        customer_id: stripeCustomerId,
      });
      
      const url = response.data.url;
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-undef
        window.location.assign(url);
      }
    }, 'Error creating customer portal');
  }

  /**
   * Create an email subscription
   * @param name - Subscriber name
   * @param email - Subscriber email
   * @returns Created subscription
   */
  async createEmailSubscription(name: string, email: string): Promise<EmailSubscription> {
    return this.execute(async () => {
      const response = await optimai.post<{ subscription: EmailSubscription }>('/subscription/email', { name, email });
      return response.data.subscription;
    }, 'Error creating email subscription');
  }
}

// Singleton instance
let subscriptionServiceInstance: SubscriptionService | null = null;

/**
 * Get SubscriptionService singleton instance
 * @returns SubscriptionService instance
 */
export const getSubscriptionService = (): SubscriptionService => {
  if (!subscriptionServiceInstance) {
    subscriptionServiceInstance = new SubscriptionService();
  }
  return subscriptionServiceInstance;
};

