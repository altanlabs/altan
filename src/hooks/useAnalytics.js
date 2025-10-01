import { analytics } from '../lib/analytics';

/**
 * React hook for analytics tracking
 * Provides easy access to Supabase analytics throughout the app
 */
export const useAnalytics = () => {
  return {
    // Page tracking
    trackPageView: (pageName, properties) => analytics.pageView(pageName, properties),

    // User events
    trackSignUp: (method, properties) => analytics.signUp(method, properties),
    trackSignIn: (method, properties) => analytics.signIn(method, properties),
    trackSignOut: (properties) => analytics.signOut(properties),

    // Agent interactions
    trackAgentCreated: (agentType, properties) => analytics.agentCreated(agentType, properties),
    trackAgentInteraction: (agentId, interactionType, properties) => 
      analytics.agentInteraction(agentId, interactionType, properties),
    trackVoiceInteraction: (duration, properties) => analytics.voiceInteraction(duration, properties),

    // Navigation and UI
    trackDashboardViewed: (section, properties) => analytics.dashboardViewed(section, properties),
    trackMenuItemClicked: (menuItem, properties) => analytics.menuItemClicked(menuItem, properties),
    trackButtonClicked: (buttonName, location, properties) => 
      analytics.buttonClicked(buttonName, location, properties),

    // Feature usage
    trackFeatureUsed: (featureName, properties) => analytics.featureUsed(featureName, properties),

    // Form events
    trackFormStarted: (formName, properties) => analytics.formStarted(formName, properties),
    trackFormCompleted: (formName, properties) => analytics.formCompleted(formName, properties),
    trackFormAbandoned: (formName, completionRate, properties) => 
      analytics.formAbandoned(formName, completionRate, properties),

    // Error tracking
    trackError: (errorType, errorMessage, properties) => 
      analytics.errorOccurred(errorType, errorMessage, properties),

    // Performance
    trackPerformance: (metricName, value, properties) => 
      analytics.performanceMetric(metricName, value, properties),

    // E-commerce events
    trackBeginCheckout: (value, currency, items, properties) => 
      analytics.beginCheckout(value, currency, items, properties),
    trackPurchase: (transactionId, value, currency, items, properties) => 
      analytics.purchase(transactionId, value, currency, items, properties),
    trackGenerateLead: (leadType, properties) => analytics.generateLead(leadType, properties),

    // Project and template events
    trackCreateProject: (projectName, projectType, properties) => 
      analytics.createProject(projectName, projectType, properties),
    trackOpenProject: (projectId, projectName, properties) => 
      analytics.openProject(projectId, projectName, properties),
    trackCloneTemplate: (templateId, templateName, properties) => 
      analytics.cloneTemplate(templateId, templateName, properties),
    trackOpenTemplate: (templateId, templateName, properties) => 
      analytics.openTemplate(templateId, templateName, properties),

    // Account viewing events
    trackAccountViewed: (viewedAccountId, accountName, properties) => 
      analytics.accountViewed(viewedAccountId, accountName, properties),

    // Enhanced voice events
    trackVoiceConversationStart: (agentId, properties) => 
      analytics.voiceConversationStart(agentId, properties),
    trackVoiceConversationEnd: (agentId, duration, properties) => 
      analytics.voiceConversationEnd(agentId, duration, properties),

    // UI/UX events
    trackAutopilotUpgradeDialog: (action, properties) => 
      analytics.autopilotUpgradeDialog(action, properties),

    // User identification
    identify: (userId, userProperties) => analytics.identify(userId, userProperties),
    setUserProperties: (properties) => analytics.setUserProperties(properties),

    // Custom events
    track: (eventName, properties) => analytics.track(eventName, properties),

    // Session management
    reset: () => analytics.reset(),
  };
};

export default useAnalytics;
