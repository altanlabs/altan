# @altanlabs/auth

Simple authentication for React apps.

## Installation

```bash
npm install @altanlabs/auth
```

## Setup

1. Import the required styles in your app's entry point (e.g., App.tsx or index.tsx):
```tsx
import "@altanlabs/auth/dist/styles.css";
```

2. Configure your Users table UUID:
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
// Media object for attachments (like avatar)
interface MediaObject {
  id?: string;
  file_name: string;
  mime_type: string;
  size?: number;
  url?: string;
  file_content?: string;
}

// Main user type
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  avatar?: MediaObject[];
  verified: boolean;
  [key: string]: any; // Additional fields from your users table
}

// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
interface RegisterCredentials extends LoginCredentials {
  name?: string;
  surname?: string;
  [key: string]: any; // Additional registration fields
}

// Auth context value (returned by useAuth hook)
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  continueWithGoogle: () => Promise<void>;
}
```

## Components

The library provides pre-built components for common authentication flows:

### SignIn Component

```tsx
import { SignIn } from '@altanlabs/auth';

function LoginPage() {
  return (
    <SignIn
      appearance={{ theme: 'light' }}
      companyName="Your Company"
      signUpUrl="/sign-up"
      withSignUp={true}
      routing="path"
    />
  );
}
```

### SignUp Component

```tsx
import { SignUp } from '@altanlabs/auth';

function SignUpPage() {
  return (
    <SignUp
      appearance={{ theme: 'light' }}
      companyName="Your Company"
      signInUrl="/sign-in"
      withSignIn={true}
      routing="path"
    />
  );
}
```

### UserProfile Component

```tsx
import { UserProfile } from '@altanlabs/auth';

function ProfilePage() {
  return (
    <UserProfile
      appearance={{ theme: 'light' }}
      showCustomFields={true}
      editableFields={['name', 'surname', 'email']}
      hiddenFields={['password']}
      fallback={<div>Please log in</div>}
    />
  );
}
```

### Logout Component

```tsx
import { Logout } from '@altanlabs/auth';

function NavBar() {
  return (
    <Logout 
      appearance={{ theme: 'light' }}
      onLogout={() => console.log('User logged out')}
      className="my-custom-class"
    />
  );
}
```

### Component Props

#### SignIn Props
```typescript
interface SignInProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  companyName?: string;
  routing?: 'hash' | 'path';
  path?: string;
  signUpUrl?: string;
  withSignUp?: boolean;
  initialValues?: {
    emailAddress?: string;
    password?: string;
  };
}
```

#### SignUp Props
```typescript
interface SignUpProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  companyName?: string;
  routing?: 'hash' | 'path';
  path?: string;
  signInUrl?: string;
  withSignIn?: boolean;
  initialValues?: {
    emailAddress?: string;
    password?: string;
  };
}
```

#### UserProfile Props
```typescript
interface UserProfileProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  routing?: 'hash' | 'path';
  path?: string;
  showCustomFields?: boolean;
  editableFields?: string[];
  hiddenFields?: string[];
  fallback?: React.ReactNode;
}
```

#### Logout Props
```typescript
interface LogoutProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  onLogout?: () => void;
  className?: string;
}
```

## Using the Auth Hook

```