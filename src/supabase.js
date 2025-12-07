import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==================== MIGRATION HELPER ====================
// Note: This migration requires manual SQL execution in Supabase SQL Editor
// See PAYMENT_METHOD_MIGRATION.md for complete instructions
export const ensurePaymentMethodColumn = async () => {
  try {
    // Test if payment_method column exists by trying a simple select
    const { error } = await supabase
      .from("transactions")
      .select("payment_method")
      .limit(1);

    if (error && error.message.includes("payment_method")) {
      console.warn(
        "⚠️ MIGRATION NEEDED: payment_method column not found in database."
      );
      console.warn(
        "📖 See PAYMENT_METHOD_MIGRATION.md for detailed fix instructions."
      );
      console.warn(
        "🔧 Quick fix: Run this SQL in Supabase SQL Editor: ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash';"
      );
      return false;
    }

    console.log("✅ Database schema is up to date");
    return true;
  } catch (err) {
    console.error("Schema check error:", err);
    return false;
  }
};

// Run migration check on app load
ensurePaymentMethodColumn();

// ==================== MENU ITEMS ====================
export const getMenuItems = async () => {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};

// ==================== TRANSACTIONS ====================
export const createTransaction = async (transaction) => {
  try {
    // Validate items have IDs
    const itemsWithIds = transaction.items.filter((item) => item.id);

    if (!itemsWithIds.length) {
      throw new Error("Invalid items: missing menu item IDs");
    }

    console.log(
      "Creating transaction with payment method:",
      transaction.paymentMethod
    );
    console.log("Items to save:", itemsWithIds);

    // Prepare transaction data
    const transactionData = {
      transaction_date: new Date().toISOString().split("T")[0],
      transaction_time: new Date().toTimeString().split(" ")[0],
      total_amount: parseFloat(transaction.total.toFixed(2)),
      status: "completed",
    };

    // Try to include payment_method (will fail if column doesn't exist)
    if (transaction.paymentMethod) {
      transactionData.payment_method = (
        transaction.paymentMethod || "cash"
      ).toLowerCase();
    }

    const { data: transData, error: transError } = await supabase
      .from("transactions")
      .insert([transactionData])
      .select();

    // If error mentions payment_method column, show helpful message
    if (transError && transError.message.includes("payment_method")) {
      console.error("❌ Database Schema Error:", transError.message);
      throw new Error(
        `Database Error: The 'payment_method' column needs to be added to your Supabase database.\n\n` +
          `📖 FIX: Open PAYMENT_METHOD_MIGRATION.md in your project for step-by-step instructions.\n\n` +
          `🔧 Quick Fix: In Supabase SQL Editor, run:\n` +
          `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash';`
      );
    }

    if (transError) {
      console.error("Transaction insert error:", transError);
      throw transError;
    }

    if (!transData || transData.length === 0) {
      throw new Error("No transaction data returned");
    }

    const transactionId = transData[0].id;
    console.log("Transaction created with ID:", transactionId);

    // Insert transaction items
    const itemsToInsert = itemsWithIds.map((item) => ({
      transaction_id: transactionId,
      menu_item_id: item.id,
      quantity: item.quantity || 1,
      price_per_unit: parseFloat(item.price.toFixed(2)),
      subtotal: parseFloat((item.price * (item.quantity || 1)).toFixed(2)),
    }));

    console.log("Items to insert:", itemsToInsert);

    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Transaction items insert error:", itemsError);
      throw itemsError;
    }

    console.log("Transaction items inserted successfully");

    // Update daily statistics
    await updateDailyStatistics(transaction.total);

    return transactionId;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        transaction_items (
          id,
          menu_item_id,
          quantity,
          price_per_unit,
          subtotal
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};

// ==================== DAILY STATISTICS ====================
export const getDailyStatistics = async (date = null) => {
  try {
    const statDate = date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_statistics")
      .select("*")
      .eq("stat_date", statDate)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return (
      data || {
        stat_date: statDate,
        total_revenue: 0,
        total_orders: 0,
        total_customers: 0,
        total_smiles: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching daily statistics:", error);
    return {
      total_revenue: 0,
      total_orders: 0,
      total_customers: 0,
      total_smiles: 0,
    };
  }
};

export const updateDailyStatistics = async (amount) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get current stats
    const { data: existingStats } = await supabase
      .from("daily_statistics")
      .select("*")
      .eq("stat_date", today)
      .single();

    if (existingStats) {
      // Update existing stats
      const { error } = await supabase
        .from("daily_statistics")
        .update({
          total_revenue: existingStats.total_revenue + amount,
          total_orders: existingStats.total_orders + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("stat_date", today);

      if (error) throw error;
    } else {
      // Create new stats entry
      const { error } = await supabase.from("daily_statistics").insert([
        {
          stat_date: today,
          total_revenue: amount,
          total_orders: 1,
          total_customers: 1,
          total_smiles: Math.floor(Math.random() * 10) + 1,
        },
      ]);

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error updating daily statistics:", error);
  }
};

export const clearAllTransactions = async () => {
  try {
    const { error } = await supabase.from("transactions").delete().gt("id", 0); // Delete all records

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error clearing transactions:", error);
    return false;
  }
};

// ==================== PAYMENT METHODS ====================
export const getPaymentMethods = async () => {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};
