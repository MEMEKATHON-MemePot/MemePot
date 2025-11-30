"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const duration = 4500; // 5 seconds
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
      router.push("/ready");
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 w-full h-full z-50">
      {/* Full Background Video */}
      <video autoPlay muted className="absolute inset-0 w-full h-full object-cover">
        <source src="/video.webm" type="video/webm" />
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Bar Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-12">
        <div className="w-full max-w-2xl space-y-4">
          {/* Progress Bar Container */}
          <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30">
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#AD47FF] via-[#C966FF] to-[#8B2FE6] rounded-full transition-all duration-100 ease-linear shadow-lg shadow-[#AD47FF]/50"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Percentage Display */}
          <div className="text-center">
            <span className="text-2xl font-bold text-white drop-shadow-lg">{Math.round(progress)}%</span>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <p className="text-slate-200 text-sm font-medium animate-pulse drop-shadow-lg">Loading MEMEPOT...</p>
          </div>
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
