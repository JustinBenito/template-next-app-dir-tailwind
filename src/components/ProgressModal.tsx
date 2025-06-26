import React from "react";
import { ProgressBar } from "./ProgressBar";
import { Spinner } from "./Spinner";

const STEP_MESSAGES: Record<string, string> = {
  uploading: "Uploading your video...",
  generating: "Generating Tanglish captions...",
  rendering: "Rendering your video with AWS Lambda...",
  done: "All done!",
  error: "Something went wrong!",
};

export const ProgressModal: React.FC<{
  open: boolean;
  step: "uploading" | "generating" | "rendering" | "done" | "error";
  progress?: number;
  onClose?: () => void;
  errorMessage?: string;
}> = ({ open, step, progress = 0, onClose, errorMessage }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white/90 rounded-2xl shadow-2xl border-2 border-[#a8324a]/30 px-8 py-10 flex flex-col items-center min-w-[320px] max-w-[90vw]">
        <div className="mb-4">
          <Spinner size={48} />
        </div>
        <h2 className="text-xl font-bold text-[#a8324a] mb-2">
          {STEP_MESSAGES[step] || "Processing..."}
        </h2>
        {step === "error" && errorMessage ? (
          <div className="text-red-600 text-sm mb-2">{errorMessage}</div>
        ) : null}
        {step !== "done" && step !== "error" && (
          <div className="w-full mt-2">
            <ProgressBar progress={progress} />
          </div>
        )}
        {onClose && (step === "done" || step === "error") && (
          <button
            className="mt-6 px-5 py-2 rounded-lg bg-[#a8324a] text-white font-semibold shadow hover:bg-[#7b1f2b] transition"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}; 