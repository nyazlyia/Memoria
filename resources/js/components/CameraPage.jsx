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

    //  SIZE FOTO
    const photoWidth = canvas.width * 0.7;
    const photoHeight = canvas.height * 0.2;
    const marginX = canvas.width * 0.15;

    //  POSISI FOTO 
    const positions = [
      canvas.height * 0.20,
      canvas.height * 0.43,
      canvas.height * 0.66,
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
            ctx.drawImage(
              photo,
              marginX,
              positions[index],
              photoWidth,
              photoHeight
            );
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