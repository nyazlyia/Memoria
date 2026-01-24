import React, { useState } from "react";
import LeftArrow from "./components/LeftArrow";

const colorfulFiles = ["1.png", "2.png", "3.png", "5.png"];

export default function ColorfulFramesPage({ theme, onBack }) {
  const imgs = colorfulFiles.map(
    (name) => new URL(`./assets/colorful/${name}`, import.meta.url).href
  );

  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-white p-6 text-[var(--maroon)]">
      <div className="flex items-start">
        <button
          onClick={() => onBack()}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              className={`rounded-xl overflow-hidden bg-white transition-transform duration-150 focus:outline-none ${
                selected === i
                  ? "ring-4 ring-[var(--maroon)] scale-105"
                  : "border-2 border-[var(--maroon)]"
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
        className={`pick-frame-btn libre-bodoni uppercase ${
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
