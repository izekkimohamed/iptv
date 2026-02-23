import { useEffect, useState } from 'react';

export const useTauri = () => {
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTauri = async () => {
      try {
        const { Window } = await import('@tauri-apps/api/window');
        const windowNames = await Window.getAll();
        if (windowNames.some((window) => window.label === 'main')) {
          setIsDesktopApp(true);
        } else {
          setIsDesktopApp(false);
        }
      } catch {
        setIsDesktopApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTauri();
  }, []);

  return { isDesktopApp, isLoading };
};
