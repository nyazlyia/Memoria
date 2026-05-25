import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

export default function PhotoBoothSession({
    sessionId,
    onSessionCreated,
    onPhotosCaptured,
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [session, setSession] = useState(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [maxPhotos, setMaxPhotos] = useState(4);

    // Create new session
    const createNewSession = async (customerInfo) => {
        try {
            setLoading(true);
            const response = await axios.post("/api/photobooth/session", {
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                max_photos: customerInfo.maxPhotos || 4,
                price: customerInfo.price || 50000,
            });

            if (response.data.success) {
                setSession(response.data.session);
                setMaxPhotos(response.data.session.max_photos);
                onSessionCreated?.(response.data.session);
                return response.data.session;
            }
        } catch (err) {
            setError("Gagal membuat session: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load session
    const loadSession = async (sid) => {
        try {
            const response = await axios.get(`/api/photobooth/session/${sid}`);
            if (response.data.success) {
                setSession(response.data.session);
                setPhotos(
                    response.data.session.photos.map((p) => ({
                        id: p.id,
                        url: p.url,
                        name: p.file_name,
                    })),
                );
            }
        } catch (err) {
            setError("Gagal memuat session: " + err.message);
        }
    };

    // Start camera
    useEffect(() => {
        async function startCamera() {
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
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Capture photo
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

            // Save to server
            const response = await axios.post(
                `/api/photobooth/session/${session.id}/photo`,
                {
                    image: imageData,
                },
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

                return true;
            }
        } catch (err) {
            setError("Gagal menyimpan foto: " + err.message);
        }

        return false;
    };

    // Auto capture sequence
    const startAutoCapture = async () => {
        setIsCapturing(true);
        setCountdown(3);

        for (let i = 0; i < maxPhotos; i++) {
            // Countdown
            for (let count = 3; count > 0; count--) {
                setCountdown(count);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setCountdown("📸");
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Capture
            const success = await capturePhoto();
            if (!success) {
                setError("Gagal menangkap foto");
                setIsCapturing(false);
                setCountdown(null);
                return;
            }

            // Wait between photos
            if (i < maxPhotos - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }
        }

        setIsCapturing(false);
        setCountdown(null);
        onPhotosCaptured?.(photos);
    };

    // Delete photo
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

    // Complete session
    const completeSession = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/photobooth/session/${session.id}/complete`,
            );

            if (response.data.success) {
                setSession(response.data.session);
                return true;
            }
        } catch (err) {
            setError("Gagal menyelesaikan session: " + err.message);
        } finally {
            setLoading(false);
        }
        return false;
    };

    return {
        session,
        photos,
        error,
        loading,
        isCapturing,
        countdown,
        videoRef,
        canvasRef,
        createNewSession,
        loadSession,
        startAutoCapture,
        capturePhoto,
        deletePhoto,
        completeSession,
    };
}
