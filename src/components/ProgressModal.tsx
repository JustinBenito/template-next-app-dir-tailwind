import React, { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { ProgressBar } from "./ProgressBar";
import Image from "next/image";

const STEP_MESSAGES: Record<string, string> = {
  uploading: "Uploading your video...",
  generating: "Generating Tanglish captions...",
  rendering: "Rendering your video with servers ...",
  done: "All done!",
  error: "Something went wrong!",
};

const CheckIcon = () => (
  <svg
    className="w-12 h-12 text-green-500"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className="w-12 h-12 text-red-500"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
    />
  </svg>
);

export const ProgressModal: React.FC<{
  open: boolean;
  step: "uploading" | "generating" | "rendering" | "done" | "error";
  progress?: number;
  onClose?: () => void;
  errorMessage?: string;
  memeUrl?: string; // 👈 New prop
}> = ({ open, step, progress = 0, onClose, errorMessage, memeUrl }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (progress > displayProgress) {
      const interval = setInterval(() => {
        setDisplayProgress((prev) => Math.min(progress, prev + 0.01));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [progress, displayProgress]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="relative bg-white rounded-2xl shadow-xl border-2 border-[#a8324a]/20 px-8 py-10 flex flex-col items-center min-w-[300px] max-w-[90vw]">
        
        {/* 👇 Meme Image */}
        {memeUrl && (
          <Image
            src={memeUrl}
            alt="Loading Meme"
            className="w-full max-w-[300px] rounded-lg mb-4 object-cover"
          />
        )}

        {/* 👇 Icon */}
        <div className="mb-5">
          {step === "done" ? (
            <CheckIcon />
          ) : step === "error" ? (
            <ErrorIcon />
          ) : (
            <Spinner size={48} />
          )}
        </div>

        <h2 className="text-xl font-bold text-[#a8324a] mb-3 text-center">
          {STEP_MESSAGES[step] || "Processing..."}
        </h2>

        {step === "error" && errorMessage && (
          <p className="text-sm text-red-600 mb-3 text-center">{errorMessage}</p>
        )}

        {step !== "done" && step !== "error" && (
          <div className="w-full mt-1">
            <ProgressBar progress={displayProgress} />
          </div>
        )}

        {onClose && (step === "done" || step === "error") && (
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2 rounded-lg bg-[#a8324a] text-white font-semibold shadow hover:bg-[#7b1f2b] transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
