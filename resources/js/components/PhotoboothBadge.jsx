import React from "react";

export default function PhotoboothBadge({
  width = 420,
  height = 140,
  className = "",
}) {
  const viewW = 420;
  const viewH = 140;
  // Path: elongated pill with slightly tapered ends using cubic Beziers
  const d = `M20 ${viewH / 2} C70 10 ${viewW - 70} 10 ${viewW - 20} ${
    viewH / 2
  } C${viewW - 70} ${viewH - 10} 70 ${viewH - 10} 20 ${viewH / 2} Z`;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#000"
            floodOpacity="0.12"
          />
        </filter>
      </defs>
      <path
        d={d}
        fill="#fff376"
        stroke="var(--maroon)"
        strokeWidth="8"
        filter="url(#shadow)"
      />
      <text
        x="50%"
        y="52%"
        fill="var(--maroon)"
        fontFamily="Libre Bodoni, Bodoni Moda, serif"
        fontWeight="700"
        fontSize="44"
        textAnchor="middle"
        dominantBaseline="middle"
        transform="rotate(-12 210 70)"
      >
        Photobooth
      </text>
    </svg>
  );
}
