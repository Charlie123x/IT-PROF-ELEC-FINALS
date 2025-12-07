import React, { useState, useEffect } from "react";
import {
  LogOut,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Coffee,
  DollarSign,
  Wallet,
} from "lucide-react";
import { supabase } from "./supabase";
import Header from "./Header";

export default function CustomerDashboard({ user, onLogout, onChangeRole }) {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Calculate total price
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    setTotalPrice(total);
  }, [cart]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                subtotal: (cartItem.quantity + 1) * item.price,
              }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          emoji: item.emoji,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== itemId));
    } else {
      const item = cart.find((i) => i.id === itemId);
      setCart(
        cart.map((cartItem) =>
          cartItem.id === itemId
            ? {
                ...cartItem,
                quantity: newQuantity,
                subtotal: newQuantity * cartItem.price,
              }
            : cartItem
        )
      );
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setLoading(true);

      // Create transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            transaction_date: new Date().toISOString().split("T")[0],
            transaction_time: new Date().toTimeString().split(" ")[0],
            total_amount: totalPrice,
            payment_method: selectedPayment,
            status: "completed",
          },
        ])
        .select();

      if (transactionError) throw transactionError;

      const transactionId = transactionData[0].id;

      // Create transaction items
      const itemsToInsert = cart.map((item) => ({
        transaction_id: transactionId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_per_unit: item.price,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Update daily statistics
      const today = new Date().toISOString().split("T")[0];
      const { data: statsData, error: statsError } = await supabase
        .from("daily_statistics")
        .select("*")
        .eq("stat_date", today);

      if (statsError && statsError.code !== "PGRST116") throw statsError;

      if (statsData && statsData.length > 0) {
        // Update existing record
        await supabase
          .from("daily_statistics")
          .update({
            total_revenue: statsData[0].total_revenue + totalPrice,
            total_orders: statsData[0].total_orders + 1,
            total_customers: statsData[0].total_customers + 1,
          })
          .eq("stat_date", today);
      } else {
        // Create new record
        await supabase.from("daily_statistics").insert([
          {
            stat_date: today,
            total_revenue: totalPrice,
            total_orders: 1,
            total_customers: 1,
            total_smiles: 0,
          },
        ]);
      }

      // Clear cart and show success
      setCart([]);
      setShowCart(false);
      alert(`✅ Order placed successfully! Total: ₱${totalPrice.toFixed(2)}`);
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Failed to complete order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">☕</div>
          <p className="text-amber-900 font-bold">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <Header user={user} onLogout={onLogout} onChangeRole={onChangeRole} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-10 h-10 text-amber-900" />
            <h1 className="text-4xl font-bold text-amber-900">
              Welcome, Customer!
            </h1>
          </div>
          <p className="text-amber-700 text-lg">
            Browse our menu and place your order
          </p>
        </div>

        {/* Menu and Cart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border-4 border-amber-200 p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                Our Menu
              </h2>

              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <Coffee className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <p className="text-amber-700">No items available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 hover:border-amber-400 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{item.emoji}</span>
                          <div>
                            <h3 className="font-bold text-amber-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-amber-700">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-amber-900">
                          ₱{parseFloat(item.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border-4 border-amber-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-6 h-6 text-amber-900" />
                <h2 className="text-2xl font-bold text-amber-900">
                  Cart ({cart.length})
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-amber-300 mx-auto mb-2" />
                  <p className="text-amber-700">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-amber-50 rounded-xl p-3 border-2 border-amber-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            <div>
                              <p className="font-bold text-amber-900 text-sm">
                                {item.name}
                              </p>
                              <p className="text-xs text-amber-700">
                                ₱{item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="bg-amber-300 hover:bg-amber-400 text-amber-900 px-2 py-1 rounded font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-amber-900 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="bg-amber-300 hover:bg-amber-400 text-amber-900 px-2 py-1 rounded font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-amber-900">
                            ₱{item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6 pb-6 border-t-2 border-amber-200">
                    <label className="block text-sm font-bold text-amber-900 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-amber-50 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="cash"
                          checked={selectedPayment === "cash"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-lg">💵</span>
                        <span className="text-amber-900 font-bold">Cash</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded-xl hover:bg-amber-50 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="e-wallet"
                          checked={selectedPayment === "e-wallet"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-lg">📱</span>
                        <span className="text-amber-900 font-bold">
                          E-Wallet
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Total and Checkout */}
                  <div className="bg-amber-100 rounded-2xl p-4 border-2 border-amber-300 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-amber-900 font-bold">
                        Subtotal:
                      </span>
                      <span className="text-amber-900 font-bold">
                        ₱{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center text-2xl font-bold text-amber-900">
                      Total: ₱{totalPrice.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteOrder}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Place Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
