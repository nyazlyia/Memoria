import React from "react";
import LeftArrow from "./components/LeftArrow";

export default function SuccessPage({ info, onBackHome }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-[var(--maroon)]">
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackHome}
          className="flex items-center gap-2 ml-2 mt-1"
          aria-label="Back to Home"
        >
          <LeftArrow size={20} />
        </button>
      </div>
      <div className="text-center">
        <h2 className="libre-bodoni text-4xl mb-4 text-[var(--maroon)]">
          Payment Successful
        </h2>
        <p className="mb-6">Thank you — your payment was confirmed.</p>
        <div className="mt-6">
          <button
            onClick={onBackHome}
            className="px-6 py-3 bg-[var(--lime)] text-[var(--maroon)] border-2 border-[var(--maroon)] rounded-full libre-bodoni font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
