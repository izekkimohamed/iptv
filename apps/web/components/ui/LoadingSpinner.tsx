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
            className={`${sizeClasses[size]} mx-auto animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500`}
          />
          <p className={`${textSizeClasses[size]} font-medium text-gray-500`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
