import React from "react";
import { Shield, Users, ShoppingCart, Coffee, ArrowRight } from "lucide-react";

export default function RoleSelection({ onSelectRole }) {
  const roles = [
    {
      id: "admin",
      title: "Admin",
      description: "Full access to all features and settings",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      borderColor: "border-purple-300",
      bgColor: "bg-purple-50",
      permissions: [
        "✓ Manage staff accounts",
        "✓ View all reports",
        "✓ System settings",
        "✓ Inventory management",
        "✓ Financial reports",
      ],
    },
    {
      id: "staff",
      title: "Staff",
      description: "Take orders and manage transactions",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-300",
      bgColor: "bg-blue-50",
      permissions: [
        "✓ Take customer orders",
        "✓ Process payments",
        "✓ View order history",
        "✓ Manage cart",
        "✓ View menu items",
      ],
    },
    {
      id: "customer",
      title: "Customer",
      description: "Browse menu and place orders",
      icon: ShoppingCart,
      color: "from-green-500 to-green-600",
      borderColor: "border-green-300",
      bgColor: "bg-green-50",
      permissions: [
        "✓ Browse menu items",
        "✓ Add items to cart",
        "✓ Place orders",
        "✓ Choose payment method",
        "✓ Track order status",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed top-10 left-10 text-6xl opacity-20 pointer-events-none animate-pulse">
        ☕
      </div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20 pointer-events-none">
        🧁
      </div>

      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-10 h-10 text-amber-900" />
            <h1 className="text-5xl font-bold text-amber-900">Charl</h1>
          </div>
          <p className="text-amber-700 text-xl">Coffee Management System</p>
          <p className="text-amber-600 text-sm mt-2">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group relative overflow-hidden rounded-3xl border-4 transition-all duration-300 hover:shadow-2xl hover:scale-105"
                style={{
                  borderColor: role.borderColor.split("-")[1],
                  backgroundColor: role.bgColor,
                }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <div className="relative p-8 z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${role.color} text-white mb-6`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Title and Description */}
                  <h2 className="text-3xl font-bold text-gray-800 mb-2 text-left">
                    {role.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-left text-sm">
                    {role.description}
                  </p>

                  {/* Permissions */}
                  <div className="space-y-2 mb-8 text-left">
                    {role.permissions.map((perm, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <span className="text-lg">✓</span>
                        {perm.replace("✓ ", "")}
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <div
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r ${role.color} text-white font-bold group-hover:gap-3 transition-all duration-300`}
                  >
                    <span>Select {role.title}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-3xl border-4 border-amber-200 p-6 text-center">
          <p className="text-amber-900 text-sm">
            <strong>Note:</strong> You can change your role at any time from the
            settings menu after logging in.
          </p>
        </div>
      </div>
    </div>
  );
}
