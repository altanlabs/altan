### ✅ Setup

Wrap your app with `AuthProvider` and pass your **Users Table ID**:
IMPORTANT TO IMPORT THE STYLES!!!

```jsx
import "@altanlabs/auth/dist/styles.css";
import { AuthProvider } from "@altanlabs/auth";

function App() {
  return (
    <AuthProvider tableId="your-users-table-id">
      <YourApp />
    </AuthProvider>
  );
}
```

---

### 🛡️ Auth Guard (Best Practice)

To protect private routes, use an Auth Guard component:

```jsx
import { useAuth } from '@altanlabs/auth';
import { Navigate, useLocation } from 'react-router-dom';

export function AuthGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

### 🔐 Sign In Page

The Sign In page should redirect authenticated users away automatically:

```jsx
import { SignIn, useAuth } from "@altanlabs/auth";
import { Navigate } from "react-router-dom";

export default function SignInPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <SignIn
        appearance={{ theme: "dark" }}
        companyName="Your Company"
        signUpUrl="/sign-up"
        withSignUp
        routing="path"
      />
    </div>
  );
}
```

---

### 🆕 Sign Up Page

The Sign Up page should also redirect authenticated users automatically:

```jsx
import { SignUp, useAuth } from "@altanlabs/auth";
import { Navigate } from "react-router-dom";

export default function SignUpPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <SignUp
        appearance={{ theme: "dark" }}
        companyName="Your Company"
        signInUrl="/sign-in"
        withSignIn
        routing="path"
      />
    </div>
  );
}
```

---

### 👤 User Profile

Protect your user profile page with the Auth Guard:

```jsx
import { UserProfile } from "@altanlabs/auth";
import { AuthGuard } from "./AuthGuard";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <UserProfile
        appearance={{ theme: "dark" }}
        showCustomFields
        editableFields={["name", "surname", "email"]}
        hiddenFields={["password"]}
        fallback={<div>Please log in</div>}
      />
    </AuthGuard>
  );
}
```

---

### 🚪 Logout Button

Add a logout button anywhere in your app:

```jsx
import { Logout } from "@altanlabs/auth";

function NavBar() {
  return (
    <Logout
      appearance={{ theme: "dark" }}
      onLogout={() => console.log("User logged out")}
    />
  );
}
```

---

### 🪝 Auth Hook

Access the current user and manage auth state:

```jsx
import { useAuth } from "@altanlabs/auth";

function ProfileButton() {
  const { user, logout } = useAuth();

  if (!user) {
    return <button onClick={() => (window.location.href = "/sign-in")}>Sign In</button>;
  }

  return (
    <div>
      <span>Welcome, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

### 📌 Notes

- Always protect private routes with `AuthGuard` for consistent and secure user experiences.
- `AuthProvider` automatically syncs auth state, providing easy access to `user`, `logout`, and more via `useAuth`.

