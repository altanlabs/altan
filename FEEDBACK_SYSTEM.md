# Feedback System Documentation

## Overview
A comprehensive feedback collection system that intelligently prompts users for feedback at key moments without being intrusive.

## Components

### 1. **FeedbackManager** (`src/components/feedback/FeedbackManager.jsx`)
The orchestrator component that decides when and what feedback to show.

**Features:**
- Listens for plan completion events
- Periodically shows NPS surveys
- Manages feedback priority (plan completion > NPS)
- Tracks user activity
- Prevents feedback overload

### 2. **PlanCompletionFeedback** (`src/components/feedback/PlanCompletionFeedback.jsx`)
Shows after a plan completes execution.

**User Flow:**
1. "Did this plan achieve what you wanted?" → Yes/No
2. If "Yes" → Thanks and close
3. If "No" → Ask for comment about what went wrong

**Analytics Events:**
- `plan_completion_feedback` - Initial response
- `plan_completion_feedback_submitted` - Full submission
- `plan_completion_feedback_dismissed` - User closed without responding

### 3. **NPSFeedback** (`src/components/feedback/NPSFeedback.jsx`)
Net Promoter Score survey shown periodically to active users.

**User Flow:**
1. "How likely are you to recommend Altan?" → 0-10 scale
2. Follow-up question based on score:
   - Promoters (9-10): "What do you love most?"
   - Passives (7-8): "What would make you more likely to recommend?"
   - Detractors (0-6): "What's the main reason for your score?"

**Frequency Rules:**
- Minimum 7 days between NPS surveys
- Minimum 14 days between any feedback
- Max 3 dismissals before stopping
- 20% random chance when conditions are met

**Analytics Events:**
- `nps_score_selected` - Score chosen
- `nps_feedback_submitted` - Full submission with comment
- `nps_feedback_dismissed` - User closed without responding

### 4. **QuickFeedback** (`src/components/feedback/QuickFeedback.jsx`)
Simple thumbs up/down for feature-specific feedback.

**Usage Example:**
```jsx
import { QuickFeedback } from '../components/feedback';

// Show after user creates their first agent
<QuickFeedback
  feedbackKey="agent_creation_first"
  title="How was creating your first agent?"
  onClose={() => setShowFeedback(false)}
/>
```

**Analytics Events:**
- `quick_feedback` - Thumbs up/down response
- `quick_feedback_dismissed` - User closed without responding

### 5. **FeedbackPopup** (`src/components/feedback/FeedbackPopup.jsx`)
Reusable popup component with consistent styling.

**Features:**
- Bottom-right positioning (like cookie banner)
- Slide-in animation
- Dark theme matching app design
- Mobile responsive
- Optional close button

## Utilities (`src/lib/feedbackUtils.js`)

### LocalStorage Management
```javascript
{
  "altan-feedback-state": {
    "lastNPSShown": "2024-01-15T10:30:00Z",
    "npsDismissCount": 2,
    "feedbackGiven": {
      "plan_completion_abc123": true,
      "agent_creation_first": true,
      "nps_2024_01": true
    },
    "lastFeedbackDate": "2024-01-15T10:30:00Z",
    "totalFeedbackGiven": 5,
    "lastNPSScore": 9
  }
}
```

### Key Functions
- `shouldShowNPS()` - Check if NPS should be shown
- `hasFeedbackBeenGiven(key)` - Check if specific feedback was given
- `markFeedbackGiven(key, metadata)` - Mark feedback as complete
- `markFeedbackDismissed(type)` - Track dismissals
- `updateLastActivity()` - Track user activity
- `getNPSCategory(score)` - Categorize NPS score

## Analytics Events Tracked

