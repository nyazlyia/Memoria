import React, { useState, useEffect } from "react";
import axios from "axios";

export default function usePayment(sessionId) {
    const [payment, setPayment] = useState(null);
    const [snapToken, setSnapToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPaid, setIsPaid] = useState(false);

    // Create payment
    const createPayment = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/photobooth/payment/create/${sessionId}`,
            );

            if (response.data.success) {
                setPayment(response.data.payment);
                setSnapToken(response.data.snap_token);
                return response.data.snap_token;
            }
        } catch (err) {
            setError("Gagal membuat pembayaran: " + err.message);
        } finally {
            setLoading(false);
        }
        return null;
    };

    // Get payment status
    const getPaymentStatus = async () => {
        try {
            const response = await axios.get(
                `/api/photobooth/payment/${sessionId}`,
            );

            if (response.data.success) {
                setPayment(response.data.payment);
                return response.data.payment;
            }
        } catch (err) {
            setError("Gagal mengambil status pembayaran: " + err.message);
        }
        return null;
    };

    // Verify payment
    const verifyPayment = async () => {
        try {
            const response = await axios.get(
                `/api/photobooth/payment/${sessionId}/verify`,
            );

            if (response.data.success) {
                setPayment(response.data.payment);
                setIsPaid(response.data.is_paid);
                return response.data.is_paid;
            }
        } catch (err) {
            setError("Gagal memverifikasi pembayaran: " + err.message);
        }
        return false;
    };

    // Load Midtrans script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.midtrans.com/snap/snap.js";
        script.setAttribute(
            "data-client-key",
            window.MIDTRANS_CLIENT_KEY || "",
        );
        script.async = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return {
        payment,
        snapToken,
        loading,
        error,
        isPaid,
        createPayment,
        getPaymentStatus,
        verifyPayment,
    };
}
