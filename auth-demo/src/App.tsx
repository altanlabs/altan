import React, { useState } from "react";
import { SignIn, SignUp, UserProfile, useAuth } from "@altanlabs/auth";

function App() {
  const { user, isAuthenticated } = useAuth();
  console.log("user", user)
  console.log("isAuthenticated", isAuthenticated);

  const [showSignIn, setShowSignIn] = useState(true);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserProfile
          appearance={{
            theme: "dark",
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showSignIn ? (
        <SignIn
          appearance={{
            theme: "dark",
          }}
          signUpUrl="#sign-up"
          onSignUpClick={() => setShowSignIn(false)}
        />
      ) : (
        <SignUp
          appearance={{
            theme: "dark",
          }}
          signInUrl="#sign-in"
          onSignInClick={() => setShowSignIn(true)}
        />
      )}
    </div>
  );
}

export default App;

