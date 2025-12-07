import React from "react";
import { Plus } from "lucide-react";

export default function Menu({ menuItems, onAddToCart }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border-4 border-amber-200 p-8">
      <h3 className="text-3xl font-bold text-amber-900 mb-8 flex items-center gap-3">
        <span className="text-4xl">📋</span>
        Menu Items
      </h3>

      {menuItems.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No menu items available
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl border-3 border-amber-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Item Emoji Header */}
              <div className="bg-amber-100 h-24 flex items-center justify-center text-6xl border-b-3 border-amber-200">
                {item.emoji}
              </div>

              {/* Item Info */}
              <div className="p-6">
                <h4 className="text-xl font-bold text-amber-900 mb-2">
                  {item.name}
                </h4>
                <p className="text-sm text-amber-700 mb-4 h-10 overflow-hidden">
                  {item.description}
                </p>

                {/* Price and Add Button */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
