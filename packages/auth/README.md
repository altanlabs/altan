# @altanlabs/auth

Simple authentication for React apps.

## Installation

```bash
npm install @altanlabs/auth
```

## Setup

1. Configure your Users table UUID:
```tsx
function App() {
  return (
    <AuthProvider tableId="your-users-table-id">
      <YourApp />
    </AuthProvider>
  );
}
```

## Available Types

The library exports the following TypeScript types:

```typescript
// Main user type
interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}

// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
interface RegisterCredentials extends LoginCredentials {
  displayName?: string;
}

// Auth context value (returned by useAuth hook)
interface AuthContextValue {
  user: AuthUser | null;         // Current user or null if not authenticated
  isLoading: boolean;            // Loading state for auth operations
  error: Error | null;           // Last error that occurred
  isAuthenticated: boolean;      // Quick check if user is logged in
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}
```

## Usage

### Authentication Context

The `useAuth` hook provides access to the authentication context:

```typescript
import { useAuth, type AuthUser } from '@altanlabs/auth';

function Profile() {
  const { user, updateProfile } = useAuth();

  const handleUpdateProfile = async () => {
    await updateProfile({
      displayName: "New Name",
      photoUrl: "https://example.com/photo.jpg"
    });
  };
}
```

### User Registration
```tsx
import { useAuth, type RegisterCredentials } from '@altanlabs/auth';

function RegisterPage() {
  const { register, error, isLoading } = useAuth();

  const handleRegister = async () => {
    try {
      await register({
        email: "user@example.com",
        password: "securepassword",
        displayName: "John Doe" // optional
      });
      // User will be automatically logged in after registration
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
}
```

### User Login
```tsx
function LoginPage() {
  const { login, error, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "securepassword"
      });
      // Redirect or update UI after successful login
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      Login
    </button>
  );
}
```

### Protected Routes
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### User Profile Management
```tsx
function Profile() {
  const { user, updateProfile, isLoading } = useAuth();

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        displayName: "New Name",
        photoUrl: "https://example.com/photo.jpg"
      });
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return user ? (
    <div>
      <h2>Welcome, {user.displayName || user.email}!</h2>
      <p>Email: {user.email}</p>
      <p>Verified: {user.emailVerified ? "Yes" : "No"}</p>
      <button onClick={handleUpdateProfile} disabled={isLoading}>
        Update Profile
      </button>
    </div>
  ) : null;
}
```

### Logout
```tsx
function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## Configuration Options

The `AuthProvider` component accepts the following props:

```typescript
interface AuthProviderProps {
  children: ReactNode;
  tableId: string;                        // Your Users table UUID
  storageKey?: string;                    // Key for localStorage (default: "auth_user")
  onAuthStateChange?: (user: AuthUser | null) => void;  // Callback for auth state changes
  authenticationOptions?: {
    persistSession?: boolean;              // Enable session persistence (default: true)
    redirectUrl?: string;                  // Login page URL (default: "/login")
  };
}
```

## Features

- Secure token-based authentication
- Email/Password authentication
- User registration with automatic login
- Protected routes
- Session persistence
- Profile management
- Authentication state management
- Loading and error states
- TypeScript support

## License

MIT License