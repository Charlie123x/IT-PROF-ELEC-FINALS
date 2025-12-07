import React, { useState, useEffect } from "react";
import Header from "./Header";
import Menu from "./Menu";
import Cart from "./Cart";
import PaymentMethod from "./PaymentMethod";
import { getMenuItems, createTransaction } from "./supabase";
import {
  Coffee,
  Users,
  DollarSign,
  ShoppingBag,
  Clock,
  Heart,
  Smile,
} from "lucide-react";

// ==================== DASHBOARD PAGE COMPONENT ====================
function DashboardPage({ user, onLogout }) {
  const [stats, setStats] = useState({
    revenue: 1847.5,
    orders: 67,
    customers: 18,
    smiles: 52,
  });

  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [loading, setLoading] = useState(true);

  // Fetch menu items on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items.length > 0 ? items : getDefaultMenuItems());
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems(getDefaultMenuItems());
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Default menu items fallback
  const getDefaultMenuItems = () => [
    {
      id: 1,
      name: "Caramel Latte",
      emoji: "☕",
      description: "Rich espresso with sweet caramel and steamed milk",
      price: 5.5,
    },
    {
      id: 2,
      name: "Blueberry Muffin",
      emoji: "🧁",
      description: "Fresh baked with plump blueberries",
      price: 4.25,
    },
    {
      id: 3,
      name: "Iced Coffee",
      emoji: "🧊",
      description: "Cool and refreshing iced brew",
      price: 4.75,
    },
    {
      id: 4,
      name: "Croissant & Tea",
      emoji: "🥐",
      description: "Buttery croissant with hot tea",
      price: 6.0,
    },
    {
      id: 5,
      name: "Hot Chocolate",
      emoji: "☕",
      description: "Warm and comforting hot chocolate",
      price: 4.5,
    },
  ];

  // Handler functions
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

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
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
    if (cartItems.length === 0) {
      alert("Please add items to cart");
      return;
    }

    try {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await createTransaction({
        items: cartItems,
        total,
        paymentMethod: selectedPayment,
      });

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        revenue: prevStats.revenue + total,
        orders: prevStats.orders + 1,
        smiles: prevStats.smiles + 1,
      }));

      // Clear cart
      setCartItems([]);
      alert("Order completed successfully!");
    } catch (error) {
      console.error("Error completing order:", error);
      alert("Error completing order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Decorative Elements */}
      <div className="fixed top-32 right-12 text-8xl opacity-20 pointer-events-none animate-pulse">
        ?
      </div>
      <div className="fixed bottom-32 left-12 text-8xl opacity-20 pointer-events-none animate-pulse">
        ??
      </div>
      <div className="fixed top-64 left-1/4 text-6xl opacity-20 pointer-events-none">
        ??
      </div>

      {/* ==================== HEADER COMPONENT ==================== */}
      <Header user={user} onLogout={onLogout} />

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="p-8 max-w-7xl mx-auto relative z-10">
        {/* Welcome Message */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-amber-200 mb-8">
          <p className="text-2xl font-bold text-amber-800 text-center">
            ? Welcome to Charl! Where every cup tells a story ?
          </p>
        </div>

        {/* Stats Grid - Cozy Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-green-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-300 p-4 rounded-2xl shadow-md">
                <DollarSign
                  className="w-8 h-8 text-green-700"
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-3xl">??</span>
            </div>
            <h3 className="text-green-700 text-sm font-bold uppercase mb-2">
              Today's Sales
            </h3>
            <p className="text-4xl font-bold text-green-800 mb-2">
              ${stats.revenue.toFixed(2)}
            </p>
            <p className="text-green-600 text-sm font-semibold">
              🎉 Great day!
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-blue-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-300 p-4 rounded-2xl shadow-md">
                <ShoppingBag
                  className="w-8 h-8 text-blue-700"
                  strokeWidth={2.5}
                />
              </div>
              <span className="text-3xl">🎁</span>
            </div>
            <h3 className="text-blue-700 text-sm font-bold uppercase mb-2">
              Orders Today
            </h3>
            <p className="text-4xl font-bold text-blue-800 mb-2">
              {stats.orders}
            </p>
            <p className="text-blue-600 text-sm font-semibold">
              ☕ Delicious treats served
            </p>
          </div>

          {/* Customers Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-pink-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-300 p-4 rounded-2xl shadow-md">
                <Users className="w-8 h-8 text-pink-700" strokeWidth={2.5} />
              </div>
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-pink-700 text-sm font-bold uppercase mb-2">
              Happy Customers
            </h3>
            <p className="text-4xl font-bold text-pink-800 mb-2">
              {stats.customers}
            </p>
            <p className="text-pink-600 text-sm font-semibold">
              🥰 Currently here
            </p>
          </div>

          {/* Smiles Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-4 border-yellow-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-300 p-4 rounded-2xl shadow-md">
                <Smile className="w-8 h-8 text-yellow-700" strokeWidth={2.5} />
              </div>
              <span className="text-3xl">😊</span>
            </div>
            <h3 className="text-yellow-700 text-sm font-bold uppercase mb-2">
              Smiles Today
            </h3>
            <p className="text-4xl font-bold text-yellow-800 mb-2">
              {stats.smiles}
            </p>
            <p className="text-yellow-600 text-sm font-semibold">
              ❤️ Spreading joy!
            </p>
          </div>
        </div>

        {/* Menu Section */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        ) : (
          <div className="mb-8">
            <Menu menuItems={menuItems} onAddToCart={handleAddToCart} />
          </div>
        )}

        {/* Cart and Payment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart */}
          <div className="lg:col-span-2">
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCompleteOrder={handleCompleteOrder}
            />
          </div>

          {/* Payment Method */}
          <div>
            <PaymentMethod onSelectPayment={handleSelectPayment} />
          </div>
        </div>
      </main>
    </div>
  );
}

// ==================== MAIN EXPORT ====================
export default DashboardPage;
