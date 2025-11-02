import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://d2e5baf5-4f0.db-pool-europe-west1.altan.ai';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwNzY4Nzk1NzcsImlhdCI6MTc2MTUxOTU3NywiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.mnZyOqmzQNY9PwF6AiaWTO7IOaZBfNx7KaxCw0bZAVY';

let supabase = null;

// Store current user context globally (updated by identify calls)
let currentUserContext = {
  user_id: null,
  user_email: null,
  account_id: null,
};

export const initializeAnalytics = () => {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
};

// Helper function to send events
const trackEvent = async (
  eventName,
  userId,
  userEmail,
  accountId,
  properties = {},
  source = 'web',
) => {
  if (!supabase) {
    console.warn('Analytics not initialized. Call initializeAnalytics() first.');
    return { data: null, error: null };
  }

  try {
    // Use provided user context or fall back to global context
    const finalUserId = userId || currentUserContext.user_id;
    const finalUserEmail = userEmail || currentUserContext.user_email;
    const finalAccountId = accountId || currentUserContext.account_id;

    const eventData = {
      event_name: eventName,
      user_id: finalUserId,
      user_email: finalUserEmail,
      account_id: finalAccountId,
      source,
      properties: properties || {},
    };

    const { data, error } = await supabase.from('events').insert([eventData]);

    if (error) {
      console.error('Analytics tracking error:', error);
    }

    return { data, error };
  } catch (error) {
    console.error('Analytics tracking exception:', error);
    return { data: null, error };
  }
};

