import React, { useState, useEffect } from "react";
import LeftArrow from "./LeftArrow";

export default function PaymentPage({
  capturedPhoto,
  onPaid,
  onBack,
}) {
  const [snapToken, setSnapToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load script Midtrans Snap
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", "YOUR_CLIENT_KEY");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Buat transaksi
  useEffect(() => {
    const createTransaction = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/create-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: `order-${Date.now()}`,
            amount: 10000,
            item_details: [
              { name: "Photo Booth Frame", price: 10000, quantity: 1 },
            ],
            customer_details: { name: "Customer" },
          }),
        });
        const data = await response.json();
        if (data.snap_token) {
          setSnapToken(data.snap_token);
        } else {
          setError("Gagal membuat transaksi");
        }
      } catch (err) {
        setError("Gagal menghubungi server");
      } finally {
        setLoading(false);
      }
    };
    createTransaction();
  }, []);

  const handlePay = () => {
    if (!snapToken) return;
    window.snap.pay(snapToken, {
      onSuccess: (result) => onPaid && onPaid(result),
      onPending: () => alert("Pembayaran pending"),
      onError: () => alert("Pembayaran gagal"),
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

        {/* Hanya tampilkan foto final */}
        {capturedPhoto ? (
          <div className="mb-6">
            <p className="mb-2">Foto Anda dengan frame:</p>
            <img
              src={capturedPhoto}
              alt="final"
              className="mx-auto mt-4 w-64 border-2 border-[var(--maroon)]"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Foto tidak tersedia</p>
        )}

        {loading && <p>Menyiapkan pembayaran...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <button
          onClick={handlePay}
          disabled={!snapToken || loading}
          className={`bg-[var(--lime)] text-[var(--maroon)] border-2 border-[var(--maroon)] px-8 py-3 rounded-full libre-bodoni font-bold ${
            !snapToken || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Memuat..." : "Bayar dengan Midtrans"}
        </button>
      </div>
    </div>
  );
}
