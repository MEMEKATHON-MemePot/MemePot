import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import PrizeParticipationModal from "./PrizeParticipationModal";
import PrizeWinningsModal from "./PrizeWinningsModal";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useAllPrizePools, useUserTicketCount, useUserWinChance } from "~~/hooks/usePrizePoolData";

interface Prize {
  name: string;
  totalPrize: string;
  currency: string;
  userTickets: number;
  winChance: string;
  nextDraw: string;
  poolId: bigint;
}

interface Winning {
  poolName: string;
  amount: string;
  currency: string;
  place: string;
  gradient: string;
  status: "pending" | "claimed";
  date: string;
}

export default function PrizeStatusSection() {
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showWinningsModal, setShowWinningsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [selectedWinning, setSelectedWinning] = useState<Winning | null>(null);
  const { address: userAddress } = useAccount();

  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([
    { id: "1", label: "Approve Token", status: "pending" },
    { id: "2", label: "Send Transaction", status: "pending" },
  ]);

  // Fetch all prize pools from contract
  const { pools: contractPools } = useAllPrizePools();

  // Convert contract pools to Prize format
  const activePrizes = useMemo<Prize[]>(() => {
    if (!contractPools) return [];

    return contractPools
      .map((pool, index) => {
        const getTokenSymbol = (tokenAddress: string): string => {
          const lowerAddress = tokenAddress.toLowerCase();
          if (lowerAddress.includes("usdt")) return "USDT";
          if (lowerAddress.includes("usdc")) return "USDC";
          return "MEME";
        };

        const totalPrizeFormatted = formatUnits(pool.totalPrize, 18);

        return {
          name: pool.name,
          totalPrize: parseFloat(totalPrizeFormatted).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }),
          currency: getTokenSymbol(pool.token),
          userTickets: 0, // Will be fetched individually if needed
          winChance: "0%", // Will be calculated individually if needed
          nextDraw: new Date(Number(pool.nextDrawTime) * 1000).toISOString(),
          poolId: BigInt(index + 1),
        };
      })
      .filter(prize => {
        // TODO: Filter only pools where user has tickets
        return true;
      });
  }, [contractPools]);

  const [prizeWinnings, setPrizeWinnings] = useState<Winning[]>([
    {
      poolName: "Daily Mega Draw",
      amount: "25.50",
      currency: "USDT",
      place: "5th Place",
      gradient: "from-green-600 to-emerald-600",
      status: "claimed",
      date: "2024-01-15",
    },
    {
      poolName: "Weekly Grand Prize",
      amount: "9.05",
      currency: "USDC",
      place: "8th Place",
      gradient: "from-blue-600 to-cyan-600",
      status: "pending",
      date: "2024-01-10",
    },
  ]);

  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: { [key: string]: string } = {};
      activePrizes.forEach(prize => {
        const now = new Date().getTime();
        const drawTime = new Date(prize.nextDraw).getTime();
        const difference = drawTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            newCountdowns[prize.name] = `${days}d ${hours}h`;
          } else {
            newCountdowns[prize.name] = `${hours}h ${minutes}m`;
          }
        } else {
          newCountdowns[prize.name] = "Drawing...";
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const timer = setInterval(updateCountdowns, 60000);
    return () => clearInterval(timer);
  }, [activePrizes]);

  const handleViewDetails = (prize: Prize) => {
    setSelectedPrize(prize);
    setShowParticipationModal(true);
  };

  const handleClaimPrize = (winning: Winning) => {
    setSelectedWinning(winning);
    setShowWinningsModal(true);
  };

  const handleTransactionStart = () => {
    setShowWinningsModal(false);

    setTransactionSteps([
      { id: "1", label: "Approve Token", status: "processing" },
      { id: "2", label: "Send Transaction", status: "pending" },
    ]);
    setShowTransactionModal(true);

    setTimeout(() => {
      setTransactionSteps([
        { id: "1", label: "Approve Token", status: "completed" },
        { id: "2", label: "Send Transaction", status: "processing" },
      ]);

      setTimeout(() => {
        setTransactionSteps([
          { id: "1", label: "Approve Token", status: "completed" },
          { id: "2", label: "Send Transaction", status: "completed" },
        ]);

        setTimeout(() => {
          setShowTransactionModal(false);

          // Update winning status to claimed
          if (selectedWinning) {
            setPrizeWinnings(prev =>
              prev.map(w =>
                w.poolName === selectedWinning.poolName && w.date === selectedWinning.date
                  ? { ...w, status: "claimed" as const }
                  : w,
              ),
            );
          }
        }, 1500);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="space-y-12">
      {/* Prize Winnings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Prize Winnings</h2>
          <span className="text-sm text-gray-400">{prizeWinnings.length} Total Winnings</span>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Prize Pool</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Date</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {prizeWinnings.map((winning, index) => (
                  <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${winning.gradient} rounded-lg flex items-center justify-center shrink-0`}
                        >
                          <i className="ri-trophy-fill text-white text-lg"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{winning.poolName}</p>
                          <p className="text-sm text-gray-400">{winning.place}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-gray-300">{winning.date}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-green-400">
                        ${winning.amount} {winning.currency}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {winning.status === "claimed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-semibold">
                          <i className="ri-check-line text-xs"></i>
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                          <i className="ri-time-line text-xs"></i>
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {winning.status === "pending" ? (
                        <button
                          onClick={() => handleClaimPrize(winning)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                        >
                          <i className="ri-hand-coin-line"></i>
                          Claim
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Prize Pool Participation */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Prize Pool Participation</h2>
          <span className="text-sm text-gray-400">{activePrizes.length} Active Entries</span>
        </div>

        <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">Prize Pool</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Your Tickets</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Next Draw</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Win Chance</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Prize Amount</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {activePrizes.map((prize, index) => (
                  <tr key={index} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                          <i className="ri-trophy-fill text-white text-lg"></i>
                        </div>
                        <p className="font-semibold text-white">{prize.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-purple-400">{prize.userTickets}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-cyan-400">{countdowns[prize.name] || "Loading..."}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-yellow-400">{prize.winChance}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="font-semibold text-white">
                        ${prize.totalPrize} {prize.currency}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                        <i className="ri-checkbox-circle-fill text-xs"></i>
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleViewDetails(prize)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-eye-line"></i>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showParticipationModal && selectedPrize && (
        <PrizeParticipationModal prize={selectedPrize} onClose={() => setShowParticipationModal(false)} />
      )}

      {/* Prize Winnings Modal */}
      {showWinningsModal && selectedWinning && (
        <PrizeWinningsModal
          winnings={selectedWinning}
          onClose={() => setShowWinningsModal(false)}
          onClaim={handleTransactionStart}
        />
      )}

      {showTransactionModal && (
        <TransactionProgressModal
          isOpen={showTransactionModal}
          steps={transactionSteps}
          onClose={() => setShowTransactionModal(false)}
        />
      )}
    </div>
  );
}
