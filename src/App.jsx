import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import StylesPage from "./components/StylesPage";
import FramesPage from "./components/FramesPage"; // untuk tema solid
import ColorfulFramesPage from "./components/ColorfulFramesPage"; // untuk tema colorful
import CameraPage from "./components/CameraPage";
import PaymentPage from "./components/PaymentPage";
import SuccessPage from "./components/SuccessPage";

export default function App() {
  const [page, setPage] = useState("landing");
  const [theme, setTheme] = useState(null); // "solid" atau "colorful"
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const goToLanding = () => setPage("landing");
  const goToStyles = () => setPage("styles");
  const goToFrames = (selectedTheme) => {
    setTheme(selectedTheme);
    setPage("frames");
  };
  const goToCamera = (frame) => {
    setSelectedFrame(frame);
    setPage("camera");
  };
  const goToPayment = (photo) => {
    setCapturedPhoto(photo);
    setPage("payment");
  };
  const goToSuccess = () => setPage("success");

  // Render halaman sesuai state
  switch (page) {
    case "landing":
      return <LandingPage onGetStarted={goToStyles} />;

    case "styles":
      return (
        <StylesPage
          onBack={goToLanding}
          onSelectTheme={(selectedTheme) => goToFrames(selectedTheme)}
        />
      );

    case "frames":
      // Pilih komponen frames berdasarkan tema
      if (theme === "solid") {
        return (
          <FramesPage
            theme={theme}
            onBack={(frame) => {
              if (frame) {
                // Jika ada frame (dari tombol PICK FRAME)
                goToCamera(frame);
              } else {
                // Jika tombol back ditekan
                goToStyles();
              }
            }}
          />
        );
      } else {
        return (
          <ColorfulFramesPage
            theme={theme}
            onBack={(frame) => {
              if (frame) {
                goToCamera(frame);
              } else {
                goToStyles();
              }
            }}
          />
        );
      }

    case "camera":
      return (
        <CameraPage
          selectedFrame={selectedFrame}
          onPhotoTaken={(photo) => goToPayment(photo)}
          onBack={() => setPage("frames")} // kembali ke pilihan frame
        />
      );

    case "payment":
      return (
        <PaymentPage
          selectedFrame={selectedFrame}
          capturedPhoto={capturedPhoto}
          onPaid={goToSuccess}
          onBack={() => setPage("camera")} // kembali ke kamera
        />
      );

    case "success":
      return <SuccessPage onBackHome={goToLanding} />;

    default:
      return <LandingPage onGetStarted={goToStyles} />;
  }
}