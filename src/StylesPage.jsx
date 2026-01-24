import React from "react";
import LeftArrow from "./components/LeftArrow";

const cards = [
  { title: "Solid", bg: "#cfbdb8" },
  { title: "Colorful", bg: "#fbf29a" },
];

export default function StylesPage({ onBack, onSelectTheme }) {
  return (
    <div className="min-h-screen bg-white text-[var(--maroon)] p-6">
      <div className="flex items-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="mx-auto mt-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center w-full">
          {cards.map((c, i) => (
            <div
              key={i}
              onClick={() =>
                onSelectTheme &&
                onSelectTheme(i === 0 ? "solid" : i === 1 ? "colorful" : "")
              }
              className="card cursor-pointer border-2 border-[var(--maroon)] flex items-center justify-center"
              style={{ background: c.bg }}
            >
              <div className="libre-bodoni text-[28px] md:text-[36px] lg:text-[44px] text-[var(--maroon)] font-bold text-center whitespace-pre-line px-8">
                {c.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
