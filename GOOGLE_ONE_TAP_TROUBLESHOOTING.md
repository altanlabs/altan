# Google One Tap Troubleshooting

## Error: "Can't continue with google.com - Something went wrong"

This error typically means the current origin isn't authorized in your Google Cloud Console OAuth configuration.

### Quick Fix Steps

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Find Your OAuth 2.0 Client ID**
   - Look for: `389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com`
   - Click on it to edit

3. **Add Authorized JavaScript Origins**
   
   You need to add ALL the origins where your app runs:
   
   **For Development:**
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   http://127.0.0.1:3000
   ```
   
   **For Production:**
   ```
   https://altan.ai
   https://www.altan.ai
   https://app.altan.ai
   ```
   
   ⚠️ **Important**: 
   - Do NOT include trailing slashes
   - Use the exact port number you're running on
   - Include both `localhost` and `127.0.0.1` if needed

4. **Add Authorized Redirect URIs** (if needed)
   ```
   http://localhost:5173
   https://altan.ai
   https://www.altan.ai
   ```

5. **Save Changes**
   - Click "Save" at the bottom
   - Wait 1-2 minutes for changes to propagate

6. **Clear Browser Cache & Reload**
   - Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - Or clear your browser cache completely

### Check Current Origin

Open your browser console and run:
```javascript
console.log('Current Origin:', window.location.origin);
```

Make sure this EXACT value is in your Authorized JavaScript Origins list.

### Common Issues

1. **Port mismatch**: Running on `:5173` but only authorized `:3000`
2. **Protocol mismatch**: Using `http://` but authorized `https://` (or vice versa)
3. **Subdomain mismatch**: Running on `app.altan.ai` but only authorized `altan.ai`
4. **Trailing slash**: Don't add `/` at the end of origins
5. **Still cached**: Browser still using old credentials, clear cache

### Check Browser Console

After adding better logging, check your browser console for:
```
Google One Tap Failed: [error details]
Error details: [JSON error object]
```

This will show you the exact error from Google.

### Alternative: Disable One Tap Temporarily

If you need to disable One Tap while debugging, edit `src/App.jsx`:

```javascript
// Temporarily comment out:
// <GoogleOneTap />
```

The manual "Continue with Google" button in the AuthDialog will still work via the popup flow.

### Testing After Fix

1. Close all browser tabs with your app
2. Clear browser cache
3. Open in incognito/private window
4. Visit your app
5. One Tap should appear and work

### Still Not Working?

Check the following in Google Cloud Console:
- ✅ OAuth consent screen is configured
- ✅ OAuth consent screen status is "Published" (or "Testing" with your email added)
- ✅ "Google+ API" is enabled (legacy requirement)
- ✅ Your email is added as a test user (if in Testing mode)
- ✅ The Client ID matches exactly

### Need to Verify Your Configuration?

Your current Client ID from the code:
```
389448867152-le0q74dqqbiu5ekdvej0h6dav69bbd1p.apps.googleusercontent.com
```

This should match what you see in Google Cloud Console.

