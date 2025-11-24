"use client";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import React from "react";

export default function SignInPage() {
  const { data: session } = authClient.useSession();

  if (session) {
    redirect("/");
  }
  const handleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='max-w-md w-full bg-black/20 backdrop-blur-md shadow-2xl rounded-2xl p-8 py-20'>
        <header className='text-center mb-6 space-y-1'>
          <h1 className='text-2xl font-semibold text-white'>
            Welcome SteamMax
          </h1>
          <p className='text-sm text-slate-300 mt-1'>
            Sign in to continue for the best experience.
          </p>
        </header>

        <main className='space-y-6'>
          <button
            onClick={() => handleSignIn()}
            className='w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-500 hover:bg-slate-500 text-white hover:text-black transition-colors cursor-pointer'
            aria-label='Sign in with Google'
          >
            <svg width='20' height='20' viewBox='0 0 533.5 544.3' aria-hidden>
              <path
                fill='#4285f4'
                d='M533.5 278.4c0-18.5-1.5-37.1-4.9-54.8H272v103.8h146.9c-6.3 34-25.2 62.8-53.9 82.2v68.2h87.2c51-47 82.3-116.3 82.3-199.4z'
              />
              <path
                fill='#34a853'
                d='M272 544.3c73.4 0 135-24.2 180-65.6l-87.2-68.2c-24.3 16.3-55.6 26-92.8 26-71 0-131.3-47.9-152.8-112.4H29.6v70.6C74.2 484.5 167.5 544.3 272 544.3z'
              />
              <path
                fill='#fbbc04'
                d='M119.2 327.9c-10.9-32.6-10.9-67.2 0-99.8V157.5H29.6c-43.7 85-43.7 186.1 0 271.1l89.6-100.7z'
              />
              <path
                fill='#ea4335'
                d='M272 108.1c38.3 0 72.6 13.2 99.8 39.2l74.7-74.7C407 24.1 345.4 0 272 0 167.5 0 74.2 59.8 29.6 157.5l89.6 70.6C140.7 155.9 201 108.1 272 108.1z'
              />
            </svg>

            <span className='text-sm font-medium'>Sign in with Google</span>
          </button>

          <p className='text-xs text-slate-400 text-center'>
            By continuing, you agree to our <a className='underline'>Terms</a>{" "}
            and <a className='underline'>Privacy Policy</a>.
          </p>
        </main>

        {/* <footer className='mt-6 text-center text-sm text-slate-500'>
          Need an account? <a className='underline'>Sign up</a>
        </footer> */}
      </div>
    </div>
  );
}
