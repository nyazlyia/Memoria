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

    // Circular frame settings - adjust these based on your frame design
    const circleDiameter = Math.min(canvas.width, canvas.height) * 0.44; // Diameter for photo circles
    const circleRadius = circleDiameter / 2;
    const centerX = canvas.width / 2; // Center horizontally

    // Vertical positions for 3 photo circles (adjust these percentages as needed)
    const circleCenters = [
      canvas.height * 0.20,  // Top photo center
      canvas.height * 0.50,  // Middle photo center
      canvas.height * 0.80,  // Bottom photo center
    ];

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
            const centerY = circleCenters[index];

            // Create circular clipping region for each photo
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Calculate photo dimensions using "cover" style scaling
            // This ensures the photo completely fills the circle without distortion
            const photoAspect = photo.width / photo.height;
            const circleAspect = 1; // Circle has 1:1 aspect ratio

            let drawWidth, drawHeight, drawX, drawY;

            if (photoAspect > circleAspect) {
              // Photo is wider than the circle
              drawWidth = circleDiameter * photoAspect;
              drawHeight = circleDiameter;
            } else {
              // Photo is taller than the circle
              drawWidth = circleDiameter;
              drawHeight = circleDiameter / photoAspect;
            }

            // Center the photo within the circle
            drawX = centerX - drawWidth / 2;
            drawY = centerY - drawHeight / 2;

            ctx.drawImage(
              photo,
              drawX,
              drawY,
              drawWidth,
              drawHeight
            );
            ctx.restore();
          });

          // frame di atas
          // Uncomment the line below to see circle positions for debugging (red circles)
          // circleCenters.forEach(y => { ctx.strokeStyle = 'red'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(centerX, y, circleRadius, 0, Math.PI * 2); ctx.stroke(); });

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