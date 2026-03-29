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
  const [photoStep, setPhotoStep] = useState(0);
  const frameImageRef = useRef(null);

  // Konfigurasi posisi 3 foto di dalam frame (sesuaikan dengan desain frame Anda!)
  const slotConfig = [
    { x: 50, y: 30, width: 400, height: 300 }, // slot 1
    { x: 50, y: 360, width: 400, height: 300 }, // slot 2
    { x: 50, y: 690, width: 400, height: 300 }, // slot 3
  ];

  // Load gambar frame
  useEffect(() => {
    if (!selectedFrame) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = selectedFrame;
    img.onload = () => {
      frameImageRef.current = img;
    };
  }, [selectedFrame]);

  // Minta akses kamera (non-mirror)
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Tidak dapat mengakses kamera. Pastikan izin diberikan.");
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ambil satu foto dari video
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

  // Mulai proses 3 foto
  const startCapture = () => {
    setCapturing(true);
    setPhotos([]);
    setPhotoStep(1);
    setCountdown(3);
  };

  // Efek hitungan mundur
  useEffect(() => {
    if (!capturing || countdown === null) return;

    if (countdown === 0) {
      const photo = takePhoto();
      if (photo) {
        setPhotos((prev) => {
          const newPhotos = [...prev, photo];
          if (newPhotos.length === 3) {
            // Selesai 3 foto, segera gabungkan
            setCapturing(false);
            setCountdown(null);
            setPhotoStep(0);
            combinePhotos(newPhotos);
          } else {
            setPhotoStep((step) => step + 1);
            setCountdown(3);
          }
          return newPhotos;
        });
      } else {
        // Gagal ambil foto
        setCapturing(false);
        setCountdown(null);
        setPhotoStep(0);
      }
    } else {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, capturing]);

  // Gabungkan 3 foto dengan frame
  const combinePhotos = (photoList) => {
    if (!frameImageRef.current || photoList.length < 3) return;

    const frameImg = frameImageRef.current;
    const frameWidth = frameImg.width;
    const frameHeight = frameImg.height;

    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = frameWidth;
    resultCanvas.height = frameHeight;
    const ctx = resultCanvas.getContext("2d");

    // Gambar frame dulu sebagai background (opsional, tergantung frame transparan atau tidak)
    ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);

    // Load foto satu per satu dan gambar di slot masing-masing
    const images = photoList.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let loaded = 0;
    images.forEach((img, index) => {
      img.onload = () => {
        // Hitung agar foto pas di slot tanpa distorsi (cover)
        const slot = slotConfig[index];
        const scale = Math.max(
          slot.width / img.width,
          slot.height / img.height,
        );
        const sw = img.width * scale;
        const sh = img.height * scale;
        const sx = slot.x + (slot.width - sw) / 2;
        const sy = slot.y + (slot.height - sh) / 2;

        // Potong (crop) bagian yang kelebihan agar tepat di slot
        ctx.save();
        ctx.beginPath();
        ctx.rect(slot.x, slot.y, slot.width, slot.height);
        ctx.clip();
        ctx.drawImage(img, sx, sy, sw, sh);
        ctx.restore();

        loaded++;
        if (loaded === 3) {
          const finalImage = resultCanvas.toDataURL("image/png");
          onPhotoTaken(finalImage);
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#B8EBFC] flex flex-col items-center p-6 text-[var(--maroon)] select-none">
      <div className="w-full flex items-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center w-full max-w-3xl mt-4">
        <h1 className="libre-bodoni text-4xl font-bold mb-2">SELFIE TIME!</h1>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="relative w-full bg-black rounded-lg overflow-hidden border-4 border-[var(--maroon)]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-white text-9xl font-bold">{countdown}</span>
            </div>
          )}
        </div>

        {!capturing && photos.length === 0 && (
          <button
            onClick={startCapture}
            className="mt-6 bg-[var(--lime)] text-[var(--maroon)] border-2 border-[var(--maroon)] px-10 py-4 rounded-full placard-next font-bold text-2xl shadow-lg hover:scale-105 transition-transform"
          >
            📸 MULAI FOTO (3x)
          </button>
        )}

        {capturing && (
          <div className="mt-4 text-xl">
            <p>Foto ke-{photoStep} dari 3</p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
