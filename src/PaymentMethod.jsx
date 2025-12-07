import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { getPaymentMethods } from "./supabase";

export default function PaymentMethod({ onSelectPayment }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0 && !selectedPayment) {
          setSelectedPayment(methods[0].name);
          onSelectPayment(methods[0].name.toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        // Fallback to default methods
        setPaymentMethods([
          {
            id: 1,
            name: "Cash",
            description: "Pay with cash",
            icon: "💵",
            is_active: true,
          },
          {
            id: 2,
            name: "E-Wallet",
            description: "Digital payment (GCash, PayMaya, etc.)",
            icon: "📱",
            is_active: true,
          },
        ]);
        if (!selectedPayment) {
          setSelectedPayment("Cash");
          onSelectPayment("cash");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSelectPayment = (methodName) => {
    setSelectedPayment(methodName);
    // Pass the payment method in lowercase for consistency
    onSelectPayment(methodName.toLowerCase());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border-3 border-blue-200">
        <p className="text-blue-800">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border-4 border-purple-200 p-6">
      <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
        <div className="bg-purple-400 p-3 rounded-2xl shadow-md">
          <CreditCard className="w-6 h-6 text-purple-900" />
        </div>
        Payment Method
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleSelectPayment(method.name)}
            className={`rounded-2xl p-4 border-3 transition-all duration-300 text-left ${
              selectedPayment === method.name
                ? "bg-purple-100 border-purple-400 shadow-lg"
                : "bg-gray-50 border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{method.icon}</span>
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {method.name}
                  </p>
                  <p className="text-xs text-gray-600">{method.description}</p>
                </div>
              </div>
              {selectedPayment === method.name && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ✓
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
