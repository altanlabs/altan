import React, { useState } from "react";
import { SignIn, SignUp, UserProfile, useAuth } from "@altanlabs/auth";

function App() {
  const { user, isAuthenticated } = useAuth();
  console.log("user", user)
  console.log("isAuthenticated", isAuthenticated);

  const [showSignIn, setShowSignIn] = useState(true);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-md mx-auto pt-8 px-4">
          <UserProfile
            appearance={{
              theme: "dark",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="pt-8 px-4">
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
    </div>
  );
}

export default App;

