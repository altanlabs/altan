# Cookie Banner Component

A fully EU GDPR-compliant cookie banner implementation for the Altan UI project. This component provides users with granular control over cookie preferences and ensures compliance with European privacy regulations.

## Features

### ✅ EU GDPR Compliance
- **Granular Consent**: Users can accept/reject specific cookie categories
- **Explicit Consent**: No pre-ticked boxes, users must actively consent
- **Easy Withdrawal**: Users can change preferences at any time
- **Clear Information**: Transparent about what cookies are used for

### 🎨 Design Features
- **Glassmorphic Design**: Subtle, elegant background with backdrop blur [[memory:5082936]]
- **Tailwind CSS Styling**: Consistent with project styling standards [[memory:5082933]]
- **Responsive**: Works on all screen sizes
- **Smooth Animations**: Framer Motion animations for better UX

### 🔧 Technical Features
- **One-time Display**: Only shows once per user (stored in localStorage)
- **Persistent Preferences**: Remembers user choices across sessions
- **Event-driven**: Dispatches events when consent is granted
- **TypeScript Ready**: Full type support available

## Components

### CookieBanner
Main banner component that appears at the bottom of the screen.

### CookieSettings
Advanced settings dialog for granular cookie control.

### CookieManager
Utility component that initializes cookie-dependent services based on user consent.

## Usage

The cookie banner is automatically integrated into the main App.jsx file and will show on first visit.

```jsx
import CookieBanner from './components/cookie-banner';
import CookieManager from './components/cookie-banner/CookieManager';

function App() {
  return (
    <div>
      {/* Your app content */}
      <CookieBanner />
      <CookieManager />
    </div>
  );
}
```

### Using the Hook

```jsx
import useCookieConsent from './hooks/useCookieConsent';

function MyComponent() {
  const { hasConsent, canUseAnalytics, canUseMarketing } = useCookieConsent();

  useEffect(() => {
    if (canUseAnalytics()) {
      // Initialize analytics
    }
  }, [canUseAnalytics]);
}
```

### Conditional Script Loading

```jsx
import { executeWithConsent } from './hooks/useCookieConsent';

// Only execute if user has given analytics consent
executeWithConsent(() => {
  gtag('config', 'GA_MEASUREMENT_ID');
}, 'analytics', preferences);
```

## Cookie Categories

### Necessary Cookies
- **Always enabled** (cannot be disabled)
- Essential for website functionality
- Examples: Session cookies, authentication, security

### Functional Cookies
- **Optional**
- Enable enhanced functionality
- Examples: Language preferences, theme settings, chat widgets

### Analytics Cookies
- **Optional**
- Help understand user behavior
- Examples: Google Analytics, PostHog, Microsoft Clarity

### Marketing Cookies
- **Optional**
- Used for advertising and tracking
- Examples: Facebook Pixel, Google Ads, retargeting

## Storage

The component uses localStorage to persist user preferences:

- `altan-cookie-consent`: Consent status ('accepted', 'necessary-only', 'customized')
- `altan-cookie-preferences`: Detailed preferences object with timestamp

## Events

The component dispatches a `cookieConsentGranted` event when consent is given:

```javascript
window.addEventListener('cookieConsentGranted', (event) => {
  const preferences = event.detail;
  // Initialize services based on preferences
});
```

## Privacy Policy Integration

The banner links to `/privacy-policy` which includes detailed information about cookie usage. Make sure to add this route to your router configuration.

## Customization

The component uses Material-UI theming and can be customized through your theme configuration. All colors, spacing, and typography follow your theme settings.

## Browser Support

- Modern browsers with localStorage support
- Graceful degradation for older browsers
- Mobile-responsive design

## Compliance Notes

This implementation follows GDPR requirements:

1. **Lawful Basis**: Consent is requested before non-essential cookies
2. **Transparency**: Clear information about cookie usage
3. **Control**: Users can accept/reject specific categories
4. **Withdrawal**: Easy to change preferences
5. **Record Keeping**: Preferences are timestamped and stored

Remember to also implement server-side compliance measures and update your privacy policy accordingly.

