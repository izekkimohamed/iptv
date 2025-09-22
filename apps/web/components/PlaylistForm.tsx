import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SophisticatedLoginForm() {
  const [formData, setFormData] = useState({
    url: "",
    username: "",
    password: "",
  });
  const router = useRouter();

  const [urlError, setUrlError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const [urlStatus, setUrlStatus] = useState("");

  const {
    mutate: createPlaylist,
    isPending,
    error,
  } = trpc.playlist.createPlaylist.useMutation({
    onSuccess: (data) => {
      setUrlStatus("");
      setFormData({ url: "", username: "", password: "" });
      router.push("/");
      console.log(data);
    },
  });

  // URL validation only
  const validateUrl = (url: string) => {
    if (!url) return "";
    try {
      new URL(url);
      return url.startsWith("https://") || url.startsWith("http://") ?
          ""
        : "URL should use HTTPS for security";
    } catch {
      return "Please enter a valid URL";
    }
  };

  // URL validation with simulated check
  useEffect(() => {
    const error = validateUrl(formData.url);
    setUrlError(error);

    if (formData.url && !error) {
      const timer = setTimeout(() => {
        setUrlStatus("verified");
      }, 1000);
      setUrlStatus("checking");
      return () => clearTimeout(timer);
    } else {
      setUrlStatus("");
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

  const isFormValid =
    formData.url && formData.username && formData.password && !urlError;

  return (
    <div className='font-mono backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl'>
      <div className='text-center mb-8'>
        <div className='mx-auto h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4'>
          <svg
            className='h-6 w-6 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
        </div>
        <h2 className='text-3xl font-bold text-white mb-2'>Secure Access</h2>
        <p className='text-gray-300'>Enter your credentials to continue</p>
      </div>

      {error && (
        <p className='mt-2 text-center text-lg font-bold text-red-400 animate-fadeIn'>
          {error.message}
        </p>
      )}

      <div className='space-y-6'>
        {/* URL Field */}
        <div>
          <label
            htmlFor='url'
            className='block text-sm font-medium text-gray-200 mb-2'
          >
            Server URL
          </label>
          <div className='relative'>
            <div className='relative'>
              <input
                id='url'
                name='url'
                type='url'
                value={formData.url}
                onChange={handleChange}
                onBlur={handleUrlBlur}
                className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-xl text-white placeholder-gray-400
                 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                   urlError && urlTouched ?
                     "border-red-400 focus:border-red-400 focus:ring-red-400"
                   : "border-gray-600 focus:border-purple-400 focus:ring-purple-400"
                 }`}
                placeholder='https://api.example.com'
              />
            </div>
            {/* URL Status Indicator */}
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
              {urlStatus === "checking" && (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400'></div>
              )}
              {urlStatus === "verified" && (
                <svg
                  className='h-4 w-4 text-green-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </div>
          </div>
          {urlError && urlTouched && (
            <p className='mt-2 text-sm text-red-400 animate-fadeIn'>
              {urlError}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label
            htmlFor='username'
            className='block text-sm font-medium text-gray-200 mb-2'
          >
            Username
          </label>
          <div className='relative'>
            <input
              id='username'
              name='username'
              type='text'
              value={formData.username}
              onChange={handleChange}
              className='appearance-none relative block w-full px-4 py-3 border border-gray-600 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:border-purple-400 focus:ring-purple-400'
              placeholder='Enter your username'
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-200 mb-2'
          >
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              name='password'
              type='text'
              value={formData.password}
              onChange={handleChange}
              className='appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-600 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:border-purple-400 focus:ring-purple-400'
              placeholder='Enter your password'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors'
            >
              {showPassword ?
                <svg
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                  />
                </svg>
              : <svg
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                  />
                </svg>
              }
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!isFormValid || isPending}
          className={`group relative w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 ${
            isFormValid && !isPending ?
              "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25 cursor-pointer"
            : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {isPending ?
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Adding...
            </div>
          : <>
              <span>Add Playlist</span>
              <svg
                className='ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </>
          }
        </button>

        {/* Form Status Display */}
        <div className='mt-6 p-4 bg-black/20 rounded-xl border border-gray-700'>
          <h3 className='text-sm font-medium text-gray-200 mb-3 flex items-center'>
            <svg
              className='h-4 w-4 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Connection Status
          </h3>
          <div className='space-y-2 text-xs'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>URL Validation:</span>
              <span
                className={`font-medium ${
                  urlStatus === "verified" ? "text-green-400"
                  : urlStatus === "checking" ? "text-yellow-400"
                  : "text-gray-500"
                }`}
              >
                {urlStatus === "verified" ?
                  "✓ Valid"
                : urlStatus === "checking" ?
                  "⏳ Checking"
                : "◦ Pending"}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Form Completion:</span>
              <span
                className={`font-medium ${isFormValid ? "text-green-400" : "text-gray-500"}`}
              >
                {isFormValid ? "✓ Complete" : "◦ Incomplete"}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Ready to Connect:</span>
              <span
                className={`font-medium ${isFormValid && !isPending ? "text-green-400" : "text-gray-500"}`}
              >
                {isFormValid && !isPending ? "🚀 Ready" : "⏳ Waiting"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
