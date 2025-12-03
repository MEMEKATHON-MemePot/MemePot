"use client";

import { useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Vault {
  id: string;
  name: string;
  token: string;
  tokenContract: string;
  icon: string;
  maxPrize: string;
  baseAPR: string;
  ticketAPR: string;
  totalDeposits: string;
  chain: string;
  volume24h: string;
  decimals: number;
  isNative?: boolean;
}

// Token addresses and config
const TOKENS: { [key: string]: { address: `0x${string}`; decimals: number } } = {
  USDT: { address: "0x0f4eAD391dff7f730E2D9247A3D964D2724dF665", decimals: 6 },
  USDC: { address: "0x2077cB638513369254060b8d488Dd23cD0a97837", decimals: 6 },
};

const VAULT_MANAGER_ADDRESS = "0x1eB771E8620582AAc92700Dd7b55451De529E760" as `0x${string}`;

export default function VaultsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"tvl" | "apy" | "volume">("tvl");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionSteps, setTransactionSteps] = useState<
    Array<{ id: string; label: string; status: "pending" | "processing" | "completed" | "failed" }>
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Blockchain write hooks
  const { writeContractAsync: writeVault } = useScaffoldWriteContract("VaultManager");
  const { writeContractAsync: writeUSDT } = useScaffoldWriteContract("USDT");
  const { writeContractAsync: writeUSDC } = useScaffoldWriteContract("USDC");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (selectedVault) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedVault]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && displayCount < vaults.length) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + 3, vaults.length));
            setIsLoading(false);
          }, 500);
        }
      },
      { threshold: 0.1 },
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, displayCount]);

  const vaults: Vault[] = [
    {
      id: "1",
      name: "Prize USDT",
      token: "USDT",
      tokenContract: "USDT",
      icon: "💵",
      maxPrize: "Up to $50,000",
      baseAPR: "4.2",
      ticketAPR: "2.8",
      totalDeposits: "$3,200,000",
      chain: "Memecore",
      volume24h: "$890,123",
      decimals: 6,
      isNative: false,
    },
    {
      id: "2",
      name: "Prize USDC",
      token: "USDC",
      tokenContract: "USDC",
      icon: "💎",
      maxPrize: "Up to $75,000",
      baseAPR: "5.1",
      ticketAPR: "3.2",
      totalDeposits: "$1,890,000",
      chain: "Memecore",
      volume24h: "$4,567,890",
      decimals: 6,
      isNative: false,
    },
    {
      id: "3",
      name: "Prize MEME",
      token: "MEME",
      tokenContract: "NATIVE",
      icon: "🔥",
      maxPrize: "Up to $100,000",
      baseAPR: "3.8",
      ticketAPR: "2.5",
      totalDeposits: "$5,120,000",
      chain: "Memecore",
      volume24h: "$1,234,567",
      decimals: 18,
      isNative: true,
    },
  ];

  const filteredVaults = vaults.filter(
    vault =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.token.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedVaults = [...filteredVaults].sort((a, b) => {
    if (sortBy === "tvl") {
      return parseFloat(b.totalDeposits.replace(/[$,]/g, "")) - parseFloat(a.totalDeposits.replace(/[$,]/g, ""));
    } else if (sortBy === "apy") {
      return parseFloat(b.baseAPR) - parseFloat(a.baseAPR);
    } else {
      return parseFloat(b.volume24h.replace(/[$,]/g, "")) - parseFloat(a.volume24h.replace(/[$,]/g, ""));
    }
  });

  const displayedVaults = sortedVaults.slice(0, displayCount);

  const handleFilterSelect = (filter: "tvl" | "apy" | "volume") => {
    setSortBy(filter);
    setIsDropdownOpen(false);
  };

  const getFilterLabel = () => {
    switch (sortBy) {
      case "tvl":
        return "TVL";
      case "apy":
        return "APY";
      case "volume":
        return "24h Vol";
      default:
        return "TVL";
    }
  };

  const handleDepositClick = (vault: Vault) => {
    setSelectedVault(vault);
    setDepositAmount("");
  };

  const handleCloseModal = () => {
    setSelectedVault(null);
    setDepositAmount("");
  };

  const handleMaxClick = () => {
    setDepositAmount("1000"); // Example max balance
  };

  const handleDepositSubmit = async () => {
    if (!selectedVault || !depositAmount) {
      console.error("Missing required data");
      return;
    }

    try {
      const amount = parseUnits(depositAmount, selectedVault.decimals);

      if (selectedVault.isNative) {
        // Native token deposit (MEME) - no approval needed
        setTransactionSteps([{ id: "1", label: "Deposit Native Token", status: "processing" }]);
        setShowTransactionModal(true);
        handleCloseModal();

        // Call depositNative with value
        await writeVault({
          functionName: "depositNative",
          value: amount,
        });

        setTransactionSteps([{ id: "1", label: "Deposit Native Token", status: "completed" }]);

        setTimeout(() => {
          setShowTransactionModal(false);
        }, 1500);
      } else {
        // ERC20 token deposit (USDT, USDC)
        setTransactionSteps([
          { id: "1", label: "Approve Token", status: "processing" },
          { id: "2", label: "Deposit to Vault", status: "pending" },
        ]);
        setShowTransactionModal(true);
        handleCloseModal();

        const tokenInfo = TOKENS[selectedVault.token];
        const writeToken = selectedVault.tokenContract === "USDT" ? writeUSDT : writeUSDC;

        // Step 1: Approve token
        await writeToken({
          functionName: "approve",
          args: [VAULT_MANAGER_ADDRESS, amount],
        });

        setTransactionSteps([
          { id: "1", label: "Approve Token", status: "completed" },
          { id: "2", label: "Deposit to Vault", status: "processing" },
        ]);

        // Step 2: Deposit to vault
        await writeVault({
          functionName: "deposit",
          args: [tokenInfo.address, amount],
        });

        setTransactionSteps([
          { id: "1", label: "Approve Token", status: "completed" },
          { id: "2", label: "Deposit to Vault", status: "completed" },
        ]);

        setTimeout(() => {
          setShowTransactionModal(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setTransactionSteps(prev =>
        prev.map(step => (step.status === "processing" ? { ...step, status: "failed" as const } : step)),
      );
    }
  };

  const calculateEstimatedTickets = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0 || !selectedVault) return 0;
    // Estimate: 1 ticket per $10 deposited (example calculation)
    return Math.floor(parseFloat(amount) / 10);
  };

  const calculateAnnualReturn = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0 || !selectedVault) return "0.00";
    const annual = (parseFloat(amount) * parseFloat(selectedVault.baseAPR)) / 100;
    return annual.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#AD47FF]/20 rounded-lg">
              <i className="ri-money-dollar-circle-line text-[#AD47FF] text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">Fixed Yield</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Earn guaranteed returns on your deposits. Base yield is paid out regularly regardless of prize outcomes.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-pink-500/20 rounded-lg">
              <i className="ri-ticket-2-line text-pink-400 text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">Event Tickets</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Additional yield is converted into event tickets, giving you chances to win prizes while maintaining your
            principal.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
              <i className="ri-shield-check-line text-green-400 text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-sm">No Loss</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your principal is always safe. Withdraw anytime with no penalties. Only the yield is used for prizes and
            tickets.
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base"></i>
          <input
            type="text"
            placeholder="Search by token name or contract"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#0f0820]/60 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#AD47FF]/50 transition-colors"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#AD47FF]/20 to-pink-500/20 border border-[#AD47FF]/30 rounded-lg text-white hover:from-[#AD47FF]/30 hover:to-pink-500/30 transition-all text-sm cursor-pointer whitespace-nowrap"
          >
            <span>{getFilterLabel()}</span>
            <i className={`ri-arrow-${isDropdownOpen ? "up" : "down"}-s-line text-base transition-transform`}></i>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#1a0f2e] border border-[#AD47FF]/30 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => handleFilterSelect("tvl")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "tvl" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                TVL
              </button>
              <button
                onClick={() => handleFilterSelect("apy")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "apy" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                APY
              </button>
              <button
                onClick={() => handleFilterSelect("volume")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "volume" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                24h Vol
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative bg-gradient-to-br from-[#1a0f2e] to-[#0f0820] border border-[#AD47FF]/30 rounded-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto mx-4 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">Deposit {selectedVault.token}</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#AD47FF]/20 text-[#AD47FF] rounded-full border border-[#AD47FF]/30 text-xs font-medium">
                  {selectedVault.chain}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{selectedVault.name}</span>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-4 mb-6">
              {/* Amount Input */}
              <div className="bg-[#0f0820]/60 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400 font-medium">Deposit Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Balance: <span className="text-white font-semibold">1,000</span>
                    </span>
                    <button
                      onClick={handleMaxClick}
                      className="px-2 py-1 text-xs text-[#AD47FF] hover:text-pink-400 transition-colors cursor-pointer font-bold bg-[#AD47FF]/10 rounded border border-[#AD47FF]/30 hover:bg-[#AD47FF]/20"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-white text-3xl font-bold outline-none placeholder-gray-600"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#AD47FF]/10 rounded-lg border border-[#AD47FF]/20 shrink-0">
                    <span className="text-xl">{selectedVault.icon}</span>
                    <span className="text-white font-semibold text-sm">{selectedVault.token}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  ≈ ${depositAmount ? (parseFloat(depositAmount) * 1).toFixed(2) : "0.00"} USD
                </div>
              </div>

              {/* APY Breakdown & Benefits */}
              <div className="bg-gradient-to-br from-[#AD47FF]/5 to-pink-500/5 border border-[#AD47FF]/20 rounded-xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <i className="ri-pie-chart-line text-[#AD47FF]"></i>
                  Deposit Summary & Rewards
                </h3>

                <div className="space-y-3">
                  {/* Fixed APY */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Fixed APY Return</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-sm">{selectedVault.baseAPR}%</div>
                      <div className="text-xs text-gray-500">~${calculateAnnualReturn(depositAmount)}/year</div>
                    </div>
                  </div>

                  {/* Prize Contribution */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Prize Contribution</span>
                    </div>
                    <div className="text-right">
                      <div className="text-pink-400 font-bold text-sm">{selectedVault.ticketAPR}%</div>
                      <div className="text-xs text-gray-500">Converted to tickets</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50 my-2"></div>

                  {/* Total APY */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-semibold">Total APY</span>
                    <div className="text-[#AD47FF] font-bold text-base">
                      {(parseFloat(selectedVault.baseAPR) + parseFloat(selectedVault.ticketAPR)).toFixed(1)}%
                    </div>
                  </div>

                  {/* Estimated Tickets */}
                  <div className="bg-gradient-to-r from-pink-500/10 to-[#AD47FF]/10 border border-pink-500/20 rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-pink-500/20 rounded-lg animate-pulse">
                          <i className="ri-ticket-2-line text-pink-400 text-lg"></i>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Estimated Weekly Tickets</div>
                          <div className="text-white font-bold text-lg">{calculateEstimatedTickets(depositAmount)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Win Chance</div>
                        <div className="text-pink-400 font-semibold text-sm">
                          {depositAmount && parseFloat(depositAmount) > 0 ? "~0.5%" : "0%"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Guarantee */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-green-500/20 rounded-full">
                  <i className="ri-shield-check-line text-green-400 text-base"></i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Withdraw Anytime, No Principal Loss Guaranteed</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Your deposit is always safe and accessible. Only the yield is used for prizes and tickets. You can
                    withdraw your full principal at any time with no penalties.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-error-warning-line text-orange-400 text-lg"></i>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Learn about the risks</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    PoolTogether is a permissionless protocol. Prize vaults can be deployed by anyone. Make sure you
                    know what you are depositing into.{" "}
                    <span className="text-[#AD47FF] cursor-pointer hover:underline">
                      Learn more about this prize vault.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDepositSubmit}
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-[#AD47FF] rounded-xl text-white font-bold text-base hover:shadow-[0_0_30px_rgba(173,71,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {depositAmount && parseFloat(depositAmount) > 0
                  ? `Deposit ${depositAmount} ${selectedVault.token}`
                  : "Enter an amount"}
              </button>

              {depositAmount && parseFloat(depositAmount) > 0 && !selectedVault.isNative && (
                <button
                  onClick={handleDepositSubmit}
                  className="w-full py-3 bg-[#AD47FF]/10 border border-[#AD47FF]/30 rounded-xl text-[#AD47FF] font-semibold text-sm hover:bg-[#AD47FF]/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Approve {selectedVault.token}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Progress Modal */}
      <TransactionProgressModal
        isOpen={showTransactionModal}
        steps={transactionSteps}
        onClose={() => setShowTransactionModal(false)}
      />

      {/* Table */}
      <div className="bg-[#0f0820]/40 border border-gray-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Vault</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Base Yield</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Ticket Yield</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Total APR</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">
                  Total Deposits
                </th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Chain</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedVaults.map((vault, index) => (
                <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition-colors">
                  {/* Pool */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-2xl">{vault.icon}</div>
                      <div>
                        <div className="font-semibold text-white text-sm">{vault.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Base Yield */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm">
                      {vault.baseAPR}% <span className="text-xs text-gray-400">(Fixed)</span>
                    </div>
                  </td>

                  {/* Ticket Yield */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm">
                      {vault.ticketAPR}% <span className="text-xs text-gray-400">(Tickets)</span>
                    </div>
                  </td>

                  {/* Total APR */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-pink-400 text-base">
                      {(parseFloat(vault.baseAPR) + parseFloat(vault.ticketAPR)).toFixed(1)}%
                    </div>
                  </td>

                  {/* Total Deposits */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white text-sm">{vault.totalDeposits}</div>
                  </td>

                  {/* Chain */}
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs px-2 py-1 bg-[#AD47FF]/20 text-[#AD47FF] rounded-md border border-[#AD47FF]/30 inline-block">
                      {vault.chain}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDepositClick(vault)}
                      className="px-5 py-2 bg-gradient-to-r from-pink-500 to-[#AD47FF] rounded-full text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(173,71,255,0.5)] transition-all whitespace-nowrap cursor-pointer"
                    >
                      Deposit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite Scroll Trigger & Loading */}
      {displayCount < sortedVaults.length && (
        <div ref={observerRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#AD47FF] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading more vaults...</span>
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {displayCount >= sortedVaults.length && sortedVaults.length > 3 && (
        <div className="flex justify-center py-6">
          <span className="text-sm text-gray-500">All vaults loaded</span>
        </div>
      )}
    </div>
  );
}
