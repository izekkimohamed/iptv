interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const containerClasses = fullScreen
    ? 'h-full flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-center py-16">
        <div className="space-y-3 text-center">
          <div
            className={`${sizeClasses[size]} border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto`}
          />
          <p className={`${textSizeClasses[size]} text-gray-500 font-medium`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
