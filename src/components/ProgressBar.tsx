import React, { useMemo } from "react";

export const ProgressBar: React.FC<{
  progress: number; // value between 0 to 1
}> = ({ progress }) => {
  const fill = useMemo(() => ({
    width: `${Math.min(100, Math.max(0, progress * 100))}%`,
  }), [progress]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="h-3 rounded-full transition-all duration-500 ease-in-out bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
        style={fill}
      ></div>
    </div>
  );
};
