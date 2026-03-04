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
  const frameDimensionsRef = useRef({ width: 0, height: 0 });

  // Load gambar frame
  useEffect(() => {
    if (!selectedFrame) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = selectedFrame;
    img.onload = () => {
      frameImageRef.current = img;
      frameDimensionsRef.current = { width: img.width, height: img.height };
    };
  }, [selectedFrame]);

  // Minta akses kamera (tanpa mirror)
  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Kamera depan, tapi tidak mirror
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Pastikan video tidak dicerminkan (defaultnya tidak, tapi kita set style untuk mencegah jika ada CSS)
          videoRef.current.style.transform = "scaleX(1)";
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

  // Fungsi mengambil satu foto
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Gambar video tanpa mirror
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  // Mulai capture
  const startCapture = () => {
    setCapturing(true);
    setPhotos([]);
    setCountdown(3);
    setShowCountdown(true);
  };

  // Efek hitungan mundur
  useEffect(() => {
    if (!capturing || countdown === null) return;

    if (countdown === 0) {
      setShowCountdown(false);
      const photo = takePhoto();
      if (photo) {
        setPhotos((prev) => {
          const newPhotos = [...prev, photo];
          if (newPhotos.length === 3) {
            // Selesai 3 foto, lanjut gabungkan
            combinePhotos(newPhotos);
            setCapturing(false);
            setCountdown(null);
          } else {
            // Siapkan countdown untuk foto berikutnya
            setCountdown(3);
            setShowCountdown(true);
          }
          return newPhotos;
        });
      } else {
        // Gagal, reset
        setCapturing(false);
        setCountdown(null);
        setShowCountdown(false);
      }
    } else {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, capturing]);

  // Fungsi menggabungkan 3 foto dengan frame
  const combinePhotos = (photoList) => {
    if (!frameImageRef.current) {
      // Fallback: kirim foto pertama saja
      onPhotoTaken(photoList[0]);
      return;
    }

    const frameImg = frameImageRef.current;
    const frameWidth = frameImg.width;
    const frameHeight = frameImg.height;

    // Buat canvas hasil akhir
    const resultCanvas = document.createElement("canvas");
    resultCanvas.width = frameWidth;
    resultCanvas.height = frameHeight;
    const ctx = resultCanvas.getContext("2d");

    const photoWidth = frameWidth * 0.8; // lebar foto 80% lebar frame
    const photoHeight = frameHeight * 0.25; // tinggi foto 25% tinggi frame
    const marginX = (frameWidth - photoWidth) / 2;
    const marginY = frameHeight * 0.05; // jarak dari tepi atas/bawah

    const positions = [
      { y: marginY },
      { y: frameHeight / 2 - photoHeight / 2 },
      { y: frameHeight - photoHeight - marginY },
    ];

    // Muat semua foto sebagai image
    const photoImages = photoList.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    let loaded = 0;
    photoImages.forEach((img, index) => {
      img.onload = () => {
        loaded++;
        if (loaded === 3) {
          // Gambar foto terlebih dahulu
          ctx.clearRect(0, 0, frameWidth, frameHeight);
          photoImages.forEach((photoImg, i) => {
            ctx.drawImage(
              photoImg,
              marginX,
              positions[i].y,
              photoWidth,
              photoHeight,
            );
          });
          // Gambar frame di atas
          ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
          // Hasil akhir
          const finalImage = resultCanvas.toDataURL("image/png");
          onPhotoTaken(finalImage);
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B8EBFC] to-[#A0D8F0] p-6 text-[var(--maroon)]">
      {/* Tombol back */}
      <div className="flex items-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 ml-2 mt-1 bg-white/30 backdrop-blur-sm p-2 rounded-full hover:bg-white/50 transition"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mt-8">
        <h1 className="libre-bodoni text-5xl font-bold mb-2 text-[var(--maroon)] drop-shadow-lg">
          SELFIE TIME!
        </h1>
        <p className="text-xl mb-6 text-[var(--maroon)]">
          Ambil 3 foto terbaikmu
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Area video */}
        <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto bg-black"
            style={{ transform: "scaleX(1)" }} // Pastikan tidak mirror
          />
          {/* Overlay countdown */}
          {showCountdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
              <span className="text-white text-9xl font-bold drop-shadow-2xl animate-pulse">
                {countdown}
              </span>
            </div>
          )}
          {/* Indikator progress foto */}
          {capturing && !showCountdown && (
            <div className="absolute top-4 right-4 bg-white/80 text-[var(--maroon)] px-4 py-2 rounded-full font-bold">
              Foto {photos.length + 1}/3
            </div>
          )}
        </div>

        {/* Tombol mulai */}
        {!capturing && photos.length === 0 && (
          <button
            onClick={startCapture}
            className="mt-8 bg-[var(--lime)] text-[var(--maroon)] border-2 border-[var(--maroon)] px-12 py-5 rounded-full placard-next font-bold text-3xl shadow-xl hover:scale-105 transition-transform hover:bg-[#c8ff9f]"
          >
            📸 MULAI FOTO (3x)
          </button>
        )}

        {/* Status capturing (saat jeda antar foto) */}
        {capturing && !showCountdown && photos.length < 3 && (
          <div className="mt-8 text-xl">
            <p>Mempersiapkan foto berikutnya...</p>
          </div>
        )}

        {/* Canvas tersembunyi untuk mengambil foto */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
