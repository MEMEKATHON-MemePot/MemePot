import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import PrizePoolCard from "./PrizePoolCard";
import { DrawFrequency, getFrequencyString, useAllPrizePools, useUserWinChance } from "~~/hooks/usePrizePoolData";

interface PrizePool {
  id: string;
  name: string;
  totalPrize: string;
  currency: string;
  frequency: string;
  duration: string;
  nextDraw: number;
  userTickets: number;
  winChance: string;
  participants: number;
  icon: string;
  gradient: string;
}

const mockPrizePools: PrizePool[] = [
  {
    id: "1",
    name: "Ethereum Grand Prize",
    totalPrize: "11,585",
    currency: "ETH",
    frequency: "Every 6 months",
    duration: "6 months",
    nextDraw: Date.now() + 25 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000 + 42 * 60 * 1000 + 31 * 1000,
    userTickets: 1247,
    winChance: "0.0234%",
    participants: 5328,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "2",
    name: "Monthly Meme Jackpot",
    totalPrize: "1,569",
    currency: "MEME",
    frequency: "Monthly",
    duration: "1 month",
    nextDraw: Date.now() + 12 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000 + 15 * 60 * 1000 + 45 * 1000,
    userTickets: 892,
    winChance: "0.0891%",
    participants: 10012,
    icon: "ri-fire-fill",
    gradient: "from-orange-600 to-red-600",
  },
  {
    id: "3",
    name: "Weekly USDT Pool",
    totalPrize: "343",
    currency: "USDT",
    frequency: "6x Monthly",
    duration: "1 week",
    nextDraw: Date.now() + 4 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000 + 32 * 60 * 1000 + 12 * 1000,
    userTickets: 456,
    winChance: "0.1523%",
    participants: 2994,
    icon: "ri-money-dollar-circle-fill",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    id: "4",
    name: "Daily Quick Draw",
    totalPrize: "24",
    currency: "USDC",
    frequency: "70x Monthly",
    duration: "1 day",
    nextDraw: Date.now() + 18 * 60 * 60 * 1000 + 45 * 60 * 1000 + 23 * 1000,
    userTickets: 234,
    winChance: "0.3421%",
    participants: 684,
    icon: "ri-flashlight-fill",
    gradient: "from-cyan-600 to-blue-600",
  },
  {
    id: "5",
    name: "Mega Memecore Lottery",
    totalPrize: "8,750",
    currency: "M",
    frequency: "Every 3 months",
    duration: "3 months",
    nextDraw: Date.now() + 45 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000 + 28 * 60 * 1000 + 56 * 1000,
    userTickets: 1823,
    winChance: "0.0456%",
    participants: 39956,
    icon: "ri-rocket-fill",
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    id: "6",
    name: "Bi-Weekly Bonus",
    totalPrize: "156",
    currency: "ETH",
    frequency: "Every 2 weeks",
    duration: "2 weeks",
    nextDraw: Date.now() + 8 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000 + 42 * 60 * 1000 + 18 * 1000,
    userTickets: 567,
    winChance: "0.2134%",
    participants: 2658,
    icon: "ri-gift-fill",
    gradient: "from-pink-600 to-rose-600",
  },
];

export default function PrizePoolsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const { address: userAddress } = useAccount();

  // Fetch all prize pools from contract
  const { pools: contractPools } = useAllPrizePools();

  // Convert contract pools to display format
  const prizePools: PrizePool[] =
    contractPools?.map((pool, index) => {
      // Token symbol mapping
      const getTokenSymbol = (tokenAddress: string): string => {
        const lowerAddress = tokenAddress.toLowerCase();
        if (lowerAddress.includes("usdt")) return "USDT";
        if (lowerAddress.includes("usdc")) return "USDC";
        return "MEME";
      };

      const tokenSymbol = getTokenSymbol(pool.token);

      // Icon and gradient mapping based on frequency
      const getPoolStyle = (frequency: number) => {
        switch (frequency) {
          case DrawFrequency.Daily:
            return { icon: "ri-flashlight-fill", gradient: "from-cyan-600 to-blue-600" };
          case DrawFrequency.Weekly:
            return { icon: "ri-money-dollar-circle-fill", gradient: "from-green-600 to-emerald-600" };
          case DrawFrequency.BiWeekly:
            return { icon: "ri-gift-fill", gradient: "from-pink-600 to-rose-600" };
          case DrawFrequency.Monthly:
            return { icon: "ri-fire-fill", gradient: "from-orange-600 to-red-600" };
          case DrawFrequency.Quarterly:
            return { icon: "ri-rocket-fill", gradient: "from-purple-600 to-indigo-600" };
          case DrawFrequency.SemiAnnual:
            return { icon: "ri-coin-fill", gradient: "from-purple-600 to-pink-600" };
          default:
            return { icon: "ri-trophy-fill", gradient: "from-yellow-600 to-orange-600" };
        }
      };

      const style = getPoolStyle(pool.frequency);
      const totalPrizeFormatted = formatUnits(pool.totalPrize, 18); // Assuming 18 decimals

      return {
        id: (index + 1).toString(),
        name: pool.name,
        totalPrize: parseFloat(totalPrizeFormatted).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),
        currency: tokenSymbol,
        frequency: getFrequencyString(pool.frequency),
        duration: getFrequencyString(pool.frequency),
        nextDraw: Number(pool.nextDrawTime) * 1000, // Convert to milliseconds
        userTickets: 0, // Will be fetched individually if needed
        winChance: "0%", // Will be calculated individually if needed
        participants: Number(pool.totalParticipants),
        icon: style.icon,
        gradient: style.gradient,
      };
    }) || mockPrizePools;

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % prizePools.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, prizePools.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex(prev => (prev - 1 + prizePools.length) % prizePools.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex(prev => (prev + 1) % prizePools.length);
  };

  const getVisiblePools = () => {
    const pools = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % prizePools.length;
      pools.push(prizePools[index]);
    }
    return pools;
  };

  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Current Prizes
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Multiple active prize pools running 24/7. Pick your favorite and start winning!
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-110"
          >
            <i className="ri-arrow-left-s-line text-2xl"></i>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-purple-600/80 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-110"
          >
            <i className="ri-arrow-right-s-line text-2xl"></i>
          </button>

          {/* Prize Pool Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getVisiblePools().map((pool, index) => (
              <div
                key={pool.id}
                className="transform transition-all duration-500"
                style={{
                  opacity: index === 1 ? 1 : 0.7,
                  scale: index === 1 ? 1 : 0.95,
                }}
              >
                <PrizePoolCard pool={pool} />
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {prizePools.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlay(false);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-purple-500 w-8" : "bg-gray-600 hover:bg-gray-500"
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* All Pools Grid */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Active Prize Pools
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {prizePools.map(pool => (
              <PrizePoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
