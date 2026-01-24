import React, { useState } from "react";
import StylesPage from "./StylesPage";
import FramesPage from "./FramesPage";
import ColorfulFramesPage from "./ColorfulFramesPage";
import PaymentPage from "./PaymentPage";
import SuccessPage from "./SuccessPage";
import badgeUrl from "./assets/photobooth.svg";

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const repeats = Array.from({ length: 24 });

  if (page === "styles") {
    return (
      <StylesPage
        onBack={() => setPage("home")}
        onSelectTheme={(theme) => {
          setSelectedTheme(theme);
          setPage("frames");
        }}
      />
    );
  }

  if (page === "frames") {
    if (selectedTheme === "colorful") {
      return (
        <ColorfulFramesPage
          theme={selectedTheme}
          onBack={(picked) => {
            // picked is undefined/null if back arrow clicked, or a URL string if PICK FRAME button clicked
            if (picked && typeof picked === "string") {
              setSelectedFrame(picked);
              setPage("payment");
            } else {
              setPage("styles");
            }
          }}
        />
      );
    }
    return (
      <FramesPage
        theme={selectedTheme}
        onBack={(picked) => {
          // picked is undefined/null if back arrow clicked, or a URL string if PICK FRAME button clicked
          if (picked && typeof picked === "string") {
            setSelectedFrame(picked);
            setPage("payment");
          } else {
            setPage("styles");
          }
        }}
      />
    );
  }

  if (page === "payment") {
    return (
      <PaymentPage
        selectedFrame={selectedFrame}
        onBack={() => setPage("frames")}
        onPaid={(info) => {
          setPaymentInfo(info);
          setPage("success");
        }}
      />
    );
  }

  if (page === "success") {
    return (
      <SuccessPage info={paymentInfo} onBackHome={() => setPage("home")} />
    );
  }

  return (
    <div className="min-h-screen bg-[#B8EBFC] flex flex-col items-center justify-between text-[var(--maroon)]">
      <div className="w-full repeater-wrap py-2 bg-[#B8EBFC]">
        <div className="repeater text-maroon text-lg font-semibold justify-center">
          {repeats.map((_, i) => (
            <span key={i} className="placard-next">
              Ceria Team
            </span>
          ))}
          {repeats.map((_, i) => (
            <span key={`b${i}`} className="placard-next">
              Ceria Team
            </span>
          ))}
        </div>
      </div>

      <main className="flex flex-col items-center gap-6 px-6">
        <div className="relative flex items-center justify-center">
          <h1 className="big-title text-[10rem] md:text-[14rem] leading-[0.75] font-bold placard-next text-maroon">
            MEMORIA
          </h1>
          <span className="absolute right-[-6rem] top-[-2rem] transform rotate-12 bg-yellow-200 text-[var(--maroon)] px-5 py-4 rounded-[40px] border-2 border-[var(--maroon)] libre-bodoni text-2xl font-bold">
            {/* Photobooth badge (external SVG asset) */}
            <div className="absolute right-[-6rem] top-[-2rem] ">
              <div className="relative w-[420px] h-[140px]">
                <img
                  src={badgeUrl}
                  alt="photobooth badge"
                  className="w-full h-full block transform -rotate-12"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform rotate-12">
                  <div className="libre-bodoni text-[48px] text-[var(--maroon)] font-bold transform -rotate-[14deg]">
                    Photobooth
                  </div>
                </div>
              </div>
            </div>
          </span>
        </div>

        <p className="libre-bodoni text-maroon text-2xl font-bold">
          POSE DULU, BARU PERCAYA!
        </p>

        <button
          onClick={() => setPage("styles")}
          className="mt-6 bg-[var(--lime)] text-maroon border-2 border-[var(--maroon)] px-12 py-4 rounded-full text-4xl md:text-5xl placard-next font-bold shadow-lg hover:scale-105 transition-transform"
        >
          CLICK HERE!
        </button>
      </main>

      <div className="w-full repeater-wrap py-2 bg-[#B8EBFC]">
        <div className="repeater reverse text-maroon text-lg font-semibold justify-center">
          {repeats.map((_, i) => (
            <span key={`c${i}`} className="placard-next">
              Ceria Team
            </span>
          ))}
          {repeats.map((_, i) => (
            <span key={`d${i}`} className="placard-next">
              Ceria Team
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
