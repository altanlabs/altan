## **@altanlabs/auth**

A simple drop-in auth provider for your apps built with `react-router-dom`. Handles user sign in, sign up, profile, and logout – all connected to your Altan users table.

---

### ✅ Setup

Wrap your app with `AuthProvider` and pass your **Users Table ID**:

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

### 🔐 Sign In Page (with redirect logic)

You **must manually redirect authenticated users** if they try to access the Sign In page:

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

### 🆕 Sign Up Page (with redirect logic)

Also redirect authenticated users away from the Sign Up page:

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

A user-only page to manage their account. Automatically redirects if user is not logged in (using `fallback`):

```jsx
import { UserProfile } from "@altanlabs/auth";

function ProfilePage() {
  return (
    <UserProfile
      appearance={{ theme: "dark" }}
      showCustomFields
      editableFields={["name", "surname", "email"]}
      hiddenFields={["password"]}
      fallback={<div>Please log in</div>}
    />
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

Access the current user and perform actions like logout:

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

- You **must manually handle redirects** using `Navigate` from `react-router-dom` in your sign in/sign up pages.
- `AuthProvider` automatically keeps your user state in sync and provides `user`, `logout`, and other helpers via `useAuth`.
