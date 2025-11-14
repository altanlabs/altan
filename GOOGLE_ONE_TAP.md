# Google One Tap Implementation

## Overview

Google One Tap has been successfully implemented to provide a seamless, proactive sign-in experience for users. This feature shows either:
- The user's **last used Google account** for quick re-authentication
- A **proactive popup** prompting new users to sign in with Google

## What is Google One Tap?

Google One Tap is a streamlined authentication experience that:
- Automatically appears when users visit your site (if they're not authenticated)
- Shows their most recently used Google account
- Allows one-click sign-in without redirects or popups
- Works seamlessly across devices where the user is signed into Google

## Implementation Details

### Files Modified

1. **`src/App.jsx`**
   - Wrapped the app with `GoogleOAuthProvider`
   - Added `GoogleOneTap` component to the component tree

2. **`src/components/auth/GoogleOneTap.jsx`** (NEW)
   - Core One Tap implementation
   - Handles the credential response from Google
   - Sends the ID token to your backend via `/oauth/google/mobile` endpoint
   - Manages analytics tracking

3. **`src/sections/auth/AuthDialog.jsx`**
   - Kept the manual "Continue with Google" button for explicit sign-in
   - Removed One Tap logic from dialog (now at app level)

4. **`index.html`**
   - Added `<div id="google-one-tap"></div>` container for the One Tap UI

### How It Works

```
User visits site (not authenticated)
         ↓
Google One Tap appears automatically
         ↓
User clicks on their Google account
         ↓
Credential (JWT ID token) sent to backend
         ↓
Backend validates & creates session
         ↓
User is authenticated & page reloads
```

### Configuration

The One Tap component uses these settings:

```javascript
{
  auto_select: true,              // Auto-select for returning users
  cancel_on_tap_outside: true,    // Dismiss if user clicks outside
  disabled: isAuthenticated,      // Only show when not logged in
  use_fedcm_for_prompt: true,     // Use FedCM API for better UX
}
```

### Backend Integration

The One Tap sends the credential to:
- **Endpoint**: `/oauth/google/mobile` (via `optimai_auth`)
- **Payload**: 
  ```json
  {
    "idToken": "JWT_TOKEN_FROM_GOOGLE",
    "accessToken": null,
    "invitation_id": null,
    "idea_id": null,
    "tracking_params": {...}
  }
  ```

## User Experience

### For Returning Users
1. They see their Google account displayed in a small popup
2. One click logs them in
3. Page reloads with authenticated session

### For New Users
1. They see the One Tap prompt with "Continue with Google"
2. Can choose their Google account
3. Complete sign-in with one tap

### Fallback Option
- The manual "Continue with Google" button in the AuthDialog remains available
- Users can still explicitly click to sign in if they dismiss the One Tap prompt

## Analytics Tracking

The following events are tracked:
- `Google One Tap Sign In Attempted`
- `Google One Tap Sign In Success`
- `Google One Tap Sign In Failed`

## Testing

To test:
1. **First-time user**: Visit the site in incognito mode (signed into Google)
2. **Returning user**: Visit after previously signing in with Google
3. **Multiple accounts**: Test with multiple Google accounts to see account chooser

## Notes

- One Tap only shows when the user is **not authenticated**
- It respects Google's cooldown periods (won't show too frequently if dismissed)
- Works best on sites with HTTPS (required by Google)
- The Client ID used: `389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com`

## Future Enhancements

Potential improvements:
1. Add support for invitation_id and idea_id in One Tap flow
2. Create a dedicated backend endpoint for One Tap (instead of reusing mobile endpoint)
3. Add user preferences to disable One Tap
4. Implement "Skip for now" tracking to avoid annoying users

