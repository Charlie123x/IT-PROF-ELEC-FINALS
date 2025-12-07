import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteOrder,
}) {
  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border-4 border-orange-200 p-8 text-center">
        <p className="text-xl text-gray-500">🛒 Your cart is empty</p>
        <p className="text-sm text-gray-400 mt-2">
          Add items from the menu to get started
        </p>
      </div>
    );
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-3xl shadow-lg border-4 border-orange-200 p-8">
      <h3 className="text-3xl font-bold text-orange-900 mb-6 flex items-center gap-3">
        <span className="text-3xl">🛒</span>
        Shopping Cart
      </h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-orange-50 rounded-2xl border-3 border-orange-200 p-4 flex items-center justify-between hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-4xl">{item.emoji}</span>
              <div>
                <p className="font-bold text-orange-900">{item.name}</p>
                <p className="text-sm text-orange-700">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-all duration-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-orange-900 w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="bg-green-400 hover:bg-green-500 text-white p-2 rounded-full transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right mr-4">
              <p className="font-bold text-orange-900">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition-all duration-300"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-orange-100 rounded-2xl border-3 border-orange-300 p-6 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-900">Total:</span>
          <span className="text-3xl font-bold text-orange-600">
            ${cartTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Complete Order Button */}
      <button
        onClick={onCompleteOrder}
        className="w-full bg-linear-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg py-4 px-6 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        ✨ Complete Order
      </button>
    </div>
  );
}
