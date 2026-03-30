import React, { useState } from "react";
import LeftArrow from "./LeftArrow";

export default function FramesPage({ theme, onBack }) {
  const [selected, setSelected] = useState(null);

  // ambil semua gambar dari assets
  const images = import.meta.glob("../assets/**/*.{png,jpg,jpeg}", {
    eager: true,
  });

  // tentuin folder berdasarkan theme
  const folder = theme === "colorful" ? "colorful" : "solid";

  // filter gambar sesuai folder
  const imgs = Object.entries(images)
    .filter(([path]) => path.includes(`/assets/${folder}/`))
    .map(([, module]) => module.default);

  return (
    <div className="min-h-screen bg-[#B8EBFC] p-6 text-[var(--maroon)]">
      <div className="flex items-start">
        <button
          onClick={() => onBack()}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-5 gap-6">
          {imgs.map((src, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && setSelected(i)
              }
              className={`transition-transform duration-150 focus:outline-none ${
                selected === i ? "scale-105" : ""
              }`}
            >
              <img
                src={src}
                alt={`frame-${i}`}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className={`pick-frame-btn placard-next uppercase ${
          selected === null ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Pick Frame"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) {
            const picked = imgs[selected];
            if (onBack) onBack(picked);
          }
        }}
      >
        PICK FRAME
      </button>
    </div>
  );
}