### Feedback Events
| Event | When | Properties |
|-------|------|-----------|
| `plan_completion_feedback` | User responds yes/no to plan satisfaction | `plan_id`, `satisfied`, `step` |
| `plan_completion_feedback_submitted` | Full feedback submitted | `plan_id`, `satisfied`, `has_comment`, `comment` |
| `plan_completion_feedback_dismissed` | Feedback closed without response | `plan_id`, `step` |
| `nps_score_selected` | User selects NPS score | `score`, `category` |
| `nps_feedback_submitted` | NPS submitted with comment | `score`, `category`, `has_comment`, `comment` |
| `nps_feedback_dismissed` | NPS closed without response | `step`, `score` |
| `quick_feedback` | Thumbs up/down response | `feedback_key`, `satisfied` |
| `quick_feedback_dismissed` | Quick feedback closed | `feedback_key` |

### Other Analytics Events
| Event | When | Properties |
|-------|------|-----------|
| `created_chat` | New chat/thread created | - |
| `created_agent` | Agent created | `agent_id`, `agent_type`, `goal`, `industry`, `has_voice`, `created_from` |
| `updated_agent` | Agent updated | `agent_id`, `updated_fields` |
| `created_mcp_server` | MCP server created | `server_id`, `server_type`, `has_env_vars`, `has_args` |
| `updated_mcp_server` | MCP server updated | `server_id`, `updated_fields` |
| `connected_agent_to_mcp_server` | Agent connected to MCP | `server_id`, `agent_id`, `access_level` |
| `approved_plan` | Plan approved/rejected | `plan_id`, `approved`, `task_count` |

## Integration

The FeedbackManager is integrated in `App.jsx`:

```jsx
<SnackbarProvider>
  <Router />
  <CookieBanner />
  <CookieManager />
  <FeedbackManager />  {/* ← Feedback system */}
</SnackbarProvider>
```

## Future Enhancements

### Suggested Additions
1. **Feature Milestones**
   - After 5 successful chats
   - After first MCP server connection
   - After creating 3 agents

2. **Problem Detection**
   - Multiple failed API calls
   - User deletes multiple agents quickly
   - Long periods of inactivity

3. **Exit Intent**
   - Detect when user might be leaving
   - "Having trouble? Need help?"

4. **In-App Messaging**
   - Celebrate user achievements
   - Announce new features
   - Share tips and best practices

### Usage Examples

```jsx
// Add to agent creation success
import { QuickFeedback } from '../components/feedback';

const [showAgentFeedback, setShowAgentFeedback] = useState(false);

useEffect(() => {
  if (agentCreated && isFirstAgent) {
    setShowAgentFeedback(true);
  }
}, [agentCreated, isFirstAgent]);

{showAgentFeedback && (
  <QuickFeedback
    feedbackKey="agent_creation_first"
    title="How was creating your first agent?"
    description="We'd love to know how the experience was!"
    onClose={() => setShowAgentFeedback(false)}
  />
)}
```

## Best Practices

1. **Don't Over-Survey**
   - Respect the frequency limits
   - Give users the option to skip
   - Track dismissals and back off

2. **Context Matters**
   - Ask at relevant moments
   - Keep questions specific
   - Make it quick and easy

3. **Act on Feedback**
   - Review feedback regularly
   - Identify patterns
   - Close the loop with users

4. **Measure Impact**
   - Track completion rates
   - Monitor NPS trends
   - Correlate feedback with behavior

## Testing

To test the feedback system:

1. **Plan Completion:**
   - Complete a plan
   - Feedback should appear in bottom-right

2. **NPS Survey:**
   - Clear localStorage: `localStorage.removeItem('altan-feedback-state')`
   - Wait 30 seconds after page load
   - 20% chance it will appear

3. **Quick Feedback:**
   - Implement in a feature
   - Test dismiss and submit flows

## Troubleshooting

**Feedback not showing:**
- Check localStorage for feedback state
- Verify frequency limits haven't been hit
- Check console for errors

**Multiple feedbacks appearing:**
- FeedbackManager has priority system
- Only one feedback shown at a time
- Plan completion > NPS

**Analytics not tracking:**
- Verify analytics is initialized
- Check network tab for events
- Review analytics.js implementation

