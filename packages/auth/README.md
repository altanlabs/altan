# @altanlabs/auth

Simple authentication for React apps using @altanlabs/database.

## Installation

```bash
npm install @altanlabs/auth @altanlabs/database
```

## Setup

1. Configure your Users table UUID:
```tsx
const config = {
  API_BASE_URL: "https://api.example.com",
  SAMPLE_TABLES: {
    users: "0566cb6e-4de5-4004-a5a9-7220fda31600" // Your Users table UUID
  }
};
```

2. Required Users table fields:
```typescript
interface UserFields {
  email: string;          // User's email address
  password: string;       // Hashed password (handled automatically)
  emailVerified: boolean; // Email verification status
  displayName?: string;   // Optional display name
  photoURL?: string;      // Optional profile photo URL
  createdAt: string;      // Account creation timestamp
}
```

3. Wrap your app:
```tsx
function App() {
  return (
    <DatabaseProvider config={config}>
      <AuthProvider>
        <YourApp />
      </AuthProvider>
    </DatabaseProvider>
  );
}
```

## Usage

### Authentication Context

The `useAuth` hook provides access to the following:

```typescript
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

### User Registration
```tsx
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

  return (
    <button onClick={handleRegister} disabled={isLoading}>
      Register
    </button>
  );
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
        photoURL: "https://example.com/photo.jpg"
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
  storageKey?: string;                    // Key for localStorage (default: "auth_user")
  onAuthStateChange?: (user: AuthUser | null) => void;  // Callback for auth state changes
  authenticationOptions?: {
    persistSession?: boolean;              // Enable session persistence (default: true)
    redirectUrl?: string;                  // Login page URL (default: "/login")
  };
}
```

## Features

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