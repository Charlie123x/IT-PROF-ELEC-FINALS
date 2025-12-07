import React, { useState, useEffect } from "react";
import DashboardPage from "./Dashboard";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import RoleSelection from "./RoleSelection";
import AdminDashboard from "./AdminDashboard";
import StaffDashboard from "./StaffDashboard";
import CustomerDashboard from "./CustomerDashboard";
import ChatBot from "./ChatBot";
import { onAuthStateChange, signOut } from "./supabaseAuth";

interface User {
  id: string;
  email: string;
  fullName?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [userRole, setUserRole] = useState<
    "admin" | "staff" | "customer" | null
  >(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes with Supabase
  useEffect(() => {
    const unsubscribe = onAuthStateChange(
      ({ user: supabaseUser }: { user: User | null; event: string }) => {
        if (supabaseUser) {
          setUser(supabaseUser);
          // Check for saved role in localStorage
          const savedRole = localStorage.getItem("userRole") as
            | "admin"
            | "staff"
            | "customer"
            | null;
          if (savedRole) {
            setUserRole(savedRole);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleSignInSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleSignUpSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleSelectRole = (role: "admin" | "staff" | "customer") => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
  };

  const handleChangeRole = () => {
    setUserRole(null);
    localStorage.removeItem("userRole");
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setUserRole(null);
    setAuthMode("signin");
    localStorage.removeItem("userRole");
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">☕</div>
          <p className="text-amber-900 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authMode === "signin" ? (
          <SignIn
            onSignInSuccess={handleSignInSuccess}
            onToggleMode={() => setAuthMode("signup")}
          />
        ) : (
          <SignUp
            onSignUpSuccess={handleSignUpSuccess}
            onToggleMode={() => setAuthMode("signin")}
          />
        )}
        <ChatBot />
      </>
    );
  }

  if (!userRole) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  if (userRole === "admin") {
    return (
      <>
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          onChangeRole={handleChangeRole}
        />
        <ChatBot />
      </>
    );
  }

  if (userRole === "staff") {
    return (
      <>
        <StaffDashboard
          user={user}
          onLogout={handleLogout}
          onChangeRole={handleChangeRole}
        />
        <ChatBot />
      </>
    );
  }

  if (userRole === "customer") {
    return (
      <>
        <CustomerDashboard
          user={user}
          onLogout={handleLogout}
          onChangeRole={handleChangeRole}
        />
        <ChatBot />
      </>
    );
  }

  return (
    <>
      <DashboardPage user={user} onLogout={handleLogout} />
      <ChatBot />
    </>
  );
}

export default App;
