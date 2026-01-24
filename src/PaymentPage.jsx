import React from "react";
import LeftArrow from "./components/LeftArrow";

export default function PaymentPage({ selectedFrame, onPaid, onBack }) {
  const handlePaymentComplete = () => {
    // Mock payment completion - simulate successful payment
    onPaid &&
      onPaid({
        transaction_status: "settlement",
        order_id: `order-${Date.now()}`,
      });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[var(--maroon)]">
      <div className="absolute top-6 left-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>
      <div className="max-w-xl w-full text-center">
        <h2 className="libre-bodoni text-3xl mb-6">Payment</h2>
        <div className="mb-6">
          <div>Selected frame:</div>
          {selectedFrame ? (
            <img
              src={selectedFrame}
              alt="selected"
              className="mx-auto mt-4 w-64"
            />
          ) : (
            <div className="text-sm text-gray-500">No frame selected</div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={handlePaymentComplete}
            className="bg-[var(--lime)] text-[var(--maroon)] border-2 border-[var(--maroon)] px-8 py-3 rounded-full libre-bodoni font-bold"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
