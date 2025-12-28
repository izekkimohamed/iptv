import { useEffect, useState } from 'react';

import { trpc } from '@/lib/trpc';
import { usePlaylistStore } from '@/store/appStore';

import { Button } from './ui/button';

export default function SophisticatedLoginForm() {
  const [formData, setFormData] = useState({
    url: '',
    username: '',
    password: '',
  });

  const [urlError, setUrlError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const [urlStatus, setUrlStatus] = useState('');
  const { startPlaylistCreation, selectPlaylist, addPlaylist } = usePlaylistStore();

  const {
    mutate: createPlaylist,
    isPending,
    error,
  } = trpc.playlists.createPlaylist.useMutation({
    onSuccess: (data) => {
      if (!data) return;
      setUrlStatus('');
      setFormData({ url: '', username: '', password: '' });
      addPlaylist(data);
      selectPlaylist(data);
      startPlaylistCreation();
    },
  });

  // URL validation only
  const validateUrl = (url: string) => {
    if (!url) return '';
    try {
      new URL(url);
      return url.startsWith('https://') || url.startsWith('http://')
        ? ''
        : 'URL should use HTTPS for security';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  // URL validation with simulated check
  useEffect(() => {
    const error = validateUrl(formData.url);
    setUrlError(error);

    if (formData.url && !error) {
      const timer = setTimeout(() => {
        setUrlStatus('verified');
      }, 1000);
      setUrlStatus('checking');
      return () => clearTimeout(timer);
    } else {
      setUrlStatus('');
    }
  }, [formData.url]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUrlBlur = () => {
    setUrlTouched(true);
  };

  const handleSubmit = async () => {
    if (isFormValid) {
      const { url, username, password } = formData;
      createPlaylist({ url, username, password });
    }
  };

  const isFormValid = formData.url && formData.username && formData.password && !urlError;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 p-8 font-mono shadow-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-3xl font-bold text-white">Secure Access</h2>
        <p className="text-gray-300">Enter your credentials to continue</p>
      </div>

      {error && (
        <p className="animate-fadeIn mt-2 text-center text-lg font-bold text-red-400">
          {error.message}
        </p>
      )}

      <div className="space-y-6">
        {/* URL Field */}
        <div>
          <label htmlFor="url" className="mb-2 block text-sm font-medium text-gray-200">
            Server URL
          </label>
          <div className="relative">
            <div className="relative">
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                onBlur={handleUrlBlur}
                className={`relative block w-full appearance-none rounded-xl border px-4 py-3 pr-12 text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none ${
                  urlError && urlTouched
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                    : 'border-gray-600 focus:border-amber-950 focus:ring-amber-950'
                }`}
                placeholder="https://api.example.com"
              />
            </div>
            {/* URL Status Indicator */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {urlStatus === 'checking' && (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-yellow-400"></div>
              )}
              {urlStatus === 'verified' && (
                <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          {urlError && urlTouched && (
            <p className="animate-fadeIn mt-2 text-sm text-red-400">{urlError}</p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-200">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="relative block w-full appearance-none rounded-xl border border-gray-600 px-4 py-3 text-white placeholder-gray-400 transition-all duration-300 focus:border-amber-950 focus:ring-2 focus:ring-amber-950 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              placeholder="Enter your username"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleChange}
              className="relative block w-full appearance-none rounded-xl border border-gray-600 px-4 py-3 pr-12 text-white placeholder-gray-400 transition-all duration-300 focus:border-amber-950 focus:ring-2 focus:ring-amber-950 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              placeholder="Enter your password"
            />
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1.5 right-1.5 rounded-md bg-gray-600/10 p-1 text-white transition-all duration-300 hover:bg-gray-700 active:bg-gray-800"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          className={`group relative flex w-full transform items-center justify-center rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-amber-950 focus:ring-offset-2 focus:outline-none ${
            isFormValid && !isPending
              ? 'cursor-pointer bg-gradient-to-r from-amber-950 to-amber-950 shadow-lg hover:shadow-amber-500/25 focus:border-amber-950 focus:ring-amber-950'
              : 'cursor-not-allowed bg-gray-600'
          }`}
        >
          {isPending ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Adding...
            </div>
          ) : (
            <>
              <span>Add Playlist</span>
              <svg
                className="-mr-1 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </Button>

        {/* Form Status Display */}
        <div className="mt-6 rounded-xl border border-gray-700 bg-black/20 p-4">
          <h3 className="mb-3 flex items-center text-sm font-medium text-gray-200">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Connection Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">URL Validation:</span>
              <span
                className={`font-medium ${
                  urlStatus === 'verified'
                    ? 'text-green-400'
                    : urlStatus === 'checking'
                      ? 'text-yellow-400'
                      : 'text-gray-500'
                }`}
              >
                {urlStatus === 'verified'
                  ? '✓ Valid'
                  : urlStatus === 'checking'
                    ? '⏳ Checking'
                    : '◦ Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Form Completion:</span>
              <span className={`font-medium ${isFormValid ? 'text-green-400' : 'text-gray-500'}`}>
                {isFormValid ? '✓ Complete' : '◦ Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ready to Connect:</span>
              <span
                className={`font-medium ${isFormValid && !isPending ? 'text-green-400' : 'text-gray-500'}`}
              >
                {isFormValid && !isPending ? '🚀 Ready' : '⏳ Waiting'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
