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
  password: string;       // Hashed password
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

### Authentication
```tsx
function LoginPage() {
  const { login, error, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email, password });
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

### User Profile
```tsx
function Profile() {
  const { user } = useAuth();
  return user ? <div>Welcome, {user.email}!</div> : null;
}
```

## Features

- Email/Password authentication
- Protected routes
- Session persistence
- User registration
- Profile management

## API Reference

See our [API Documentation](link-to-detailed-docs) for complete details.

## License

MIT License