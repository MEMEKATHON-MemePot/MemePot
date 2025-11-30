"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Brewing Pot Animation */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            {/* Main Pot */}
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
              <i className="ri-flask-fill text-white text-6xl"></i>
            </div>

            {/* Sparkles */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full blur-sm animate-ping"></div>
            <div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full blur-sm animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-0 left-0 w-4 h-4 bg-purple-400 rounded-full blur-sm animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>

            {/* Energy Particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  top: `${50 + Math.cos((i * Math.PI) / 4) * 80}px`,
                  left: `${50 + Math.sin((i * Math.PI) / 4) * 80}px`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Join the Culture,
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Win the Pot
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Your deposit is <span className="text-green-400 font-semibold">always safe</span>. Win prizes{" "}
            <span className="text-cyan-400 font-semibold">24/7, 365 days</span> with our no-loss lottery model.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <i className="ri-shield-check-fill text-green-400 text-xl"></i>
              <span className="text-green-400 font-semibold text-sm">100% Safe</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <i className="ri-lock-fill text-cyan-400 text-xl"></i>
              <span className="text-cyan-400 font-semibold text-sm">No-Loss Model</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <i className="ri-trophy-fill text-purple-400 text-xl"></i>
              <span className="text-purple-400 font-semibold text-sm">Daily Prizes</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/vaults"
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            <i className="ri-flask-line text-2xl"></i>
            Brew Your Tickets
            <i className="ri-arrow-right-line text-xl group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
