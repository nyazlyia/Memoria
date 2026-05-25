import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function PhotoBoothApp() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [page, setPage] = useState("intro"); // intro, info, camera, gallery, payment, success
    const [session, setSession] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        maxPhotos: 4,
        price: 50000,
    });

    // Start camera
    useEffect(() => {
        if (page === "camera" && !stream) {
            startCamera();
        }

        return () => {
            if (stream && page !== "camera") {
                stream.getTracks().forEach((track) => track.stop());
                setStream(null);
            }
        };
    }, [page, stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Tidak dapat mengakses kamera: " + err.message);
        }
    };

    const createSession = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/photobooth/session", {
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                max_photos: customerInfo.maxPhotos,
                price: customerInfo.price,
            });

            if (response.data.success) {
                setSession(response.data.session);
                setPage("camera");
            } else {
                setError(response.data.message || "Gagal membuat session");
            }
        } catch (err) {
            setError("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/jpeg");

            setLoading(true);
            const response = await axios.post(
                `/api/photobooth/session/${session.id}/photo`,
                { image: imageData },
            );

            if (response.data.success) {
                setPhotos((prev) => [
                    ...prev,
                    {
                        id: response.data.photo.id,
                        url: response.data.photo.url,
                        name: response.data.photo.file_name,
                    },
                ]);
                setSession(response.data.session);
            }
        } catch (err) {
            setError("Gagal menyimpan foto: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const startAutoCapture = async () => {
        setIsCapturing(true);

        for (let i = 0; i < customerInfo.maxPhotos; i++) {
            // Countdown
            for (let count = 3; count > 0; count--) {
                setCountdown(count);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setCountdown("📸");
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Capture
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL("image/jpeg");

            try {
                const response = await axios.post(
                    `/api/photobooth/session/${session.id}/photo`,
                    { image: imageData },
                );

                if (response.data.success) {
                    setPhotos((prev) => [
                        ...prev,
                        {
                            id: response.data.photo.id,
                            url: response.data.photo.url,
                            name: response.data.photo.file_name,
                        },
                    ]);
                    setSession(response.data.session);
                }
            } catch (err) {
                console.error("Error capturing photo:", err);
            }

            if (i < customerInfo.maxPhotos - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }

        setIsCapturing(false);
        setCountdown(null);
    };

    const deletePhoto = async (photoId) => {
        try {
            const response = await axios.delete(
                `/api/photobooth/photo/${photoId}`,
            );
            if (response.data.success) {
                setPhotos((prev) => prev.filter((p) => p.id !== photoId));
                setSession((prev) => ({
                    ...prev,
                    photo_count: prev.photo_count - 1,
                }));
            }
        } catch (err) {
            setError("Gagal menghapus foto: " + err.message);
        }
    };

    const completeSession = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/photobooth/session/${session.id}/complete`,
            );

            if (response.data.success) {
                setSession(response.data.session);
                setPage("payment");
            }
        } catch (err) {
            setError("Gagal menyelesaikan session: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Render pages
    if (page === "intro") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl mb-6">📸</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Photo Booth
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Abadikan momen berhargamu dengan Photo Booth kami!
                    </p>
                    <button
                        onClick={() => setPage("info")}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition"
                    >
                        Mulai Sekarang
                    </button>
                </div>
            </div>
        );
    }

    if (page === "info") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6">Data Diri</h2>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={customerInfo.name}
                        onChange={(e) =>
                            setCustomerInfo({
                                ...customerInfo,
                                name: e.target.value,
                            })
                        }
                        className="w-full border p-3 rounded mb-4"
                    />

                    <input
                        type="email"
                        placeholder="Email (opsional)"
                        value={customerInfo.email}
                        onChange={(e) =>
                            setCustomerInfo({
                                ...customerInfo,
                                email: e.target.value,
                            })
                        }
                        className="w-full border p-3 rounded mb-4"
                    />

                    <input
                        type="tel"
                        placeholder="No. Telepon (opsional)"
                        value={customerInfo.phone}
                        onChange={(e) =>
                            setCustomerInfo({
                                ...customerInfo,
                                phone: e.target.value,
                            })
                        }
                        className="w-full border p-3 rounded mb-4"
                    />

                    <select
                        value={customerInfo.maxPhotos}
                        onChange={(e) =>
                            setCustomerInfo({
                                ...customerInfo,
                                maxPhotos: parseInt(e.target.value),
                            })
                        }
                        className="w-full border p-3 rounded mb-6"
                    >
                        <option value="2">2 Foto - Rp 30.000</option>
                        <option value="4">4 Foto - Rp 50.000</option>
                        <option value="6">6 Foto - Rp 75.000</option>
                    </select>

                    <button
                        onClick={createSession}
                        disabled={!customerInfo.name || loading}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                        {loading ? "Proses..." : "Lanjut ke Kamera"}
                    </button>

                    <button
                        onClick={() => setPage("intro")}
                        className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold mt-3 hover:bg-gray-300 transition"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    if (page === "camera") {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    <div className="relative bg-black rounded-lg overflow-hidden mb-6 aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full"
                        />

                        {countdown && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl font-bold text-white drop-shadow-lg">
                                    {countdown}
                                </div>
                            </div>
                        )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="bg-white rounded-lg p-6">
                        <p className="text-center text-gray-600 mb-4">
                            Foto {session?.photo_count || 0} dari{" "}
                            {customerInfo.maxPhotos}
                        </p>

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={startAutoCapture}
                                disabled={
                                    isCapturing ||
                                    session?.photo_count >=
                                        customerInfo.maxPhotos
                                }
                                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition"
                            >
                                {isCapturing
                                    ? "Mengambil Foto..."
                                    : "Mulai Pengambilan"}
                            </button>

                            <button
                                onClick={capturePhoto}
                                disabled={
                                    isCapturing ||
                                    session?.photo_count >=
                                        customerInfo.maxPhotos
                                }
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                Ambil Foto Manual
                            </button>
                        </div>

                        {session?.photo_count > 0 && (
                            <button
                                onClick={() => setPage("gallery")}
                                className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition mb-3"
                            >
                                Lihat Galeri ({session.photo_count})
                            </button>
                        )}

                        <button
                            onClick={() => setPage("info")}
                            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (page === "gallery") {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Galeri Foto</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative">
                                <img
                                    src={photo.url}
                                    alt={photo.name}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => deletePhoto(photo.id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setPage("camera")}
                            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition"
                        >
                            Kembali ke Kamera
                        </button>

                        {session?.photo_count > 0 && (
                            <button
                                onClick={completeSession}
                                disabled={loading}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition"
                            >
                                {loading ? "Proses..." : "Lanjut Pembayaran"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (page === "payment") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold mb-4">Pembayaran</h2>

                    <div className="bg-purple-100 rounded-lg p-6 mb-6">
                        <p className="text-gray-600 mb-2">Total Pembayaran</p>
                        <p className="text-4xl font-bold text-purple-600">
                            Rp {customerInfo.price.toLocaleString("id-ID")}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p>
                            <strong>Nama:</strong> {customerInfo.name}
                        </p>
                        <p>
                            <strong>Foto:</strong> {photos.length} /{" "}
                            {customerInfo.maxPhotos}
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            alert("Integrasi Midtrans akan ditampilkan di sini")
                        }
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition mb-3"
                    >
                        Bayar Sekarang
                    </button>

                    <button
                        onClick={() => setPage("gallery")}
                        className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    if (page === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl mb-6">✅</div>
                    <h1 className="text-3xl font-bold text-green-600 mb-4">
                        Pembayaran Berhasil!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Terima kasih telah menggunakan Photo Booth kami. Foto
                        Anda sudah siap diunduh.
                    </p>

                    <button
                        onClick={() => {
                            setPage("intro");
                            setPhotos([]);
                            setSession(null);
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                        Mulai Lagi
                    </button>
                </div>
            </div>
        );
    }
}
