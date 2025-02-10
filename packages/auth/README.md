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

2. Backend fields (for reference):
```typescript
interface DatabaseFields {
  email: string;          // User's email address
  password: string;       // Hashed password (handled automatically)
  email_verified: boolean; // Email verification status
  display_name?: string;  // Optional display name
  photo_url?: string;     // Optional profile photo URL
}
```

3. Frontend interface (what you'll work with):
```typescript
interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}
```

### Field Mappings

By default, the library handles the mapping between frontend camelCase and backend snake_case fields automatically. The default mapping is:

```typescript
const defaultMapping = {
  email: "email",
  password: "password",
  emailVerified: "email_verified",
  displayName: "display_name",
  photoUrl: "photo_url"
};
```

If your backend uses different field names, you can override these mappings:

```tsx
function App() {
  return (
    <AuthProvider
      tableId="your-users-table-id"
      fieldMapping={{
        // Example: mapping to different backend fields
        password: "password_hash",
        emailVerified: "is_verified",
        displayName: "username",
        photoUrl: "avatar_url"
      }}
    >
      <YourApp />
    </AuthProvider>
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
  tableId: string;                        // Your Users table UUID
  storageKey?: string;                    // Key for localStorage (default: "auth_user")
  onAuthStateChange?: (user: AuthUser | null) => void;  // Callback for auth state changes
  authenticationOptions?: {
    persistSession?: boolean;              // Enable session persistence (default: true)
    redirectUrl?: string;                  // Login page URL (default: "/login")
  };
  fieldMapping?: FieldMapping;             // Custom field name mappings
}
```

## Features

- Secure cookie-based authentication
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