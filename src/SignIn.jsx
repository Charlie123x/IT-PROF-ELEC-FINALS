import React, { useState, useEffect } from "react";
import { Mail, Lock, Coffee, AlertCircle } from "lucide-react";
import { signInWithEmail } from "./supabaseAuth";

export default function SignIn({ onSignInSuccess, onToggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered email on component mount
  useEffect(() => {
    const rememberEmail = localStorage.getItem("rememberEmail");
    if (rememberEmail) {
      setEmail(rememberEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await signInWithEmail(
        email,
        password
      );

      if (signInError) {
        setError(signInError.message || "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Call success callback with user data
      onSignInSuccess({
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || "",
      });
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed top-10 left-10 text-6xl opacity-20 pointer-events-none animate-pulse">
        ☕
      </div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20 pointer-events-none">
        🧁
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-8 h-8 text-amber-900" />
            <h1 className="text-4xl font-bold text-amber-900">Charl</h1>
          </div>
          <p className="text-amber-700">Coffee Management System</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg border-4 border-amber-200 p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-center text-amber-700 mb-6 text-sm">
            Sign in to manage your coffee shop
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-amber-700" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 text-lg"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-amber-700" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 text-lg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-amber-600"
                disabled={loading}
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-amber-800"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Toggle to Sign Up */}
          <div className="mt-6 text-center border-t-2 border-amber-200 pt-6">
            <p className="text-amber-800">Don't have an account?</p>
            <button
              onClick={onToggleMode}
              className="text-amber-600 hover:text-amber-700 font-bold underline mt-2"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl text-center text-sm text-amber-800">
          📝 <strong>Demo Mode:</strong> Use any email/password to test the UI
        </div>
      </div>
    </div>
  );
}
