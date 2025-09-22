import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "medium",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const containerClasses =
    fullScreen ?
      "h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className='text-center'>
        <div
          className={`animate-spin rounded-full border-b-2 border-purple-500 mx-auto mb-4 ${sizeClasses[size]}`}
        ></div>
        <p className='text-white text-lg'>{message}</p>
      </div>
    </div>
  );
}
