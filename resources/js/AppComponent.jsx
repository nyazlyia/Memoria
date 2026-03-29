import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import StylesPage from "./components/StylesPage";
import FramesPage from "./components/FramesPage";
import ColorfulFramesPage from "./components/ColorfulFramesPage";
import CameraPage from "./components/CameraPage";
import PaymentPage from "./components/PaymentPage";
import SuccessPage from "./components/SuccessPage";

export default function App() {
    const [page, setPage] = useState("landing");
    const [theme, setTheme] = useState(null);
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
            if (theme === "solid") {
                return (
                    <FramesPage
                        theme={theme}
                        onBack={(frame) => {
                            if (frame) goToCamera(frame);
                            else goToStyles();
                        }}
                    />
                );
            } else {
                return (
                    <ColorfulFramesPage
                        theme={theme}
                        onBack={(frame) => {
                            if (frame) goToCamera(frame);
                            else goToStyles();
                        }}
                    />
                );
            }
        case "camera":
            return (
                <CameraPage
                    selectedFrame={selectedFrame}
                    onPhotoTaken={(photo) => goToPayment(photo)}
                    onBack={() => setPage("frames")}
                />
            );
        case "payment":
            return (
                <PaymentPage
                    selectedFrame={selectedFrame}
                    capturedPhoto={capturedPhoto}
                    onPaid={goToSuccess}
                    onBack={() => setPage("camera")}
                />
            );
        case "success":
            return <SuccessPage onBackHome={goToLanding} />;
        default:
            return <LandingPage onGetStarted={goToStyles} />;
    }
}
