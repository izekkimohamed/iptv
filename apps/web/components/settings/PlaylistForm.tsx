'use client';

import { AlertCircle, CheckCircle2, Database, Globe, Key, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
const PlaylistForm = ({
  formData,
  setFormData,
  isVerifying,
  handleSubmit,
  isFormValid,
  urlError,
  urlTouched,
  setUrlTouched,
  urlStatus,
}: any) => {
  return (
    <Card className="overflow-hidden rounded-2xl border-white/10 bg-neutral-100/5 backdrop-blur-sm">
      <CardHeader className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-white">New Connection</CardTitle>
            <CardDescription className="text-neutral-400">
              Configure a new Xtream Codes provider
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
            Host URL
          </label>
          <div className="group relative">
            <Globe className="absolute top-3 left-3 h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-amber-500" />
            <input
              type="url"
              placeholder="http://provider.com:8080"
              value={formData.url}
              onBlur={() => setUrlTouched(true)}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className={`w-full rounded-xl border py-2.5 pr-10 pl-10 text-sm text-white transition-all outline-none placeholder:text-neutral-600 ${
                urlError && urlTouched
                  ? 'animate-shake border-red-500/50 bg-red-500/5 focus:border-red-500'
                  : 'border-white/10 bg-transparent focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50'
              } `}
            />

            {/* Right Side Status Icons */}
            <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
              {urlError && urlTouched ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : urlStatus === 'verified' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
              Username
            </label>
            <div className="group relative">
              <User className="absolute top-3 left-3 h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-amber-500" />
              <input
                className="w-full rounded-xl border border-white/10 py-2.5 pr-4 pl-10 text-sm text-white transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
              Password
            </label>
            <div className="group relative">
              <Key className="absolute top-3 left-3 h-4 w-4 text-neutral-500 transition-colors group-focus-within:text-amber-500" />
              <input
                type={'text'}
                className="w-full rounded-xl border border-white/10 py-2.5 pr-10 pl-10 text-sm text-white transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="py-4">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isVerifying}
          className="h-11 w-full rounded-xl border-0 bg-linear-to-r from-amber-600 to-amber-500 font-semibold text-white shadow-lg shadow-amber-900/20 hover:from-amber-500 hover:to-amber-400"
        >
          {isVerifying ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
            </div>
          ) : (
            'Add Playlist'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlaylistForm;
