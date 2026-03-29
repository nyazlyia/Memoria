import React from "react";
import LeftArrow from "./LeftArrow";

const cards = [
  { title: "Solid", bg: "#D0FF8D" },
  { title: "Colorful", bg: "#FECAF0" },
];

export default function StylesPage({ onBack, onSelectTheme }) {
  return (
    <div className="min-h-screen bg-[#FAF693] text-[var(--maroon)] p-6">
      <div className="flex items-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back"
        >
          <LeftArrow size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="libre-bodoni text-maroon text-5xl font-bold mb-2 text-center">
          CHOOSE YOUR THEME!
        </h1>
        <h1 className="libre-bodoni-italic text-maroon mb-12 text-3xl text-center">
          Select from our collection of photo booth theme
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {cards.map((c, i) => (
            <div
              key={i}
              onClick={() =>
                onSelectTheme && onSelectTheme(i === 0 ? "solid" : "colorful")
              }
              className="cursor-pointer border-2 border-[var(--maroon)] flex items-center justify-center rounded-[100px] w-full max-w-[500px] h-[400px] md:w-[500px] md:h-[400px]"
              style={{ background: c.bg }}
            >
              <div
                className="text-center"
                style={{
                  fontFamily: "'Libre Bodoni', serif",
                  fontWeight: "700",
                  fontSize: "3.5rem",
                }}
              >
                {c.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
