"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    // Navigate to home after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/about");
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6 z-50">
      <div className="w-full max-w-2xl space-y-12">
        {/* Main Image */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-xl aspect-square">
            <Image
              src="https://static.readdy.ai/image/81321a78412c64096b7e8254e4d15860/d0f6806b524c9604c0ce97623c1738cc.png"
              alt="MEMEPOT Loading"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-4">
          {/* Progress Bar Container */}
          <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30">
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-100 ease-linear shadow-lg shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Percentage Display */}
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium animate-pulse">Loading MEMEPOT...</p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
