import React from "react";
import badgeUrl from "../assets/photobooth.svg"; // sesuaikan path

export default function LandingPage({ onGetStarted }) {
    const repeats = Array.from({ length: 24 });

    return (
        <div className="min-h-screen bg-[#B8EBFC] flex flex-col items-center justify-between text-[var(--maroon)]">
            {/* Header repeater */}
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
                    onClick={onGetStarted}
                    className="mt-6 bg-[var(--lime)] text-maroon border-2 border-[var(--maroon)] px-12 py-4 rounded-full text-4xl md:text-5xl placard-next font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    CLICK HERE!
                </button>
            </main>

            {/* Footer repeater */}
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
