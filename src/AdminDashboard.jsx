import React, { useState, useEffect } from "react";
import { LogOut, Settings, X } from "lucide-react";
import { supabase } from "./supabaseClient";
import MenuManagement from "./MenuManagement";

export default function AdminDashboard({ user, onLogout, onChangeRole }) {
  const [activeModal, setActiveModal] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "$0.00", icon: "💰" },
    { label: "Total Orders", value: "0", icon: "📦" },
    { label: "Total Staff", value: "0", icon: "👥" },
    { label: "Menu Items", value: "0", icon: "☕" },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all staff (both active and inactive) for Manage Staff modal
      const { data: staffData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "staff")
        .order("created_at", { ascending: false });

      setStaffList(
        staffData?.map((staff) => ({
          id: staff.id,
          user_id: staff.user_id,
          name: staff.full_name || "N/A",
          email: staff.email,
          status: staff.is_active ? "Active" : "Inactive",
          is_active: staff.is_active,
        })) || []
      );

      // Fetch today's statistics
      const { data: statsData } = await supabase
        .from("daily_statistics")
        .select("*")
        .eq("stat_date", new Date().toISOString().split("T")[0])
        .single();

      // Fetch menu items count
      const { count: menuCount } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true });

      // Calculate total staff count (only active)
      const { count: staffCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "staff")
        .eq("is_active", true);

      setStats([
        {
          label: "Total Revenue",
          value: `$${(statsData?.total_revenue || 0).toFixed(2)}`,
          icon: "💰",
        },
        {
          label: "Total Orders",
          value: statsData?.total_orders || "0",
          icon: "📦",
        },
        {
          label: "Total Staff",
          value: staffCount || "0",
          icon: "👥",
        },
        {
          label: "Menu Items",
          value: menuCount || "0",
          icon: "☕",
        },
      ]);

      // Fetch recent transactions with user details
      const { data: transactionData } = await supabase
        .from("transactions")
        .select(
          `
          id,
          user_id,
          transaction_date,
          transaction_time,
          total_amount,
          payment_method,
          status,
          created_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      // Get user details for each transaction
      const ordersWithUsers = await Promise.all(
        transactionData?.map(async (tx) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            tx.user_id
          );
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("full_name")
            .eq("user_id", tx.user_id)
            .single();

          return {
            id: tx.id,
            user_id: tx.user_id,
            customer:
              roleData?.full_name ||
              userData?.user?.email ||
              "Unknown Customer",
            date: new Date(tx.transaction_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            time: tx.transaction_time || "N/A",
            amount: `₱${parseFloat(tx.total_amount).toFixed(2)}`,
            payment: tx.payment_method === "e-wallet" ? "E-Wallet" : "Cash",
            status: tx.status === "completed" ? "Completed" : "Pending",
          };
        }) || []
      );

      setRecentOrders(ordersWithUsers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100 mt-1">System Administration Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-purple-200">Admin User</p>
              <p className="font-bold">{user.email}</p>
            </div>
            <button
              onClick={onChangeRole}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-lg transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-purple-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recent Orders
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Date & Time
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Payment
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        #{order.id}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.customer}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.date} {order.time}
                      </td>
                      <td className="py-4 px-4 font-semibold text-purple-600">
                        {order.amount}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.payment}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Admin Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveModal("menu")}
                className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveModal("staff")}
                className="w-full bg-linear-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Manage Staff
              </button>
              <button
                onClick={() => setActiveModal("reports")}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                View Reports
              </button>
              <button
                onClick={() => setActiveModal("inventory")}
                className="w-full bg-linear-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveModal("settings")}
                className="w-full bg-linear-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                System Settings
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Backdrop */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-800">
                {activeModal === "menu" && "Menu Management"}
                {activeModal === "staff" && "Manage Staff"}
                {activeModal === "reports" && "System Reports"}
                {activeModal === "inventory" && "Inventory Management"}
                {activeModal === "settings" && "System Settings"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Menu Management */}
              {activeModal === "menu" && <MenuManagement />}

              {/* Staff Management */}
              {activeModal === "staff" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <p className="text-gray-700">
                      Total Active Staff:{" "}
                      <span className="font-bold text-purple-600">
                        {staffList.length}
                      </span>
                    </p>
                  </div>
                  {staffList.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {staff.name}
                        </p>
                        <p className="text-sm text-gray-600">{staff.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            staff.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {staff.status}
                        </span>
                        <button
                          onClick={async () => {
                            await supabase
                              .from("user_roles")
                              .update({ is_active: !staff.is_active })
                              .eq("id", staff.id);
                            fetchDashboardData();
                          }}
                          className={`text-white px-3 py-1 rounded-lg transition-colors text-sm font-semibold ${
                            staff.is_active
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {staff.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reports */}
              {activeModal === "reports" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Daily Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats[0]?.value || "$0.00"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Orders Today</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats[1]?.value || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Summary</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Total Staff: {stats[2]?.value || "0"} members</li>
                      <li>• Menu Items: {stats[3]?.value || "0"} items</li>
                      <li>• Last Updated: {new Date().toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Inventory */}
              {activeModal === "inventory" && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Menu Items Available: {stats[3]?.value || "0"}
                  </div>
                  {loading ? (
                    <p className="text-gray-500">Loading inventory...</p>
                  ) : (
                    [
                      { item: "Caramel Latte", stock: 45, min: 20 },
                      { item: "Blueberry Muffin", stock: 12, min: 15 },
                      { item: "Iced Coffee", stock: 38, min: 20 },
                      { item: "Hot Chocolate", stock: 28, min: 20 },
                    ].map((inv, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">
                            {inv.item}
                          </span>
                          <span
                            className={`font-bold ${
                              inv.stock < inv.min
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {inv.stock} units
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              inv.stock < inv.min
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${(inv.stock / 50) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Settings */}
              {activeModal === "settings" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded"
                      />
                      <span className="ml-3 text-gray-700">
                        Enable email notifications
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded"
                      />
                      <span className="ml-3 text-gray-700">
                        Daily revenue reports
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded" />
                      <span className="ml-3 text-gray-700">
                        Low stock alerts
                      </span>
                    </label>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">System Version</p>
                    <p className="text-gray-800 font-semibold">
                      Coffee Management System v1.0
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
