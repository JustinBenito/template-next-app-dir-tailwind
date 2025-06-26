import React from "react";

export const InputContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="border-2 border-[#a8324a]/30 p-geist rounded-xl bg-white flex flex-col">
      {children}
    </div>
  );
};
