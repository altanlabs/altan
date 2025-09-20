import posthog from 'posthog-js';

// PostHog configuration
export const initializePostHog = () => {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      // Enable session recording
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
        },
      },
      // Capture pageviews automatically
      capture_pageview: true,
      // Capture performance metrics
      capture_performance: true,
      // Enable autocapture for clicks and form submissions
      autocapture: true,
      // Disable in development
      disabled: import.meta.env.DEV,
    });
  } else {
    console.warn('PostHog configuration missing. Analytics will be disabled.');
  }
};

// Analytics event tracking functions
export const analytics = {
  // User authentication events
  identify: (userId, userProperties = {}) => {
    posthog.identify(userId, userProperties);
  },

  // Page view tracking
  pageView: (pageName, properties = {}) => {
    posthog.capture('$pageview', {
      page_name: pageName,
      ...properties,
    });
  },

  // User authentication events
  signUp: (method = 'email', properties = {}) => {
    posthog.capture('user_signed_up', {
      method,
      ...properties,
    });
  },

  signIn: (method = 'email', properties = {}) => {
    posthog.capture('user_signed_in', {
      method,
      ...properties,
    });
  },

  signOut: (properties = {}) => {
    posthog.capture('user_signed_out', properties);
  },

  // Agent/AI related events
  agentCreated: (agentType, properties = {}) => {
    posthog.capture('agent_created', {
      agent_type: agentType,
      ...properties,
    });
  },

  agentInteraction: (agentId, interactionType, properties = {}) => {
    posthog.capture('agent_interaction', {
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
  errorOccurred: (errorType, errorMessage, properties = {}) => {
    posthog.capture('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
    });
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
    posthog.capture('create_project', {
      project_name: projectName,
      project_type: projectType,
      ...properties,
    });
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

  // UI/UX events
  autopilotUpgradeDialog: (action, properties = {}) => {
    posthog.capture('autopilot_upgrade_dialog', {
      action,
      ...properties,
    });
  },

  // Custom event tracking
  track: (eventName, properties = {}) => {
    posthog.capture(eventName, properties);
  },

  // Set user properties
  setUserProperties: (properties) => {
    posthog.people.set(properties);
  },

  // Reset user session (on logout)
  reset: () => {
    posthog.reset();
  },
};

export default analytics;
