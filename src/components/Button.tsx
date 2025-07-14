import React, { forwardRef } from "react";
import { Spacing } from "./Spacing";
import { Spinner } from "./Spinner";
import { cn } from "../lib/utils";

const ButtonForward: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    loading?: boolean;
    secondary?: boolean;
    className?: string;
  }
> = ({ onClick, disabled, children, loading, secondary, className }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "border-[#a8324a]/90 border rounded-geist px-geist gap-4 font-inter h-12 font-medium transition-all duration-150 ease-in-out inline-flex items-center appearance-none text-sm bg-[#a8324a] text-foreground disabled:bg-button-disabled-color disabled:text-disabled-text-color disabled:border-unfocused-border-color disabled:cursor-not-allowed",
        secondary
          ? "bg-background text-foreground border-unfocused-border-color"
          : undefined,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading && (
        <>
          <Spinner size={20}></Spinner>
          <Spacing></Spacing>
        </>
      )}
      {children}
    </button>
  );
};

export const Button = forwardRef(ButtonForward);