// Analytics event tracking functions
export const analytics = {
  // User authentication events
  identify: async (userId, userProperties = {}) => {
    // Update global user context
    currentUserContext = {
      user_id: userId,
      user_email: userProperties.email || userProperties.user_email || null,
      account_id: userProperties.account_id || null,
    };

    return trackEvent('user_identified', userId, currentUserContext.user_email, currentUserContext.account_id, {
      ...userProperties,
    });
  },

  // Page view tracking
  pageView: async (pageName, properties = {}) => {
    return trackEvent(
      'page_viewed',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        page_name: pageName,
        ...properties,
      },
    );
  },

  // User authentication events
  signUp: async (method = 'email', properties = {}) => {
    return trackEvent(
      'user_signed_up',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        method,
        ...properties,
      },
    );
  },

  signIn: async (method = 'email', properties = {}) => {
    return trackEvent(
      'user_signed_in',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        method,
        ...properties,
      },
    );
  },

  signOut: async (properties = {}) => {
    return trackEvent(
      'user_signed_out',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      properties,
    );
  },

  // Account switching
  accountSwitched: async (fromAccountId, toAccountId, properties = {}) => {
    return trackEvent('account_switched', properties.user_id, properties.user_email, toAccountId, {
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      ...properties,
    });
  },

  // Agent/AI related events
  agentCreated: async (agentType, properties = {}) => {
    return trackEvent(
      'agent_created',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        agent_type: agentType,
        ...properties,
      },
    );
  },

  // Flow creation events
  flowCreated: async (flowData, properties = {}) => {
    return trackEvent(
      'flow_created',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        flow_type: flowData.type || 'unknown',
        has_prompt: !!properties.prompt,
        has_altaner_component: !!properties.altaner_component_id,
        ...properties,
      },
    );
  },

  agentInteraction: async (agentId, interactionType, properties = {}) => {
    return trackEvent('agent_interaction', null, null, null, {
      agent_id: agentId,
      interaction_type: interactionType,
      ...properties,
    });
  },

  voiceInteraction: async (duration, properties = {}) => {
    return trackEvent('voice_interaction', null, null, null, {
      duration_seconds: duration,
      ...properties,
    });
  },

  // Dashboard and navigation events
  dashboardViewed: async (section, properties = {}) => {
    return trackEvent('dashboard_viewed', null, null, null, {
      section,
      ...properties,
    });
  },

  menuItemClicked: async (menuItem, properties = {}) => {
    return trackEvent('menu_item_clicked', null, null, null, {
      menu_item: menuItem,
      ...properties,
    });
  },

  // Feature usage events
  featureUsed: async (featureName, properties = {}) => {
    return trackEvent('feature_used', null, null, null, {
      feature_name: featureName,
      ...properties,
    });
  },

  buttonClicked: async (buttonName, location, properties = {}) => {
    return trackEvent('button_clicked', null, null, null, {
      button_name: buttonName,
      location,
      ...properties,
    });
  },

  // Form events
  formStarted: async (formName, properties = {}) => {
    return trackEvent('form_started', null, null, null, {
      form_name: formName,
      ...properties,
    });
  },

  formCompleted: async (formName, properties = {}) => {
    return trackEvent('form_completed', null, null, null, {
      form_name: formName,
      ...properties,
    });
  },

  formAbandoned: async (formName, completionRate, properties = {}) => {
    return trackEvent('form_abandoned', null, null, null, {
      form_name: formName,
      completion_rate: completionRate,
      ...properties,
    });
  },

  // Error tracking - disabled for business analytics
  errorOccurred: async () => {
    // Silently disabled for business analytics
  },

  trackError: async () => {
    // Silently disabled for business analytics
  },

  trackAPIError: async () => {
    // Silently disabled for business analytics
  },

  // Performance events
  performanceMetric: async (metricName, value, properties = {}) => {
    return trackEvent('performance_metric', null, null, null, {
      metric_name: metricName,
      value,
      ...properties,
    });
  },

  // E-commerce events
  beginCheckout: async (value, currency, items, properties = {}) => {
    return trackEvent('begin_checkout', null, null, null, {
      value,
      currency,
      items,
      ...properties,
    });
  },

  // Upgrade and pricing events
  upgradeDialogViewed: async (properties = {}) => {
    return trackEvent(
      'upgrade_dialog_viewed',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      properties,
    );
  },

  checkoutInitiated: async (planType, billingOption, properties = {}) => {
    return trackEvent(
      'checkout_initiated',
      properties.user_id,
      properties.user_email,
      properties.account_id,
      {
        plan_type: planType,
        billing_frequency: billingOption.billing_frequency,
        price: billingOption.price / 100, // Convert cents to euros
        currency: 'EUR',
        ...properties,
      },
    );
  },

  purchase: async (transactionId, value, currency, items, properties = {}) => {
    return trackEvent('purchase', null, null, null, {
      transaction_id: transactionId,
      value,
      currency,
      items,
      ...properties,
    });
  },

  generateLead: async (leadType, properties = {}) => {
    return trackEvent('generate_lead', null, null, null, {
      lead_type: leadType,
      ...properties,
    });
  },

  // Project and template events
  createProject: async (projectName, projectType, properties = {}) => {
    return trackEvent('create_project', properties.user_id, properties.user_email, properties.account_id, {
      project_name: projectName,
      project_type: projectType,
      ...properties,
    });
  },

  openProject: async (projectId, projectName, properties = {}) => {
    return trackEvent('open_project', properties.user_id, properties.user_email, properties.account_id, {
      project_id: projectId,
      project_name: projectName,
      ...properties,
    });
  },

  cloneTemplate: async (templateId, templateName, properties = {}) => {
    return trackEvent('clone_template', properties.user_id, properties.user_email, properties.account_id, {
      template_id: templateId,
      template_name: templateName,
      ...properties,
    });
  },

  openTemplate: async (templateId, templateName, properties = {}) => {
    return trackEvent('open_template', properties.user_id, properties.user_email, properties.account_id, {
      template_id: templateId,
      template_name: templateName,
      ...properties,
    });
  },

  // Account viewing events
  accountViewed: async (viewedAccountId, accountName, properties = {}) => {
    return trackEvent('account_viewed', properties.user_id, properties.user_email, properties.account_id, {
      viewed_account_id: viewedAccountId,
      viewed_account_name: accountName,
      view_source: properties.view_source || 'direct', // marketplace, search, direct, etc.
      ...properties,
    });
  },

  // Enhanced voice conversation tracking
  voiceConversationStart: async (agentId, properties = {}) => {
    return trackEvent('voice_conversation_start', null, null, null, {
      agent_id: agentId,
      action: 'start',
      ...properties,
    });
  },

  voiceConversationEnd: async (agentId, duration, properties = {}) => {
    return trackEvent('voice_conversation_end', null, null, null, {
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
  autopilotUpgradeDialog: async (action, properties = {}) => {
    return trackEvent('autopilot_upgrade_dialog', null, null, null, {
      action,
      ...properties,
    });
  },

  // Custom event tracking
  track: async (eventName, properties = {}) => {
    return trackEvent(eventName, null, null, null, properties);
  },

  // Set user properties - handled via identify() for Supabase
  setUserProperties: async () => {
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
