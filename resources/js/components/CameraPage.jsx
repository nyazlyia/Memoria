import React, { useRef, useState, useEffect } from "react";
import LeftArrow from "./LeftArrow";

export default function CameraPage({ selectedFrame, onPhotoTaken, onBack }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [capturing, setCapturing] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const frameImageRef = useRef(null);

    // Load frame
    useEffect(() => {
        if (!selectedFrame) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = selectedFrame;
        img.onload = () => {
            frameImageRef.current = img;
        };
    }, [selectedFrame]);

    // Start camera
    useEffect(() => {
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.style.transform = "scaleX(1)";
                }
            } catch (err) {
                setError("Tidak dapat mengakses kamera.");
            }
        }
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Ambil foto
    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return null;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/png");
    };

    // Start capture
    const startCapture = () => {
        setCapturing(true);
        setPhotos([]);
        setCountdown(3);
        setShowCountdown(true);
    };

    // Countdown logic
    useEffect(() => {
        if (!capturing || countdown === null) return;

        if (countdown === 0) {
            const delay = setTimeout(() => {
                setShowCountdown(false);

                const photo = takePhoto();

                if (photo) {
                    setPhotos((prev) => {
                        const newPhotos = [...prev, photo];

                        if (newPhotos.length === 3) {
                            combinePhotos(newPhotos);
                            setCapturing(false);
                            setCountdown(null);
                        } else {
                            setTimeout(() => {
                                setCountdown(3);
                                setShowCountdown(true);
                            }, 1200);
                        }

                        return newPhotos;
                    });
                } else {
                    setCapturing(false);
                    setCountdown(null);
                    setShowCountdown(false);
                }
            }, 1500);

            return () => clearTimeout(delay);
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, capturing]);

    // Gabung foto + frame
    const combinePhotos = (photoList) => {
        if (!frameImageRef.current) {
            onPhotoTaken(photoList[0]);
            return;
        }

        const frameImg = frameImageRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = frameImg.width;
        canvas.height = frameImg.height;

        // Clear canvas dan reset all settings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "transparent";
        ctx.lineWidth = 0;

        // Vertical strip frame settings untuk 3 photo areas
        const photoWidth = canvas.width * 0.8;
        const photoHeight = canvas.height * 0.245;
        const startX = (canvas.width - photoWidth) / 2; // Center horizontally

        // Vertikal positions untuk 3 rectangles (lowered more with increased gaps)
        const positions = [
            canvas.height * 0.185, // Photo 1 (top) - moved down (increased)
            canvas.height * 0.425, // Photo 2 (middle) - moved down (increased)
            canvas.height * 0.675, // Photo 3 (bottom) - moved down (increased)
        ];

        // Border radius untuk setiap rectangle
        const cornerRadius = 15;

        const imgs = photoList.map((src) => {
            const img = new Image();
            img.src = src;
            return img;
        });

        let loaded = 0;

        imgs.forEach((img) => {
            img.onload = () => {
                loaded++;
                if (loaded === 3) {
                    imgs.forEach((photo, index) => {
                        const x = startX;
                        const y = positions[index];

                        // Clip dengan rounded rectangle sesuai position
                        ctx.save();

                        // Reset stroke settings untuk menghindari random lines
                        ctx.strokeStyle = "transparent";
                        ctx.lineWidth = 0;

                        ctx.beginPath();

                        if (index === 0) {
                            // Top: rounded top corners only
                            ctx.moveTo(x + cornerRadius, y);
                            ctx.lineTo(x + photoWidth - cornerRadius, y);
                            ctx.quadraticCurveTo(
                                x + photoWidth,
                                y,
                                x + photoWidth,
                                y + cornerRadius,
                            );
                            ctx.lineTo(x + photoWidth, y + photoHeight);
                            ctx.lineTo(x, y + photoHeight);
                            ctx.lineTo(x, y + cornerRadius);
                            ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
                        } else if (index === 1) {
                            // Middle: no rounded corners (straight rectangle)
                            ctx.rect(x, y, photoWidth, photoHeight);
                        } else {
                            // Bottom: rounded bottom corners only
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + photoWidth, y);
                            ctx.lineTo(
                                x + photoWidth,
                                y + photoHeight - cornerRadius,
                            );
                            ctx.quadraticCurveTo(
                                x + photoWidth,
                                y + photoHeight,
                                x + photoWidth - cornerRadius,
                                y + photoHeight,
                            );
                            ctx.lineTo(x + cornerRadius, y + photoHeight);
                            ctx.quadraticCurveTo(
                                x,
                                y + photoHeight,
                                x,
                                y + photoHeight - cornerRadius,
                            );
                            ctx.lineTo(x, y);
                        }

                        ctx.closePath();
                        ctx.clip();

                        // Calculate photo dimensions using "cover" style scaling
                        const photoAspect = photo.width / photo.height;
                        const frameAspect = photoWidth / photoHeight;

                        let drawWidth, drawHeight, drawX, drawY;

                        if (photoAspect > frameAspect) {
                            // Photo is wider than the frame
                            drawWidth = photoWidth;
                            drawHeight = photoWidth / photoAspect;
                        } else {
                            // Photo is taller than the frame
                            drawWidth = photoHeight * photoAspect;
                            drawHeight = photoHeight;
                        }

                        // Center the photo within the rectangle
                        drawX = x + (photoWidth - drawWidth) / 2;
                        drawY = y + (photoHeight - drawHeight) / 2;

                        ctx.drawImage(
                            photo,
                            drawX,
                            drawY,
                            drawWidth,
                            drawHeight,
                        );
                        ctx.restore();
                    });

                    // frame di atas
                    ctx.drawImage(frameImg, 0, 0);

                    const final = canvas.toDataURL("image/png");
                    onPhotoTaken(final);
                }
            };
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#B8EBFC] to-[#A0D8F0] p-6">
            <button onClick={onBack}>
                <LeftArrow />
            </button>

            <div className="flex flex-col items-center mt-8">
                <h1 className="text-5xl font-bold">SELFIE TIME!</h1>

                <div className="relative w-full max-w-2xl rounded-xl overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full" />

                    {showCountdown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-white text-9xl font-bold animate-pulse">
                                {countdown}
                            </span>
                        </div>
                    )}

                    {capturing && !showCountdown && (
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                            Foto {photos.length + 1}/3
                        </div>
                    )}
                </div>

                {!capturing && photos.length === 0 && (
                    <button onClick={startCapture} className="mt-6 text-2xl">
                        📸 MULAI FOTO
                    </button>
                )}

                {capturing && !showCountdown && photos.length < 3 && (
                    <p className="mt-4">Siap foto berikutnya...</p>
                )}

                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </div>
    );
}
