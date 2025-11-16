import { ShopPort } from '../../ports/ShopPort';
import { BaseHttpAdapter } from './BaseHttpAdapter';

/**
 * Shop HTTP Adapter
 * Implements ShopPort using HTTP/REST API
 */
export class ShopHttpAdapter extends ShopPort {
  constructor(config) {
    super();
    this.adapter = new BaseHttpAdapter({
      ...config,
      serviceName: 'optimai_shop',
    });
  }

  // ==================== Subscription Operations ====================

  async fetchSubscription(accountId) {
    return this.adapter.get(`subscription?account_id=${accountId}`);
  }

  async createSubscription(subscriptionData) {
    return this.adapter.post('subscription', subscriptionData);
  }

  async updateSubscription(subscriptionId, updates) {
    return this.adapter.patch(`subscription/${subscriptionId}`, updates);
  }

  async cancelSubscription(subscriptionId) {
    return this.adapter.delete(`subscription/${subscriptionId}`);
  }

  // ==================== Payment Operations ====================

  async createPaymentIntent(paymentData) {
    return this.adapter.post('payment-intent', paymentData);
  }

  async confirmPayment(paymentIntentId) {
    return this.adapter.post(`payment-intent/${paymentIntentId}/confirm`);
  }

  async fetchPaymentHistory(accountId, options = {}) {
    const params = new URLSearchParams();
    params.append('account_id', accountId);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    return this.adapter.get(`payments?${params.toString()}`);
  }

  // ==================== Pricing Operations ====================

  async fetchPlans() {
    return this.adapter.get('plans');
  }

  async fetchPlan(planId) {
    return this.adapter.get(`plans/${planId}`);
  }

  // ==================== Billing Operations ====================

  async fetchBillingDetails(accountId) {
    return this.adapter.get(`billing?account_id=${accountId}`);
  }

  async updateBillingDetails(accountId, updates) {
    return this.adapter.patch(`billing?account_id=${accountId}`, updates);
  }

  async fetchInvoices(accountId, options = {}) {
    const params = new URLSearchParams();
    params.append('account_id', accountId);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    return this.adapter.get(`invoices?${params.toString()}`);
  }

  /**
   * Get underlying axios instance for advanced use cases
   */
  getAxiosInstance() {
    return this.adapter.getAxiosInstance();
  }
}

