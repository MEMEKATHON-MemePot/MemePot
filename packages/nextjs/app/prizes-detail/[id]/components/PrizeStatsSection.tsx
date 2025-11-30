interface PrizeStatsSectionProps {
  prize: {
    userTickets: number;
    winChance: string;
    participants: number;
    totalTickets: number;
  };
}

export default function PrizeStatsSection({ prize }: PrizeStatsSectionProps) {
  // Calculate progress bar width safely
  const getTicketPercentage = () => {
    if (!prize?.totalTickets || prize.totalTickets === 0) return 0;
    return Math.min((prize.userTickets / prize.totalTickets) * 100, 100);
  };

  // Safe number formatting
  const formatNumber = (num: number | undefined) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    return num.toLocaleString();
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-8 text-center">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Participation Stats
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Your Tickets */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/60 transition-all hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-ticket-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Your Tickets</p>
              <p className="text-3xl font-bold text-white">{formatNumber(prize?.userTickets)}</p>
            </div>
          </div>
          <div className="h-2 bg-[#0a0118]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"
              style={{ width: `${getTicketPercentage()}%` }}
            ></div>
          </div>
        </div>

        {/* Win Chance */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6 hover:border-green-500/60 transition-all hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-percent-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Win Chance</p>
              <p className="text-3xl font-bold text-green-400">{prize?.winChance || "0%"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Based on current tickets</p>
        </div>

        {/* Total Participants */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6 hover:border-cyan-500/60 transition-all hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-group-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Participants</p>
              <p className="text-3xl font-bold text-cyan-400">{formatNumber(prize?.participants)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Active players</p>
        </div>

        {/* Total Tickets */}
        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6 hover:border-orange-500/60 transition-all hover:scale-105">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-stack-fill text-white text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Tickets</p>
              <p className="text-3xl font-bold text-orange-400">{formatNumber(prize?.totalTickets)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">In this pool</p>
        </div>
      </div>
    </section>
  );
}
