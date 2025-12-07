import React from "react";
import { History, Trash2 } from "lucide-react";

export default function Transaction({ transactions, onClearTransactions }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border-4 border-blue-200 p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center gap-3">
          <div className="bg-blue-400 p-3 rounded-2xl shadow-md">
            <History className="w-7 h-7 text-blue-900" />
          </div>
          Transaction History
        </h2>
        <p className="text-center text-gray-500 py-12 text-lg">
          📝 No transactions yet. Start by placing an order!
        </p>
      </div>
    );
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="bg-white rounded-3xl shadow-lg border-4 border-blue-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-800 flex items-center gap-3">
          <div className="bg-blue-400 p-3 rounded-2xl shadow-md">
            <History className="w-7 h-7 text-blue-900" />
          </div>
          Transaction History
        </h2>
        <button
          onClick={onClearTransactions}
          className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full shadow-md transition-all duration-300 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Clear All
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="bg-blue-100 rounded-2xl p-6 border-3 border-blue-300 mb-6">
        <p className="text-blue-900 font-bold text-sm uppercase mb-2">
          Total Revenue
        </p>
        <p className="text-4xl font-bold text-blue-900">
          ${totalRevenue.toFixed(2)}
        </p>
        <p className="text-blue-700 text-sm mt-2">
          💰 {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-blue-50 rounded-2xl p-6 border-3 border-blue-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-blue-600 font-semibold">
                  {transaction.date} at {transaction.timestamp}
                </p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  Transaction #{transaction.id.toString().slice(-5)}
                </p>
              </div>
              <span className="bg-green-400 text-green-900 px-4 py-2 rounded-full font-bold text-sm">
                ✅ {transaction.status}
              </span>
            </div>

            {/* Items in Transaction */}
            <div className="bg-white rounded-xl p-4 mb-4 border-2 border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-3">
                Items Ordered:
              </p>
              <div className="space-y-2">
                {transaction.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <p className="font-semibold text-blue-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900">
                        x{item.quantity}
                      </p>
                      <p className="text-xs text-blue-700">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-blue-900">Total:</p>
              <p className="text-2xl font-bold text-green-600">
                ${transaction.total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
