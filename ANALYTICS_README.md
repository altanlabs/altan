# PostHog Analytics Integration

This document describes the PostHog analytics integration implemented in the Altan UI project.

## Overview

PostHog has been integrated to provide comprehensive analytics tracking throughout the application. The integration includes:

- User authentication events (sign up, sign in, sign out)
- Page view tracking
- Agent and AI interaction analytics  
- Form completion tracking
- Feature usage metrics
- Error tracking
- Performance monitoring
- Custom event tracking

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```env
VITE_PUBLIC_POSTHOG_KEY=phc_452Hr6sI9nuDxxAGn7pEUiCErOuUuDzvXhNsZsEFI1b
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Initialization

PostHog is automatically initialized when the app starts in `src/main.jsx`. The configuration includes:

- Session recording (with password masking)
- Automatic pageview capture
- Performance metrics capture
- Autocapture for clicks and form submissions
- Disabled in development mode

## File Structure

```
src/
├── lib/
│   └── analytics.js          # Core PostHog configuration and event functions
├── hooks/
│   └── useAnalytics.js       # React hook for easy analytics access
├── components/
│   └── analytics/
│       ├── PageTracker.jsx   # Automatic page view tracking component
│       └── AnalyticsExample.jsx # Example usage component
└── utils/
    └── analytics.js          # Legacy analytics utilities (enhanced with PostHog)
```

## Usage

### Using the Hook

The easiest way to track events is using the `useAnalytics` hook:

```jsx
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    analytics.trackButtonClicked('save_button', 'settings_page', {
      section: 'user_preferences',
      timestamp: new Date().toISOString(),
    });
  };

  return <button onClick={handleButtonClick}>Save Settings</button>;
};
```

### Direct Import

You can also import the analytics functions directly:

```jsx
import { analytics } from '../lib/analytics';

// Track a custom event
analytics.track('custom_event', {
  property1: 'value1',
  property2: 'value2',
});
```

## Available Events

### Authentication Events

```jsx
// User registration
analytics.signUp('email', { source: 'landing_page' });

// User login  
analytics.signIn('google', { returning_user: true });

// User logout
analytics.signOut({ session_duration: 1800 });

// User identification (automatically called on auth)
analytics.identify('user_123', {
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  plan: 'premium'
});
```

### Page Tracking

```jsx
// Manual page view (automatic with PageTracker component)
analytics.pageView('Dashboard', {
  section: 'overview',
  user_type: 'premium'
});
```

### Agent/AI Interactions

```jsx
// Agent created
analytics.agentCreated('chatbot', {
  template: 'customer_service',
  capabilities: ['text', 'voice']
});

// Agent interaction
analytics.agentInteraction('agent_123', 'message_sent', {
  message_length: 45,
  response_time: 1.2
});

// Voice interaction
analytics.voiceInteraction(30, {
  quality: 'high',
  language: 'en-US'
});
```

### UI Interactions

```jsx
// Button clicks
analytics.buttonClicked('create_agent', 'dashboard', {
  user_plan: 'premium'
});

// Menu navigation
analytics.menuItemClicked('settings', {
  previous_page: 'dashboard'
});

// Dashboard views
analytics.dashboardViewed('analytics', {
  filters_applied: ['date_range', 'user_type']
});
```

### Form Events

```jsx
// Form started
analytics.formStarted('user_registration', {
  page: 'signup',
  utm_source: 'google'
});

// Form completed
analytics.formCompleted('user_registration', {
  completion_time: 120,
  fields_filled: 5
});

// Form abandoned
analytics.formAbandoned('user_registration', 0.6, {
  exit_field: 'password_confirmation'
});
```

### Feature Usage

```jsx
// Feature usage
analytics.featureUsed('data_export', {
  export_type: 'csv',
  record_count: 1500
});
```

### Error Tracking

```jsx
// Error occurred
analytics.errorOccurred('api_error', 'Failed to save user preferences', {
  error_code: 500,
  endpoint: '/api/users/preferences'
});
```

### Performance Metrics

```jsx
// Performance tracking
analytics.performanceMetric('page_load_time', 2.3, {
  page: 'dashboard',
  connection_type: '4g'
});
```

## Automatic Tracking

### Page Views

Page views are automatically tracked using the `PageTracker` component in the router. It captures:

- Page name (derived from URL path)
- Full URL
- Search parameters
- Hash fragments

### Authentication Events

Authentication events are automatically tracked in the `JwtContext`:

- User sign up (email/Google)
- User sign in (email/Google) 
- User sign out
- User identification with profile data

### Form Interactions

Basic form interactions are automatically captured via PostHog's autocapture feature.

## Custom Properties

All events support custom properties for additional context:

```jsx
analytics.track('custom_event', {
  // Standard properties
  user_id: 'user_123',
  timestamp: new Date().toISOString(),
  
  // Custom properties
  feature_flag: 'new_ui_enabled',
  experiment_group: 'control',
  user_segment: 'power_user',
  
  // Context properties  
  page: window.location.pathname,
  referrer: document.referrer,
  user_agent: navigator.userAgent,
});
```

## Privacy & Compliance

### Data Collection

The integration respects user privacy:

- Disabled in development mode
- Password fields are masked in session recordings
- No sensitive data is tracked by default
- Users can opt out via PostHog's built-in mechanisms

### GDPR Compliance

PostHog provides GDPR compliance features:

- User data deletion
- Data export
- Consent management
- IP anonymization options

## Development & Testing

### Development Mode

Analytics are disabled in development mode to avoid polluting production data.

### Testing Events

Use the `AnalyticsExample` component to test event tracking:

```jsx
import AnalyticsExample from '../components/analytics/AnalyticsExample';

// Render in your development/testing page
<AnalyticsExample />
```

### Debugging

Check browser console for analytics debug logs. Events are also logged to localStorage for debugging:

```javascript
// View recent tracking logs
import { getTrackingLogs } from '../utils/analytics';
console.log(getTrackingLogs());

// Clear tracking logs
import { clearTrackingLogs } from '../utils/analytics';
clearTrackingLogs();
```

## PostHog Dashboard

Access your analytics data at: https://us.i.posthog.com

Key dashboards to create:

1. **User Journey**: Sign up → First action → Retention
2. **Feature Adoption**: Which features are used most
3. **Agent Performance**: AI interaction success rates  
4. **Error Tracking**: Application error rates and types
5. **Performance**: Page load times and user experience metrics

## Migration from Google Analytics

The integration maintains compatibility with existing Google Analytics tracking while adding PostHog capabilities. Both systems will track events during the transition period.

## Troubleshooting

### Events Not Appearing

1. Check that environment variables are set correctly
2. Verify PostHog is initialized (check browser network tab)
3. Ensure you're not in development mode
4. Check browser console for error messages

### Session Recording Issues

1. Verify session recording is enabled in PostHog project settings
2. Check that the domain is allowlisted
3. Ensure content security policy allows PostHog scripts

### Performance Impact

PostHog is designed to have minimal performance impact:

- Events are batched and sent asynchronously
- Session recordings are optimized for performance
- Consider reducing autocapture if needed for performance

## Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Properties**: Include relevant context without sensitive data
3. **User Identification**: Identify users as early as possible
4. **Custom Events**: Track business-specific metrics
5. **Testing**: Regularly test tracking in staging environment

## Support

For PostHog-specific issues, consult:
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Community](https://posthog.com/questions)
- PostHog Support (for paid plans)

For integration-specific issues, check the implementation files or contact the development team.
