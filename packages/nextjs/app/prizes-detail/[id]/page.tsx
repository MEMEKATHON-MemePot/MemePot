"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import ParticipateModal from "./components/ParticipateModal";
import PrizeInfoSection from "./components/PrizeInfoSection";
import PrizeStatsSection from "./components/PrizeStatsSection";
import WinnersSection from "./components/WinnersSection";

interface Star {
  id: number;
  top: number;
  left: number;
  delay: number;
  opacity: number;
}

interface PrizesDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PrizesDetail({ params }: PrizesDetailPageProps) {
  const { id } = use(params);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const router = useRouter();

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

  // ID에 따라 상품 데이터를 동적으로 생성
  const prizeData = {
    id,
    name: `Prize Pool #${id}`,
    totalPrize: "11,585",
    currency: "ETH",
    frequency: "Every 6 months",
    duration: "6 months",
    nextDraw: Date.now() + 25 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000 + 42 * 60 * 1000 + 31 * 1000,
    userTickets: 1247,
    winChance: "0.0234%",
    participants: 5328,
    totalTickets: 5328947,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
    description:
      "The ultimate prize pool running every 6 months. Deposit into any vault to earn tickets automatically. The more you deposit, the higher your chances!",
    prizeBreakdown: [
      { place: "1st Place", amount: "5,792.50", percentage: "50%" },
      { place: "2nd Place", amount: "2,896.25", percentage: "25%" },
      { place: "3rd Place", amount: "1,158.50", percentage: "10%" },
      { place: "4th-10th", amount: "1,737.75", percentage: "15%" },
    ],
  };

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

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/prizes")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <i className="ri-arrow-left-line text-xl group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to All Prizes</span>
          </button>

          <PrizeInfoSection prize={prizeData} onParticipate={() => setShowParticipateModal(true)} />
          <PrizeStatsSection prize={prizeData} />
          <WinnersSection />
        </div>
      </main>

      {showParticipateModal && <ParticipateModal prize={prizeData} onClose={() => setShowParticipateModal(false)} />}
    </div>
  );
}
