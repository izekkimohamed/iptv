import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  fullScreen?: boolean;
}

export default function EmptyState({
  icon = "📂",
  title,
  description,
  fullScreen = false,
}: EmptyStateProps) {
  const containerClasses =
    fullScreen ?
      "h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
    : "text-center py-12 px-6";

  return (
    <div className={containerClasses}>
      <div className='text-center'>
        <div className='text-6xl mb-4 opacity-50'>{icon}</div>
        <h2 className='text-2xl font-bold text-white mb-2'>{title}</h2>
        {description && (
          <p className='text-gray-400 max-w-md mx-auto'>{description}</p>
        )}
      </div>
    </div>
  );
}
