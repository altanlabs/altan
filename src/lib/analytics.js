import { createClient } from '@supabase/supabase-js';

// Supabase Analytics configuration
const supabaseUrl = 'https://database.altan.ai';
const supabaseKey = 'tenant_db49e5eb_2aa7_459f_8815_8f69889d90d5';

let supabase = null;

// Store current user context globally (updated by identify calls)
let currentUserContext = {
  user_id: null,
  user_email: null,
  account_id: null,
};

export const initializeAnalytics = () => {
  const isDev = import.meta.env.DEV;

  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Supabase Analytics initialized successfully');

    // Make analytics available globally for debugging
    window.supabaseAnalytics = supabase;
  } catch (error) {
    console.error('Supabase Analytics initialization failed:', error);
  }
};

// Helper function to send events to Supabase
const trackEvent = async (eventName, userId, userEmail, accountId, properties = {}, source = 'web') => {
  if (!supabase) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    // Use provided user context or get from stored context
    
    const eventData = {
      event_name: eventName,
      user_id: userId ? String(userId) : (currentUserContext.user_id ? String(currentUserContext.user_id) : null),
      user_email: userEmail || currentUserContext.user_email || null,
      account_id: accountId ? String(accountId) : (currentUserContext.account_id ? String(currentUserContext.account_id) : null),
      properties: properties && Object.keys(properties).length > 0 ? properties : null,
      source: source,
    };

    const { data, error } = await supabase
      .from('events')
      .insert([eventData]);

    if (error) {
      console.error('Error tracking event:', error);
    } else {
      console.log('Event tracked successfully:', eventName, eventData);
    }

    return { data, error };
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Analytics event tracking functions
export const analytics = {
  // User authentication events
  identify: async (userId, userProperties = {}) => {
    if (!userId) {
      console.warn('Analytics identify called without userId');
      return;
    }

    const { email, first_name, last_name, method, signup_date, ...customProperties } = userProperties;

    // Store user context globally for future events
    currentUserContext = {
      user_id: userId,
      user_email: email,
      account_id: userProperties.account_id || null,
    };

    const properties = {
      first_name,
      last_name,
      name: first_name && last_name ? `${first_name} ${last_name}` : undefined,
      method,
      signup_date,
      ...customProperties,
    };

    return trackEvent('user_identified', userId, email, userProperties.account_id, properties);
  },

  // Page view tracking
  pageView: async (pageName, properties = {}) => {
    return trackEvent('page_viewed', properties.user_id, properties.user_email, properties.account_id, {
      page_name: pageName,
      ...properties,
    });
  },

  // User authentication events
  signUp: async (method = 'email', properties = {}) => {
    return trackEvent('user_signed_up', properties.user_id, properties.user_email, properties.account_id, {
      method,
      ...properties,
    });
  },

  signIn: async (method = 'email', properties = {}) => {
    return trackEvent('user_signed_in', properties.user_id, properties.user_email, properties.account_id, {
      method,
      ...properties,
    });
  },

  signOut: async (properties = {}) => {
    return trackEvent('user_signed_out', properties.user_id, properties.user_email, properties.account_id, properties);
  },

  // Agent/AI related events
  agentCreated: async (agentType, properties = {}) => {
    return trackEvent('agent_created', properties.user_id, properties.user_email, properties.account_id, {
      agent_type: agentType,
      ...properties,
    });
  },

  // Flow creation events
  flowCreated: async (flowData, properties = {}) => {
    return trackEvent('flow_created', properties.user_id, properties.user_email, properties.account_id, {
      flow_type: flowData.type || 'unknown',
      has_prompt: !!(properties.prompt),
      has_altaner_component: !!(properties.altaner_component_id),
      ...properties,
    });
  },

  agentInteraction: async (agentId, interactionType, properties = {}) => {
    return trackEvent('agent_interaction', null, null, null, {
      agent_id: agentId,
      interaction_type: interactionType,
      ...properties,
    });
  },

  voiceInteraction: (duration, properties = {}) => {
    posthog.capture('voice_interaction', {
      duration_seconds: duration,
      ...properties,
    });
  },

  // Dashboard and navigation events
  dashboardViewed: (section, properties = {}) => {
    posthog.capture('dashboard_viewed', {
      section,
      ...properties,
    });
  },

  menuItemClicked: (menuItem, properties = {}) => {
    posthog.capture('menu_item_clicked', {
      menu_item: menuItem,
      ...properties,
    });
  },

  // Feature usage events
  featureUsed: (featureName, properties = {}) => {
    posthog.capture('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  },

  buttonClicked: (buttonName, location, properties = {}) => {
    posthog.capture('button_clicked', {
      button_name: buttonName,
      location,
      ...properties,
    });
  },

  // Form events
  formStarted: (formName, properties = {}) => {
    posthog.capture('form_started', {
      form_name: formName,
      ...properties,
    });
  },

  formCompleted: (formName, properties = {}) => {
    posthog.capture('form_completed', {
      form_name: formName,
      ...properties,
    });
  },

  formAbandoned: (formName, completionRate, properties = {}) => {
    posthog.capture('form_abandoned', {
      form_name: formName,
      completion_rate: completionRate,
      ...properties,
    });
  },

  // Error tracking
  errorOccurred: async (errorType, errorMessage, properties = {}) => {
    return trackEvent('error_occurred', null, null, null, {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
    });
  },

  // Enhanced error tracking with full context
  trackError: async (error, context = {}) => {
    const errorInfo = {
      error_type: error.name || 'Error',
      error_message: error.message || 'Unknown error',
      error_stack: error.stack,
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...context,
    };

    return trackEvent('application_error', context.user_id, context.user_email, context.account_id, errorInfo);
  },

  // API error tracking
  trackAPIError: async (error, endpoint, method = 'GET', context = {}) => {
    const apiErrorInfo = {
      error_type: 'API_ERROR',
      api_endpoint: endpoint,
      api_method: method,
      status_code: error.response?.status,
      status_text: error.response?.statusText,
      error_message: error.message,
      response_data: error.response?.data,
      ...context,
    };

    return trackEvent('api_error', context.user_id, context.user_email, context.account_id, apiErrorInfo);
  },

  // Performance events
  performanceMetric: (metricName, value, properties = {}) => {
    posthog.capture('performance_metric', {
      metric_name: metricName,
      value,
      ...properties,
    });
  },

  // E-commerce events
  beginCheckout: (value, currency, items, properties = {}) => {
    posthog.capture('begin_checkout', {
      value,
      currency,
      items,
      ...properties,
    });
  },

  // Upgrade and pricing events
  upgradeDialogViewed: async (properties = {}) => {
    return trackEvent('upgrade_dialog_viewed', properties.user_id, properties.user_email, properties.account_id, properties);
  },

  checkoutInitiated: async (planType, billingOption, properties = {}) => {
    return trackEvent('checkout_initiated', properties.user_id, properties.user_email, properties.account_id, {
      plan_type: planType,
      billing_frequency: billingOption.billing_frequency,
      price: billingOption.price / 100, // Convert cents to euros
      currency: 'EUR',
      ...properties,
    });
  },

  purchase: (transactionId, value, currency, items, properties = {}) => {
    posthog.capture('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items,
      ...properties,
    });
  },

  generateLead: (leadType, properties = {}) => {
    posthog.capture('generate_lead', {
      lead_type: leadType,
      ...properties,
    });
  },

  // Project and template events
  createProject: (projectName, projectType, properties = {}) => {
    console.log('PostHog: Tracking create_project event', {
      project_name: projectName,
      project_type: projectType,
      properties,
      posthogAvailable: !!window.posthog,
      posthogDisabled: window.posthog?.__loaded === false,
    });

    if (window.posthog) {
      posthog.capture('create_project', {
        project_name: projectName,
        project_type: projectType,
        ...properties,
      });
    } else {
      console.warn('PostHog not available for create_project event');
    }
  },

  openProject: (projectId, projectName, properties = {}) => {
    posthog.capture('open_project', {
      project_id: projectId,
      project_name: projectName,
      ...properties,
    });
  },

  cloneTemplate: (templateId, templateName, properties = {}) => {
    posthog.capture('clone_template', {
      template_id: templateId,
      template_name: templateName,
      ...properties,
    });
  },

  openTemplate: (templateId, templateName, properties = {}) => {
    posthog.capture('open_template', {
      template_id: templateId,
      template_name: templateName,
      ...properties,
    });
  },

  // Enhanced voice conversation tracking
  voiceConversationStart: (agentId, properties = {}) => {
    posthog.capture('voice_conversation_start', {
      agent_id: agentId,
      action: 'start',
      ...properties,
    });
  },

  voiceConversationEnd: (agentId, duration, properties = {}) => {
    posthog.capture('voice_conversation_end', {
      agent_id: agentId,
      action: 'end',
      duration_seconds: duration,
      ...properties,
    });
  },

  // Message interaction events
  messageSent: async (threadId, properties = {}) => {
    return trackEvent('message_sent', null, null, null, {
      thread_id: threadId,
      ...properties,
    });
  },

  // UI/UX events
  autopilotUpgradeDialog: (action, properties = {}) => {
    posthog.capture('autopilot_upgrade_dialog', {
      action,
      ...properties,
    });
  },

  // Custom event tracking
  track: async (eventName, properties = {}) => {
    return trackEvent(eventName, null, null, null, properties);
  },

  // Set user properties - handled via identify() for Supabase
  setUserProperties: async (properties) => {
    console.log('Use analytics.identify() instead of setUserProperties for Supabase');
  },

  // Reset user session (on logout)
  reset: () => {
    currentUserContext = {
      user_id: null,
      user_email: null,
      account_id: null,
    };
    console.log('Analytics session reset');
  },
};

export default analytics;
