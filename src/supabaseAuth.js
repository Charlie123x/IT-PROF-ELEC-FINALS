import { supabase } from "./supabase";

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @param {string} role - User role ('admin', 'staff', or 'customer')
 * @returns {Promise<{data, error}>}
 */
export const signUpWithEmail = async (
  email,
  password,
  fullName,
  role = "customer"
) => {
  try {
    // Sign up the user with role and full_name in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // 'admin' or 'staff'
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || "Sign up failed",
      },
    };
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{data, error}>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || "Sign in failed",
      },
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return {
      error: {
        message: err.message || "Sign out failed",
      },
    };
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<{user, error}>}
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error };
    }

    return {
      user: user
        ? {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || "",
          }
        : null,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: {
        message: err.message || "Failed to get user",
      },
    };
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function that receives user data
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || "",
        }
      : null;

    callback({ user, event });
  });

  return subscription?.unsubscribe;
};

/**
 * Reset password with email
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  } catch (err) {
    return {
      error: {
        message: err.message || "Password reset failed",
      },
    };
  }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{data, error}>}
 */
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || "Password update failed",
      },
    };
  }
};

// ==================== ROLE MANAGEMENT ====================

/**
 * Set or update user role
 * @param {string} userId - User ID from auth
 * @param {string} email - User email
 * @param {string} role - "admin" or "staff"
 * @param {string} fullName - User's full name
 * @returns {Promise<{data, error}>}
 */
export const setUserRole = async (userId, email, role, fullName = "") => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          email,
          role,
          full_name: fullName,
        },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || "Failed to set user role",
      },
    };
  }
};

/**
 * Get user role
 * @param {string} userId - User ID from auth
 * @returns {Promise<{role, error}>}
 */
export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // No row found
      return { role: null, error: null };
    }

    if (error) {
      return { role: null, error };
    }

    return { role: data?.role || null, error: null };
  } catch (err) {
    return {
      role: null,
      error: {
        message: err.message || "Failed to get user role",
      },
    };
  }
};

/**
 * Get all staff members (admin only)
 * @returns {Promise<{data, error}>}
 */
export const getAllStaff = async () => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("role", "staff")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err.message || "Failed to get staff",
      },
    };
  }
};

/**
 * Deactivate staff member (admin only)
 * @param {string} userId - Staff member user ID
 * @returns {Promise<{error}>}
 */
export const deactivateStaff = async (userId) => {
  try {
    const { error } = await supabase
      .from("user_roles")
      .update({ is_active: false })
      .eq("user_id", userId);

    return { error };
  } catch (err) {
    return {
      error: {
        message: err.message || "Failed to deactivate staff",
      },
    };
  }
};
