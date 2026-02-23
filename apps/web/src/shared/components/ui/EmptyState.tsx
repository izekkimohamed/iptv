import { ChevronLeft } from 'lucide-react';

import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
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
    ? 'max-h-screen h-full flex items-center justify-center'
    : 'text-center py-12 px-6';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="mb-4 flex justify-center text-6xl opacity-50">
          {typeof icon === 'string' ? icon : icon}
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
        {description && <p className="mx-auto max-w-md text-gray-400">{description}</p>}
        {goBack && (
          <Button
            className="mt-6 rounded-sm bg-white/10 px-4 py-2 text-white transition-all duration-200 hover:bg-white/20"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Go Back</span>
          </Button>
        )}
      </div>
    </div>
  );
}
