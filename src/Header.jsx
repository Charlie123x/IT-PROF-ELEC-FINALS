import React from "react";
import { LogOut } from "lucide-react";

export default function Header({ user, onLogout }) {
  return (
    <header className="bg-amber-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">☕ Coffee Management System</h1>
          <p className="text-amber-100 mt-1">
            Manage your coffee inventory and orders
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-amber-200">Welcome</p>
              <p className="font-bold">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
