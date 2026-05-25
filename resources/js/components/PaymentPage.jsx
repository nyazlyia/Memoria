import React, { useState, useEffect } from "react";
import LeftArrow from "./LeftArrow";

export default function PaymentPage({
    sessionId,
    sessionData,
    capturedPhoto,
    onPaid,
    onBack,
}) {
    const [snapToken, setSnapToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentCreated, setPaymentCreated] = useState(false);
    const [clientKey, setClientKey] = useState(null);

    // Load Midtrans Snap script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.midtrans.com/snap/snap.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Create payment snap token
    useEffect(() => {
        if (!sessionId) return;

        const createPayment = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/photobooth/payment/create/${sessionId}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content"),
                        },
                    },
                );

                const data = await response.json();

                if (data.success) {
                    setSnapToken(data.snap_token);
                    setClientKey(data.client_key || "");
                    setPaymentCreated(true);
                } else {
                    setError(data.message || "Gagal membuat snap token");
                }
            } catch (err) {
                setError("Gagal menghubungi server: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        createPayment();
    }, [sessionId]);

    const handlePay = () => {
        if (!snapToken || !window.snap) {
            setError("Sistem pembayaran tidak siap. Silakan refresh halaman.");
            return;
        }

        window.snap.pay(snapToken, {
            onSuccess: function (result) {
                console.log("Payment successful", result);
                // Verify payment status
                verifyPayment();
            },
            onPending: function (result) {
                console.log("Payment pending", result);
                alert("Pembayaran sedang diproses. Mohon tunggu...");
            },
            onError: function (result) {
                console.log("Payment error", result);
                setError("Pembayaran gagal. Silakan coba lagi.");
            },
            onClose: function () {
                console.log("Payment window closed");
            },
        });
    };

    const verifyPayment = async () => {
        try {
            const response = await fetch(
                `/api/photobooth/payment/${sessionId}/verify`,
            );
            const data = await response.json();

            if (data.is_paid) {
                onPaid && onPaid();
            }
        } catch (err) {
            console.error("Error verifying payment:", err);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[var(--maroon)]">
            <div className="absolute top-6 left-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 ml-2 mt-1 hover:opacity-70"
                    aria-label="Back"
                >
                    <LeftArrow size={20} />
                </button>
            </div>

            <div className="max-w-md w-full text-center">
                <h2 className="libre-bodoni text-3xl mb-8">Pembayaran</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Photo Preview */}
                {capturedPhoto && (
                    <div className="mb-8">
                        <img
                            src={capturedPhoto}
                            alt="Captured photo"
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Session Info */}
                {sessionData && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                        <p className="text-gray-600 mb-2">
                            <strong>Nama:</strong> {sessionData.customer_name}
                        </p>
                        {sessionData.customer_email && (
                            <p className="text-gray-600 mb-2">
                                <strong>Email:</strong>{" "}
                                {sessionData.customer_email}
                            </p>
                        )}
                        {sessionData.customer_phone && (
                            <p className="text-gray-600 mb-2">
                                <strong>No. Telepon:</strong>{" "}
                                {sessionData.customer_phone}
                            </p>
                        )}
                        <p className="text-gray-600">
                            <strong>Jumlah Foto:</strong>{" "}
                            {sessionData.photo_count || 0} dari{" "}
                            {sessionData.max_photos}
                        </p>
                    </div>
                )}

                {/* Price */}
                <div className="bg-[var(--maroon)] text-white rounded-lg p-6 mb-8">
                    <p className="text-sm mb-2">Total Pembayaran</p>
                    <p className="libre-bodoni text-4xl font-bold">
                        Rp{" "}
                        {(sessionData?.price || 50000).toLocaleString("id-ID")}
                    </p>
                </div>

                {/* Payment Button */}
                <button
                    onClick={handlePay}
                    disabled={!snapToken || loading}
                    className="w-full bg-[var(--maroon)] text-white py-4 rounded-lg font-semibold mb-4 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {loading ? "Memproses..." : "Bayar Sekarang"}
                </button>

                {/* Security Info */}
                <p className="text-sm text-gray-500">
                    💳 Pembayaran aman dan terenkripsi menggunakan Midtrans
                </p>
            </div>
        </div>
    );
}
