
import React from "react";
import { cn } from "@/lib/utils";
import { CircleFadingPlus, CircleFadingArrowUp, RefreshCw } from "lucide-react";

type LoadingVariant = "spinner" | "pulse" | "dots" | "wave";
type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";
type LoadingTheme = "light" | "primary" | "finance";

interface LoadingSpinnerProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  theme?: LoadingTheme;
  text?: string;
  className?: string;
}

const sizeMap = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const themeMap = {
  light: "text-white",
  primary: "text-finance-primary",
  finance: "text-finance-secondary",
};

export function LoadingSpinner({
  variant = "spinner",
  size = "md",
  theme = "primary",
  text,
  className,
}: LoadingSpinnerProps) {
  const IconComponent = variant === "pulse" 
    ? CircleFadingPlus 
    : variant === "dots" 
      ? CircleFadingArrowUp 
      : RefreshCw;

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {variant === "spinner" && (
        <div
          className={cn(
            "animate-spin rounded-full border-t-2 border-b-2",
            sizeMap[size],
            {
              "border-white": theme === "light",
              "border-finance-primary": theme === "primary",
              "border-finance-secondary": theme === "finance",
            }
          )}
        />
      )}
      
      {variant === "wave" && (
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse rounded-full",
                sizeMap.xs,
                {
                  "bg-white": theme === "light",
                  "bg-finance-primary": theme === "primary",
                  "bg-finance-secondary": theme === "finance",
                },
                `animate-[pulse_1.5s_ease-in-out_${i * 0.2}s_infinite]`
              )}
            />
          ))}
        </div>
      )}
      
      {(variant === "pulse" || variant === "dots") && (
        <IconComponent
          className={cn(
            "animate-pulse", 
            sizeMap[size],
            themeMap[theme]
          )}
        />
      )}
      
      {text && (
        <p 
          className={cn(
            "mt-2 animate-pulse", 
            textSizeMap[size],
            themeMap[theme]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingOverlay({
  variant = "spinner",
  size = "lg",
  theme = "primary",
  text = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className={cn("bg-white p-6 rounded-lg shadow-lg", className)}>
        <LoadingSpinner
          variant={variant}
          size={size}
          theme={theme}
          text={text}
        />
      </div>
    </div>
  );
}

export function LoadingSection({
  variant = "spinner",
  size = "md",
  theme = "primary",
  text,
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("w-full py-12 flex items-center justify-center", className)}>
      <LoadingSpinner
        variant={variant}
        size={size}
        theme={theme}
        text={text}
      />
    </div>
  );
}
