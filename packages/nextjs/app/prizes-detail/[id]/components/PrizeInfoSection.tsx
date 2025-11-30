import { useEffect, useState } from "react";

interface PrizeInfoSectionProps {
  prize: {
    name: string;
    totalPrize: string;
    currency: string;
    frequency: string;
    duration: string;
    nextDraw: number;
    icon: string;
    gradient: string;
    description: string;
    prizeBreakdown: Array<{
      place: string;
      amount: string;
      percentage: string;
    }>;
  };
  onParticipate: () => void;
}

export default function PrizeInfoSection({ prize, onParticipate }: PrizeInfoSectionProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = prize.nextDraw - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Handle when countdown reaches zero
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [prize.nextDraw]);

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Prize Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${prize.gradient} rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse shrink-0`}
            >
              <i className={`${prize.icon} text-white text-4xl`}></i>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {prize.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300 font-semibold">
                  {prize.frequency}
                </span>
                <span className="px-4 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-sm text-green-300 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  LIVE NOW
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <p className="text-gray-300 leading-relaxed">{prize.description}</p>
          </div>

          {/* Prize Breakdown */}
          <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="ri-trophy-fill text-yellow-400"></i>
              Prize Breakdown
            </h3>
            <div className="space-y-3">
              {prize.prizeBreakdown?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#0a0118]/60 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${prize.gradient} rounded-lg flex items-center justify-center text-sm font-bold shrink-0`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-white font-semibold">{item.place}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-cyan-400">
                      {item.amount} {prize.currency}
                    </div>
                    <div className="text-sm text-gray-400">{item.percentage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Prize Pool & Countdown */}
        <div className="space-y-6">
          {/* Total Prize Pool */}
          <div className="relative bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${prize.gradient} opacity-10`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

            <div className="relative text-center">
              <p className="text-gray-400 mb-4 text-lg">Total Prize Pool</p>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {prize.totalPrize}
                </span>
                <span className="text-4xl font-bold text-purple-400">{prize.currency}</span>
              </div>

              {/* Animated Sparkles */}
              <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Next Draw In:</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.days}</div>
                <div className="text-sm text-gray-400">Days</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.hours}</div>
                <div className="text-sm text-gray-400">Hours</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-400">Mins</div>
              </div>
              <div className="bg-[#0a0118]/60 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-4xl font-bold text-cyan-400 mb-2 animate-pulse">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-400">Secs</div>
              </div>
            </div>
          </div>

          {/* Safety Message */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                <i className="ri-shield-check-fill text-green-400 text-2xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-400 mb-2">100% Safe & Secure</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Withdraw Anytime, No Principal Loss Guaranteed. Your deposits are always safe and accessible.
                </p>
              </div>
            </div>
          </div>

          {/* Participate Button */}
          <button
            onClick={onParticipate}
            className={`w-full py-4 bg-gradient-to-r ${prize.gradient} hover:opacity-90 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-3 whitespace-nowrap`}
          >
            <i className="ri-ticket-fill text-2xl"></i>
            Participate Now
            <i className="ri-arrow-right-line text-xl"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
