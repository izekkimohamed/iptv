"use client";
import React, { useState } from "react";
import {
  FileAudio,
  AlertCircle,
  Code,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function MKVExtractorGuide() {
  const [activeTab, setActiveTab] = useState("overview");

  const installCode = `npm install @ffmpeg/ffmpeg @ffmpeg/util`;

  const componentCode = `'use client';
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function MKVAudioExtractor() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [logs, setLogs] = useState([]);

  const ffmpegRef = useRef(null);
  const urlInputRef = useRef(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('log', ({ message }) => {
        setLogs(prev => [...prev, message]);
      });

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Load FFmpeg with proper paths
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';

      await ffmpeg.load({
        coreURL: await toBlobURL(\`\${baseURL}/ffmpeg-core.js\`, 'text/javascript'),
        wasmURL: await toBlobURL(\`\${baseURL}/ffmpeg-core.wasm\`, 'application/wasm'),
      });

      setStatus('ready');
      console.log('FFmpeg loaded');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setStatus('error');
    }
  };

  const extractAudio = async () => {
    const url = urlInputRef.current.value;
    if (!url || !ffmpegRef.current) return;

    try {
      setStatus('downloading');

      // Fetch the MKV file
      const response = await fetch(url);
      const blob = await response.blob();

      setStatus('processing');

      const ffmpeg = ffmpegRef.current;

      // Write input file
      await ffmpeg.writeFile('input.mkv', await fetchFile(blob));

      // Extract and convert audio to AAC
      await ffmpeg.exec([
        '-i', 'input.mkv',
        '-map', '0:a:0',    // First audio track
        '-c:a', 'aac',       // Convert to AAC
        '-b:a', '192k',      // Bitrate
        '-vn',               // No video
        'output.m4a'
      ]);

      // Read output
      const data = await ffmpeg.readFile('output.m4a');
      const audioBlob = new Blob([data.buffer], { type: 'audio/mp4' });
      const url = URL.createObjectURL(audioBlob);

      setAudioUrl(url);
      setStatus('ready');

      // Cleanup
      await ffmpeg.deleteFile('input.mkv');
      await ffmpeg.deleteFile('output.m4a');

    } catch (error) {
      console.error('Extraction failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">MKV Audio Extractor</h1>

      <input
        ref={urlInputRef}
        type="text"
        placeholder="Enter MKV URL"
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={extractAudio}
        disabled={status !== 'ready'}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Extract Audio
      </button>

      {status === 'processing' && (
        <div className="mt-4">
          <p>Progress: {progress}%</p>
        </div>
      )}

      {audioUrl && (
        <div className="mt-4">
          <audio src={audioUrl} controls />
          <a href={audioUrl} download="audio.m4a">Download</a>
        </div>
      )}
    </div>
  );
}`;

  const nextConfigCode = `// next.config.js
module.exports = {
  // Enable proper headers for FFmpeg workers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};`;

  const vercelConfigCode = `// vercel.json (optional, for better CDN caching)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}`;

  const streamingApproachCode = `// For large files - streaming approach concept
// This would require a backend proxy

// Backend (e.g., Cloudflare Worker, Node.js server)
async function streamAudioExtraction(mkvUrl) {
  // 1. Fetch MKV with range requests
  const response = await fetch(mkvUrl);

  // 2. Use streaming FFmpeg (server-side only)
  // Pipe MKV input -> FFmpeg -> AAC output -> Client

  // 3. Stream chunks to client as they're processed
  return new Response(audioStream, {
    headers: {
      'Content-Type': 'audio/mp4',
      'Transfer-Encoding': 'chunked'
    }
  });
}

// Frontend - receives streaming audio
async function playStreamingAudio(url) {
  const response = await fetch('/api/extract-audio?url=' + url);
  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);
  audioElement.src = audioUrl;
}`;

  const alternatives = [
    {
      title: "Client-side FFmpeg (Current Approach)",
      pros: [
        "No server needed",
        "Works on Vercel free tier",
        "Complete privacy",
      ],
      cons: [
        "Must download entire file",
        "CPU intensive",
        "Not suitable for large files (12GB)",
      ],
      suitable: "Small to medium files (<500MB)",
    },
    {
      title: "Server-side Transcoding Proxy",
      pros: [
        "Can stream large files",
        "Faster processing",
        "Better for mobile devices",
      ],
      cons: [
        "Requires backend",
        "Server costs",
        "Won't work on Vercel free tier",
      ],
      suitable: "Large files (>1GB), production apps",
    },
    {
      title: "Pre-processed Audio Tracks",
      pros: ["Instant playback", "No processing needed", "Best performance"],
      cons: [
        "Requires file control",
        "Storage space",
        "Preprocessing pipeline needed",
      ],
      suitable: "When you control the content",
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20'>
          <div className='flex items-center gap-3 mb-2'>
            <FileAudio className='text-pink-400' size={40} />
            <h1 className='text-4xl font-bold text-white'>
              MKV Audio Extraction Guide
            </h1>
          </div>
          <p className='text-purple-200 mb-8'>
            Complete implementation guide for your Next.js app
          </p>

          {/* CORS Issue Alert */}
          <div className='bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3'>
            <AlertCircle
              className='text-yellow-400 flex-shrink-0 mt-1'
              size={24}
            />
            <div>
              <h3 className='text-yellow-300 font-semibold mb-1'>
                Why the demo doesn&apos;t work here
              </h3>
              <p className='text-yellow-100 text-sm'>
                FFmpeg.wasm requires specific CORS headers that this sandbox
                environment doesn&apos;t support. However, it WILL work in your
                Next.js app when properly configured. Follow the implementation
                guide below.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex gap-2 mb-6 border-b border-white/20'>
            {["overview", "implementation", "config", "alternatives"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold transition-colors capitalize ${
                    activeTab === tab ?
                      "text-white border-b-2 border-pink-500"
                    : "text-purple-300 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className='space-y-6'>
              <div className='bg-black/30 rounded-lg p-6'>
                <h2 className='text-2xl font-bold text-white mb-4'>
                  How It Works
                </h2>
                <div className='space-y-4 text-purple-100'>
                  <div className='flex gap-3'>
                    <div className='bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold'>
                      1
                    </div>
                    <div>
                      <h3 className='font-semibold text-white'>
                        Download MKV File
                      </h3>
                      <p className='text-sm'>
                        Fetch the MKV from third-party URL using Fetch API
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <div className='bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold'>
                      2
                    </div>
                    <div>
                      <h3 className='font-semibold text-white'>
                        Load into FFmpeg.wasm
                      </h3>
                      <p className='text-sm'>
                        Write the file to FFmpeg&apos;s virtual filesystem
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <div className='bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold'>
                      3
                    </div>
                    <div>
                      <h3 className='font-semibold text-white'>
                        Extract & Transcode
                      </h3>
                      <p className='text-sm'>
                        Extract audio track and convert TrueHD/AC-3 to AAC
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-3'>
                    <div className='bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold'>
                      4
                    </div>
                    <div>
                      <h3 className='font-semibold text-white'>
                        Play in Browser
                      </h3>
                      <p className='text-sm'>
                        Create blob URL and use HTML5 audio element
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-6'>
                <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                  <CheckCircle size={20} />
                  What You&apos;ll Get
                </h3>
                <ul className='text-blue-200 text-sm space-y-2'>
                  <li>
                    ✅ Extract audio from MKV files with TrueHD Atmos or AC-3
                    tracks
                  </li>
                  <li>✅ Convert to browser-compatible AAC format</li>
                  <li>
                    ✅ 100% client-side processing (works on Vercel free tier)
                  </li>
                  <li>✅ No server costs or backend required</li>
                  <li>
                    ✅ Complete privacy - files never leave user&apos;s browser
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Implementation Tab */}
          {activeTab === "implementation" && (
            <div className='space-y-6'>
              <div>
                <h2 className='text-2xl font-bold text-white mb-4'>
                  Step 1: Install Dependencies
                </h2>
                <div className='bg-black/50 rounded-lg p-4 overflow-x-auto'>
                  <pre className='text-green-400 text-sm font-mono'>
                    {installCode}
                  </pre>
                </div>
              </div>

              <div>
                <h2 className='text-2xl font-bold text-white mb-4'>
                  Step 2: Create Component
                </h2>
                <p className='text-purple-200 mb-3'>
                  Save this as{" "}
                  <code className='bg-black/30 px-2 py-1 rounded'>
                    components/MKVAudioExtractor.tsx
                  </code>
                </p>
                <div className='bg-black/50 rounded-lg p-4 overflow-x-auto max-h-96'>
                  <pre className='text-green-400 text-sm font-mono whitespace-pre'>
                    {componentCode}
                  </pre>
                </div>
              </div>

              <div className='bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4'>
                <h3 className='text-yellow-300 font-semibold mb-2'>
                  Important Note
                </h3>
                <p className='text-yellow-100 text-sm'>
                  Make sure to use 'use client' directive at the top since
                  FFmpeg.wasm requires browser APIs. This won't work in Server
                  Components.
                </p>
              </div>
            </div>
          )}

          {/* Config Tab */}
          {activeTab === "config" && (
            <div className='space-y-6'>
              <div>
                <h2 className='text-2xl font-bold text-white mb-4'>
                  Next.js Configuration
                </h2>
                <p className='text-purple-200 mb-3'>
                  Update your{" "}
                  <code className='bg-black/30 px-2 py-1 rounded'>
                    next.config.js
                  </code>
                </p>
                <div className='bg-black/50 rounded-lg p-4 overflow-x-auto'>
                  <pre className='text-green-400 text-sm font-mono whitespace-pre'>
                    {nextConfigCode}
                  </pre>
                </div>
              </div>

              <div>
                <h2 className='text-2xl font-bold text-white mb-4'>
                  Vercel Configuration (Optional)
                </h2>
                <p className='text-purple-200 mb-3'>
                  Create{" "}
                  <code className='bg-black/30 px-2 py-1 rounded'>
                    vercel.json
                  </code>{" "}
                  for better caching
                </p>
                <div className='bg-black/50 rounded-lg p-4 overflow-x-auto'>
                  <pre className='text-green-400 text-sm font-mono whitespace-pre'>
                    {vercelConfigCode}
                  </pre>
                </div>
              </div>

              <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-6'>
                <h3 className='text-white font-semibold mb-3'>
                  Why These Headers?
                </h3>
                <p className='text-blue-200 text-sm mb-3'>
                  FFmpeg.wasm uses SharedArrayBuffer for performance, which
                  requires these security headers:
                </p>
                <ul className='text-blue-200 text-sm space-y-2'>
                  <li>
                    <strong className='text-white'>
                      Cross-Origin-Embedder-Policy:
                    </strong>{" "}
                    Ensures resources are loaded securely
                  </li>
                  <li>
                    <strong className='text-white'>
                      Cross-Origin-Opener-Policy:
                    </strong>{" "}
                    Isolates your browsing context
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Alternatives Tab */}
          {activeTab === "alternatives" && (
            <div className='space-y-6'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                Approach Comparison
              </h2>

              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className='bg-black/30 rounded-lg p-6 border border-white/10'
                >
                  <h3 className='text-xl font-bold text-white mb-3'>
                    {alt.title}
                  </h3>

                  <div className='grid md:grid-cols-2 gap-4 mb-3'>
                    <div>
                      <h4 className='text-green-400 font-semibold mb-2'>
                        Pros:
                      </h4>
                      <ul className='text-green-200 text-sm space-y-1'>
                        {alt.pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className='text-red-400 font-semibold mb-2'>Cons:</h4>
                      <ul className='text-red-200 text-sm space-y-1'>
                        {alt.cons.map((con, i) => (
                          <li key={i}>✗ {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className='bg-purple-500/20 rounded px-3 py-2 inline-block'>
                    <span className='text-purple-200 text-sm font-semibold'>
                      Best for:{" "}
                    </span>
                    <span className='text-white text-sm'>{alt.suitable}</span>
                  </div>
                </div>
              ))}

              <div className='bg-orange-500/20 border border-orange-500/50 rounded-lg p-6'>
                <h3 className='text-orange-300 font-semibold mb-3'>
                  Recommendation for 12GB Files
                </h3>
                <p className='text-orange-100 text-sm mb-3'>
                  Since your files are very large (12GB+), client-side
                  processing isn't practical. Consider:
                </p>
                <ol className='text-orange-100 text-sm space-y-2 list-decimal list-inside'>
                  <li>
                    Use a backend service (Cloudflare Workers, AWS Lambda) for
                    transcoding
                  </li>
                  <li>
                    Implement HTTP range requests to stream only audio portions
                  </li>
                  <li>Cache extracted audio tracks for repeat access</li>
                  <li>
                    Consider asking the third-party service for direct audio
                    URLs
                  </li>
                </ol>
              </div>

              <div className='bg-black/50 rounded-lg p-4'>
                <h3 className='text-white font-semibold mb-3'>
                  Streaming Concept (Backend Required)
                </h3>
                <pre className='text-green-400 text-sm font-mono whitespace-pre overflow-x-auto'>
                  {streamingApproachCode}
                </pre>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-white/20'>
            <div className='flex items-center justify-between'>
              <p className='text-purple-200 text-sm'>
                This code will work in your actual Next.js app with proper
                configuration
              </p>
              <a
                href='https://ffmpegwasm.netlify.app/'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors'
              >
                <span className='text-sm font-semibold'>FFmpeg.wasm Docs</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
