import React from "react";

export default function LeftArrow({ size = 18, color = "var(--maroon)" }) {
  const style = {
    width: 0,
    height: 0,
    borderTop: `${size}px solid transparent`,
    borderBottom: `${size}px solid transparent`,
    borderRight: `${size * 1.2}px solid ${color}`,
    display: "inline-block",
  };
  return <span style={style} aria-hidden="true" />;
}
