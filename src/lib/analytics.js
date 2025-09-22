import posthog from 'posthog-js';

// PostHog configuration
export const initializePostHog = () => {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  const isDev = import.meta.env.DEV;

  if (posthogKey && posthogHost) {
    try {
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
        disabled: isDev,
        // Debug mode in development
        debug: isDev,
      });

      console.log('PostHog initialized successfully');

      // Make PostHog available globally for debugging
      window.posthog = posthog;
    } catch (error) {
      console.error('PostHog initialization failed:', error);
    }
  } else {
    console.warn('PostHog configuration missing. Analytics will be disabled.', {
      missingKey: !posthogKey,
      missingHost: !posthogHost,
    });
  }
};

// Analytics event tracking functions
export const analytics = {
  // User authentication events
  identify: (userId, userProperties = {}) => {
    if (!userId) {
      console.warn('PostHog identify called without userId');
      return;
    }

    // Convert userId to string as PostHog expects distinct_id as string
    const distinctId = String(userId);

    // Use PostHog's standard person properties with $set
    const standardProperties = {
      $set: {
        email: userProperties.email,
        first_name: userProperties.first_name,
        last_name: userProperties.last_name,
        is_superadmin: userProperties.is_superadmin,
        // Add any custom properties
        ...Object.fromEntries(
          Object.entries(userProperties).filter(([key]) =>
            !['email', 'first_name', 'last_name', 'is_superadmin'].includes(key),
          ),
        ),
      },
      // Use $set_once for properties that should only be set on first identification
      $set_once: {
        first_seen_method: userProperties.method,
        signup_date: userProperties.signup_date,
      },
    };

    // Remove undefined values to keep the payload clean
    Object.keys(standardProperties.$set).forEach((key) => {
      if (standardProperties.$set[key] === undefined) {
        delete standardProperties.$set[key];
      }
    });

    Object.keys(standardProperties.$set_once).forEach((key) => {
      if (standardProperties.$set_once[key] === undefined) {
        delete standardProperties.$set_once[key];
      }
    });

    // Remove empty objects
    if (Object.keys(standardProperties.$set).length === 0) {
      delete standardProperties.$set;
    }
    if (Object.keys(standardProperties.$set_once).length === 0) {
      delete standardProperties.$set_once;
    }

    posthog.identify(distinctId, standardProperties);

    console.log('PostHog user identified:', {
      distinctId,
      properties: standardProperties,
    });
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
    // Use PostHog's person properties API correctly
    const standardProperties = {
      $set: {
        ...properties,
      },
    };

    // Remove undefined values
    Object.keys(standardProperties.$set).forEach((key) => {
      if (standardProperties.$set[key] === undefined) {
        delete standardProperties.$set[key];
      }
    });

    if (Object.keys(standardProperties.$set).length > 0) {
      posthog.capture('$set', standardProperties);
    }
  },

  // Reset user session (on logout)
  reset: () => {
    posthog.reset();
  },
};

export default analytics;
