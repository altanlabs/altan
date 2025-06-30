# ElevenLabs Dynamic Variables Guide

## Overview

Dynamic variables allow you to inject runtime values into your ElevenLabs agent's system prompts, first messages, and tool parameters. This enables personalized conversations without creating multiple agents.

## Key Concepts

### 1. Variable Types

- **Regular Variables**: Used in system prompts, first messages, and tool parameters
- **Secret Variables**: Prefixed with `secret__`, only used in tool headers (never sent to LLM)
- **System Variables**: Automatically available (prefixed with `system__`)

### 2. Variable Syntax

Use double curly braces: `{{variable_name}}`

## Implementation

### 1. Frontend Setup

```javascript
// In your React component
const dynamicVariables = {
  // Regular variables
  user_name: "John Doe",
  subscription_tier: "premium",
  current_page: "dashboard",
  
  // Secret variables (for API authentication)
  secret__api_token: "your-secret-token",
  secret__user_id: "internal-user-123",
  
  // Boolean and numeric variables
  has_premium_access: true,
  max_queries: 100,
};

// Pass to conversation
startConversation({
  agentId: 'your-agent-id',
  dynamicVariables,
  // ... other options
});
```

### 2. Agent Configuration

#### System Prompt Example
```
You are an AI assistant for {{user_name}} who has {{subscription_tier}} access.

Current Context:
- Page: {{current_page}}
- Time: {{system__time_utc}}
- Conversation ID: {{system__conversation_id}}

{{#if has_premium_access}}
🌟 PREMIUM USER: You have access to advanced features.
Query limit: {{max_queries}} per session.
{{else}}
📝 BASIC USER: Limited features available.
{{/if}}

Provide personalized assistance based on their subscription level.
```

#### First Message Example
```
Hi {{user_name}}! I'm your personal assistant. I see you're currently on the {{current_page}} page. How can I help you today?
```

#### Tool Configuration Example
```json
{
  "name": "get_user_data",
  "parameters": {
    "user_id": "{{user_name}}",
    "tier": "{{subscription_tier}}"
  },
  "headers": {
    "Authorization": "Bearer {{secret__api_token}}",
    "X-Internal-User": "{{secret__user_id}}"
  }
}
```

## System Variables

ElevenLabs provides these automatic variables:

- `system__agent_id` - Unique agent identifier
- `system__conversation_id` - Conversation ID
- `system__time_utc` - Current UTC time
- `system__call_duration_secs` - Call duration
- `system__caller_id` - Phone number (voice calls)
- `system__called_number` - Destination number (voice calls)

## Best Practices

### 1. Variable Naming
- Use descriptive names: `user_subscription_tier` vs `tier`
- Use snake_case for consistency
- Prefix sensitive data with `secret__`

### 2. Data Types
- **Strings**: User names, IDs, descriptions
- **Numbers**: Limits, counts, durations
- **Booleans**: Feature flags, permissions

### 3. Security
- Always use `secret__` prefix for sensitive data
- Never put API keys in regular variables
- Validate data before passing to dynamic variables

### 4. Performance
- Keep variable names short but descriptive
- Limit the number of variables (recommended < 20)
- Cache computed values when possible

## Common Use Cases

### 1. User Personalization
```javascript
const dynamicVariables = {
  user_name: user.firstName,
  user_full_name: `${user.firstName} ${user.lastName}`,
  user_timezone: user.timezone,
  preferred_language: user.language,
};
```

### 2. Subscription Management
```javascript
const dynamicVariables = {
  subscription_tier: user.subscription.tier,
  features_available: user.subscription.features.join(', '),
  expiry_date: user.subscription.expiryDate,
  can_upgrade: user.subscription.tier !== 'enterprise',
};
```

### 3. Context Awareness
```javascript
const dynamicVariables = {
  current_page: window.location.pathname,
  last_action: userActivity.lastAction,
  session_duration: Math.floor(sessionTime / 60), // minutes
  unread_notifications: user.notifications.unread.length,
};
```

### 4. API Integration
```javascript
const dynamicVariables = {
  // Public data
  account_id: user.accountId,
  team_name: user.team.name,
  
  // Secret data for API calls
  secret__access_token: await getAccessToken(),
  secret__refresh_token: user.refreshToken,
  secret__internal_id: user.internalId,
};
```

## Conditional Logic in Prompts

Use Handlebars-style conditionals:

```handlebars
{{#if has_premium_access}}
You have premium access with {{max_api_calls}} API calls available.
{{else}}
You're on the basic plan. Upgrade for more features!
{{/if}}

{{#unless is_trial_expired}}
Your trial expires in {{days_remaining}} days.
{{/unless}}
```

## Troubleshooting

### Variables Not Replacing
- Check variable names are exact matches (case-sensitive)
- Ensure double curly braces: `{{variable_name}}`
- Verify variables are in your `dynamicVariables` object

### Type Errors
- Variables must be strings, numbers, or booleans
- Convert objects to JSON strings if needed: `JSON.stringify(object)`

### Secret Variables Not Working
- Ensure `secret__` prefix is used
- Check they're only used in tool headers, not prompts
- Verify they're passed in `dynamicVariables`

## Example Implementation

See the complete examples in:
- `examples/DynamicVariablesExample.jsx` - Basic implementation
- `examples/VoiceConversationWithDynamicVars.jsx` - Advanced usage with your VoiceConversation component

## Testing

1. Test with static values first
2. Add console.log to verify variables are passed correctly
3. Use ElevenLabs dashboard to test prompts with placeholder values
4. Verify secret variables don't appear in conversation logs

## Migration from Static Prompts

1. Identify hardcoded values in your prompts
2. Replace with `{{variable_name}}` syntax
3. Add corresponding variables to your frontend code
4. Test thoroughly with different user scenarios

---

For more information, see the [ElevenLabs Dynamic Variables Documentation](https://elevenlabs.io/docs/conversational-ai/customization/personalization/dynamic-variables). 