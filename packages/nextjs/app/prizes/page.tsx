"use client";

import { useEffect, useState } from "react";
import HeroSection from "./components/HeroSection";
import PrizePoolsSection from "./components/PrizePoolsSection";

interface Star {
  id: number;
  top: number;
  left: number;
  delay: number;
  opacity: number;
}

export default function Prizes() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // 클라이언트 사이드에서만 별을 생성
    const generatedStars = [...Array(50)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(generatedStars);
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118] text-white relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Stars Background */}
      <div className="fixed inset-0 pointer-events-none">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity,
            }}
          ></div>
        ))}
      </div>

      <main className="relative z-10">
        <HeroSection />
        <PrizePoolsSection />
      </main>
    </div>
  );
}
