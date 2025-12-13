import { ChevronLeft } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  fullScreen?: boolean;
  goBack?: boolean;
}

export default function EmptyState({
  icon = '📂',
  title,
  description,
  fullScreen = false,
  goBack = false,
}: EmptyStateProps) {
  const containerClasses = fullScreen
    ? 'h-full flex items-center justify-center'
    : 'text-center py-12 px-6';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-50">{icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {description && <p className="text-gray-400 max-w-md mx-auto">{description}</p>}
        {goBack && (
          <Button
            className="mt-6 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Go Back</span>
          </Button>
        )}
      </div>
    </div>
  );
}
