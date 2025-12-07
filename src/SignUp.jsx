import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Coffee,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { signUpWithEmail } from "./supabaseAuth";

export default function SignUp({ onSignUpSuccess, onToggleMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Sign up with Supabase (with role)
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        fullName,
        role
      );

      if (signUpError) {
        setError(signUpError.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }

      // Show success message
      setSuccess(true);

      // Call success callback with user data
      onSignUpSuccess({
        id: data.user.id,
        email: data.user.email,
        fullName: fullName,
        role: role,
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        // Success state will be handled by parent component
      }, 1500);
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
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
          <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
            Create Account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border-2 border-green-400 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 text-sm">
                Account created successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-amber-700" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                disabled={loading}
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

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
                  className="w-full pl-10 pr-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  disabled={loading}
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
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-amber-700" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Toggle to Sign In */}
          <div className="mt-6 text-center border-t-2 border-amber-200 pt-6">
            <p className="text-amber-800">Already have an account?</p>
            <button
              onClick={onToggleMode}
              className="text-amber-600 hover:text-amber-700 font-bold underline mt-2"
            >
              Sign In
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
