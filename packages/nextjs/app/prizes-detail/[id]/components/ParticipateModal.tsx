import { useEffect, useRef, useState } from "react";

interface ParticipateModalProps {
  prize: {
    name: string;
    totalPrize: string;
    currency: string;
    gradient: string;
    userTickets: number;
    winChance: string;
    totalTickets: number;
  };
  onClose: () => void;
}

export default function ParticipateModal({ prize, onClose }: ParticipateModalProps) {
  const [ticketsToUse, setTicketsToUse] = useState(0);
  const [newWinChance, setNewWinChance] = useState(prize.winChance);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    try {
      // Calculate new win chance based on tickets
      const currentChance = parseFloat(prize.winChance);
      if (isNaN(currentChance)) {
        setError("Invalid win chance format");
        return;
      }

      if (prize.totalTickets <= 0) {
        setError("Invalid total tickets");
        return;
      }

      const additionalChance = (ticketsToUse / prize.totalTickets) * 100;
      const total = currentChance + additionalChance;
      setNewWinChance(total.toFixed(4) + "%");
      setError(null);
    } catch (err) {
      setError("Error calculating win chance");
      console.error("Win chance calculation error:", err);
    }
  }, [ticketsToUse, prize.totalTickets, prize.winChance]);

  const handleMaxClick = () => {
    try {
      if (prize.userTickets && !isNaN(prize.userTickets)) {
        setTicketsToUse(prize.userTickets);
      }
    } catch (err) {
      setError("Error setting maximum tickets");
      console.error("Max click error:", err);
    }
  };

  const handleConfirm = () => {
    try {
      if (ticketsToUse <= 0) {
        setError("Please select at least one ticket");
        return;
      }
      if (ticketsToUse > prize.userTickets) {
        setError("Cannot use more tickets than available");
        return;
      }
      // Handle participation logic here
      console.log("Participating with", ticketsToUse, "tickets");
      onClose();
    } catch (err) {
      setError("Error confirming participation");
      console.error("Confirm error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a0a2e] to-[#0a0118] rounded-2xl border border-purple-500/30 shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg flex items-center justify-center transition-all hover:scale-110 z-10"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 bg-gradient-to-br ${prize.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50 animate-pulse`}
            >
              <i className="ri-ticket-fill text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Participate in Prize Pool
            </h2>
            <p className="text-gray-400">{prize.name}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Prize Info */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Total Prize Pool</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {prize.totalPrize}
                </span>
                <span className="text-2xl font-bold text-purple-400">{prize.currency}</span>
              </div>
            </div>
          </div>

          {/* Ticket Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">Number of Tickets to Use</label>
            <div className="relative">
              <input
                type="number"
                value={ticketsToUse}
                onChange={e => {
                  const value = parseInt(e.target.value) || 0;
                  if (!isNaN(value)) {
                    setTicketsToUse(Math.min(Math.max(0, value), prize.userTickets || 0));
                  }
                }}
                className="w-full bg-[#0a0118]/60 border border-purple-500/30 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500/60 transition-all"
                placeholder="0"
                min="0"
                max={prize.userTickets || 0}
              />
              <button
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
              >
                MAX
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-400">Available Tickets</span>
              <span className="text-white font-semibold">{(prize.userTickets || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Win Chance Simulation */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0a0118]/60 rounded-xl border border-purple-500/20 p-4">
              <p className="text-xs text-gray-400 mb-2">Current Win Chance</p>
              <p className="text-2xl font-bold text-gray-300">{prize.winChance}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/40 p-4">
              <p className="text-xs text-gray-400 mb-2">New Win Chance</p>
              <p className="text-2xl font-bold text-green-400">{newWinChance}</p>
            </div>
          </div>

          {/* Safety Message */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-shield-check-fill text-green-400 text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-green-400 mb-1">100% Safe & Secure</h4>
                <p className="text-sm text-gray-300">
                  Withdraw Anytime, No Principal Loss Guaranteed. Your deposits are always safe and accessible.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={ticketsToUse === 0}
              className={`flex-1 py-3 bg-gradient-to-r ${prize.gradient} hover:opacity-90 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <i className="ri-check-line text-xl"></i>
              Confirm Participation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
