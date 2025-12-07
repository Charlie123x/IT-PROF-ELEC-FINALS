import React, { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";
import Menu from "./Menu";
import Cart from "./Cart";
import PaymentMethod from "./PaymentMethod";
import { supabase } from "./supabaseClient";

export default function StaffDashboard({ user, onLogout, onChangeRole }) {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    smiles: 0,
  });

  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [loading, setLoading] = useState(true);

  // Fetch menu items from Supabase on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase.from("menu_items").select("*");

        if (error) throw error;

        setMenuItems(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            emoji: item.emoji,
            price: parseFloat(item.price),
            description: item.description,
          }))
        );

        // Fetch today's statistics
        const today = new Date().toISOString().split("T")[0];
        const { data: statsData } = await supabase
          .from("daily_statistics")
          .select("*")
          .eq("stat_date", today)
          .single();

        if (statsData) {
          setStats({
            revenue: statsData.total_revenue,
            orders: statsData.total_orders,
            customers: statsData.total_customers,
            smiles: statsData.total_smiles,
          });
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const handleSelectPayment = (method) => {
    setSelectedPayment(method);
  };

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      // Get today's date
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

      // 1. Create transaction record
      const { data: transactionData, error: txError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            transaction_date: today,
            transaction_time: now,
            total_amount: total,
            payment_method: selectedPayment.toLowerCase(),
            status: "completed",
          },
        ])
        .select();

      if (txError) throw txError;

      const transactionId = transactionData[0].id;

      // 2. Create transaction items records
      const transactionItems = cartItems.map((item) => ({
        transaction_id: transactionId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_per_unit: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // 3. Update daily statistics
      const { data: statsData } = await supabase
        .from("daily_statistics")
        .select("*")
        .eq("stat_date", today)
        .single();

      if (statsData) {
        // Update existing stats
        await supabase
          .from("daily_statistics")
          .update({
            total_revenue: statsData.total_revenue + total,
            total_orders: statsData.total_orders + 1,
            total_smiles: statsData.total_smiles + 1,
          })
          .eq("stat_date", today);
      } else {
        // Create new stats for today
        await supabase.from("daily_statistics").insert([
          {
            stat_date: today,
            total_revenue: total,
            total_orders: 1,
            total_customers: 1,
            total_smiles: 1,
          },
        ]);
      }

      // Update local stats
      setStats({
        revenue: stats.revenue + total,
        orders: stats.orders + 1,
        customers: stats.customers,
        smiles: stats.smiles + 1,
      });

      // Clear cart
      setCartItems([]);
      alert(
        `✅ Order completed! Total: $${total.toFixed(
          2
        )}\n\nAdmin dashboard updated!`
      );
    } catch (error) {
      console.error("Error completing order:", error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-4">☕</div>
            <p className="text-xl text-gray-600">Loading menu items...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <header className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold">Staff Dashboard</h1>
                <p className="text-blue-100 mt-1">Order Management System</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-200">Staff Member</p>
                  <p className="font-bold">{user.email}</p>
                </div>
                <button
                  onClick={onChangeRole}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg transition-colors"
                  title="Change Role"
                >
                  <Settings className="w-5 h-5" />
                  <span>Change Role</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-8 max-w-6xl mx-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Revenue Today
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  ${stats.revenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Orders
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.orders}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-pink-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Customers
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.customers}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Smiles
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.smiles}
                </p>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Menu Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Available Menu
                  </h2>
                  <Menu menuItems={menuItems} onAddToCart={handleAddToCart} />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Cart Section */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-green-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Shopping Cart
                  </h2>
                  <Cart
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCompleteOrder={handleCompleteOrder}
                  />
                </div>

                {/* Payment Section */}
                <PaymentMethod
                  selectedPayment={selectedPayment}
                  onSelectPayment={handleSelectPayment}
                />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
