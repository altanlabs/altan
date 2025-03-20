** @altanlabs/auth

### Setup

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

### Sign In

```jsx
import { SignIn } from "@altanlabs/auth";

function SignInPage() {
  return (
    <SignIn
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signUpUrl="/sign-up"
      withSignUp
      routing="path"
    />
  );
}
```

### Sign Up

```jsx
import { SignUp } from "@altanlabs/auth";

function SignUpPage() {
  return (
    <SignUp
      appearance={{ theme: "dark" }}
      companyName="Your Company"
      signInUrl="/sign-in"
      withSignIn
      routing="path"
    />
  );
}
```

### User Profile

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

### Logout

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

### Using the Hook

```jsx
import { useAuth } from "@altanlabs/auth";

function ProfileButton() {
  const { user, logout } = useAuth();

  if (!user) {
    return <button onClick={() => (window.location.href = "/login")}>Sign In</button>;
  }

  return (
    <div>
      <span>Welcome, {user.name}!</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```
