/**
 * Shop Port - Domain interface for payment and subscription operations
 * Handles payments, subscriptions, and billing
 */

export interface Subscription {
  id: string;
  account_id: string;
  plan_id: string;
  status: string;
  [key: string]: unknown;
}

export interface SubscriptionData {
  plan_id: string;
  account_id: string;
  [key: string]: unknown;
}

export interface SubscriptionUpdates {
  plan_id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  [key: string]: unknown;
}

export interface PaymentData {
  amount: number;
  currency: string;
  [key: string]: unknown;
}

export interface PaymentConfirmation {
  id: string;
  status: string;
  [key: string]: unknown;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  [key: string]: unknown;
}

export interface BillingDetails {
  name?: string;
  email?: string;
  address?: Address;
  [key: string]: unknown;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

/**
 * Abstract base class for payment and subscription operations
 */
export abstract class ShopPort {
  // ==================== Subscription Operations ====================

  /**
   * Fetch current subscription
   * @param accountId - Account ID
   * @returns Subscription data
   */
  abstract fetchSubscription(accountId: string): Promise<Subscription>;

  /**
   * Create subscription
   * @param subscriptionData - Subscription configuration
   * @returns Created subscription
   */
  abstract createSubscription(subscriptionData: SubscriptionData): Promise<Subscription>;

  /**
   * Update subscription
   * @param subscriptionId - Subscription ID
   * @param updates - Subscription updates
   * @returns Updated subscription
   */
  abstract updateSubscription(subscriptionId: string, updates: SubscriptionUpdates): Promise<Subscription>;

  /**
   * Cancel subscription
   * @param subscriptionId - Subscription ID
   * @returns Cancellation result
   */
  abstract cancelSubscription(subscriptionId: string): Promise<Subscription>;

  // ==================== Payment Operations ====================

  /**
   * Create payment intent
   * @param paymentData - Payment configuration
   * @returns Payment intent
   */
  abstract createPaymentIntent(paymentData: PaymentData): Promise<PaymentIntent>;

  /**
   * Confirm payment
   * @param paymentIntentId - Payment intent ID
   * @returns Payment confirmation
   */
  abstract confirmPayment(paymentIntentId: string): Promise<PaymentConfirmation>;

  /**
   * Fetch payment history
   * @param accountId - Account ID
   * @param options - Query options
   * @returns Payment history
   */
  abstract fetchPaymentHistory(accountId: string, options?: QueryOptions): Promise<Payment[]>;

  // ==================== Pricing Operations ====================

  /**
   * Fetch available plans
   * @returns Pricing plans
   */
  abstract fetchPlans(): Promise<Plan[]>;

  /**
   * Fetch plan details
   * @param planId - Plan ID
   * @returns Plan data
   */
  abstract fetchPlan(planId: string): Promise<Plan>;

  // ==================== Billing Operations ====================

  /**
   * Fetch billing details
   * @param accountId - Account ID
   * @returns Billing data
   */
  abstract fetchBillingDetails(accountId: string): Promise<BillingDetails>;

  /**
   * Update billing details
   * @param accountId - Account ID
   * @param updates - Billing updates
   * @returns Updated billing details
   */
  abstract updateBillingDetails(accountId: string, updates: BillingDetails): Promise<BillingDetails>;

  /**
   * Fetch invoices
   * @param accountId - Account ID
   * @param options - Query options
   * @returns Invoices
   */
  abstract fetchInvoices(accountId: string, options?: QueryOptions): Promise<Invoice[]>;
}

