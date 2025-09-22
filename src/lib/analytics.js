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

    const distinctId = String(userId);

    const properties = {
      email: userProperties.email,
      first_name: userProperties.first_name,
      last_name: userProperties.last_name,
      $set: {
        ...userProperties // custom props
      },
      $set_once: {
        first_seen_method: userProperties.method,
        signup_date: userProperties.signup_date,
      }
    };

    posthog.identify(distinctId, properties);

    console.log('PostHog user identified:', {
      distinctId,
      properties,
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
    // Build properties object with standard PostHog person properties at top level
    const payload = {};

    // Standard person properties (sent at top level)
    const standardProps = ['email', 'first_name', 'last_name'];
    standardProps.forEach((prop) => {
      if (properties[prop] !== undefined) {
        payload[prop] = properties[prop];
      }
    });

    // Custom properties using $set
    const customProperties = Object.fromEntries(
      Object.entries(properties).filter(([key]) => !standardProps.includes(key) && properties[key] !== undefined),
    );

    if (Object.keys(customProperties).length > 0) {
      payload.$set = customProperties;
    }

    // Only send if we have properties to set
    if (Object.keys(payload).length > 0) {
      posthog.capture('$set', payload);
    }
  },

  // Alias user (link anonymous ID to known user ID)
  alias: (email, userId) => {
    if (!email || !userId) {
      console.warn('PostHog alias called without email or userId', { email, userId });
      return;
    }

    // Convert userId to string as PostHog expects distinct_id as string
    const distinctId = String(userId);

    posthog.alias(distinctId, email);

    console.log('PostHog user aliased:', {
      email,
      userId: distinctId,
    });
  },

  // Reset user session (on logout)
  reset: () => {
    posthog.reset();
  },
};

export default analytics;
