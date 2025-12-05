import { useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import TransactionProgressModal from "~~/components/TransactionProgressModal";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Vault {
  id: string;
  name: string;
  token: string;
  icon: string;
  apr: string;
  tokenContract: string;
  totalDeposits: string;
  chain: string;
  volume24h: string;
  decimals: number;
  isNative?: boolean;
}

// Token addresses and config (deployed on Insectarium network - chainId: 43522)
const TOKENS: { [key: string]: { address: `0x${string}`; decimals: number } } = {
  USDT: { address: "0x681E7bb993F3a6f5710f177A45514Ec5b9cd330E", decimals: 6 },
  USDC: { address: "0x0D651A847C150d0eE1DB767E661E417dB5E2B09a", decimals: 6 },
};

const VAULT_MANAGER_ADDRESS = "0x5D998472F48FAecD46BA3619e982507D257E3801" as `0x${string}`;

export default function StakingTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"tvl" | "apr" | "24h vol">("apr");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
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
  const { writeContractAsync: writeVault } = useScaffoldWriteContract({ contractName: "VaultManager" });
  const { writeContractAsync: writeUSDT } = useScaffoldWriteContract({ contractName: "USDT" });
  const { writeContractAsync: writeUSDC } = useScaffoldWriteContract({ contractName: "USDC" });

  // balance test
  const account = useAccount();
  const { data } = useBalance({
    address: account.address,
    chainId: account.chain?.id,
  });

  const nativeBalance = data?.formatted;

  const MockStakingList: Vault[] = [
    {
      id: "1",
      name: "USDT",
      token: "USDT",
      tokenContract: "0x681E7bb993F3a6f5710f177A45514Ec5b9cd330E",
      icon: "💵",
      apr: "1",
      totalDeposits: "$3,200,000",
      chain: "Memecore",
      volume24h: "$390,123",
      decimals: 6,
      isNative: false,
    },
    {
      id: "2",
      name: "USDC",
      token: "USDC",
      tokenContract: "0x0D651A847C150d0eE1DB767E661E417dB5E2B09a",
      icon: "💎",
      apr: "1",
      totalDeposits: "$8,890,000",
      chain: "Memecore",
      volume24h: "$267,890",
      decimals: 6,
      isNative: false,
    },
    {
      id: "3",
      name: "MEME",
      token: "MEME",
      tokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      icon: "⚡",
      apr: "2",
      totalDeposits: "$5,120,000",
      chain: "Memecore",
      volume24h: "$234,567",
      decimals: 18,
      isNative: true,
    },
  ];

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
        if (entries[0].isIntersecting && !isLoading && displayCount < MockStakingList.length) {
          setIsLoading(true);
          setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + 8, MockStakingList.length));
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

  const filteredStaking = MockStakingList.filter(
    vault =>
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.tokenContract.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedStaking = [...filteredStaking].sort((a, b) => {
    if (sortBy === "tvl") {
      return parseFloat(b.totalDeposits.replace(/[$,]/g, "")) - parseFloat(a.totalDeposits.replace(/[$,]/g, ""));
    } else if (sortBy === "apr") {
      return parseFloat(b.apr) - parseFloat(a.apr);
    } else {
      return parseFloat(b.volume24h.replace(/[$,]/g, "")) - parseFloat(a.volume24h.replace(/[$,]/g, ""));
    }
  });

  const displayedStaking = sortedStaking.slice(0, displayCount);

  const handleFilterSelect = (filter: "tvl" | "apr" | "24h vol") => {
    setSortBy(filter);
    setIsDropdownOpen(false);
  };

  const getFilterLabel = () => {
    switch (sortBy) {
      case "tvl":
        return "TVL";
      case "apr":
        return "APR";
      case "24h vol":
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

  const handleMaxClick = (balance: string) => {
    setDepositAmount(balance);
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

  const calculateAnnualReturn = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0 || !selectedVault) return "0.00";
    const annual = (parseFloat(amount) * parseFloat(selectedVault.apr)) / 100;
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
            <h3 className="text-white font-semibold text-2xl">Trust</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            DeFi projects must operate based on trust. That&apos;s why we&apos;re building long-term rewards and trust
            with well-established, transparent strategies rather than engagement-centric ones.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">
              <i className="ri-shield-check-line text-green-400 text-xl"></i>
            </div>

            <h3 className="text-white font-semibold text-2xl">Safety</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            We believe technology cannot fix DeFi projects. It requires the security trusted such as Liquidity.
            That&apos;s why we consider security as our foremost goal.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#AD47FF]/10 to-pink-500/10 border border-[#AD47FF]/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 flex items-center justify-center bg-pink-500/20 rounded-lg">
              <i className="ri-ticket-2-line text-pink-400 text-xl"></i>
            </div>
            <h3 className="text-white font-semibold text-2xl">Fun</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            With every project launch, 20% takes a year, we build it to provide the fun and excitement of continuous
            events.
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
                onClick={() => handleFilterSelect("apr")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "apr" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                APR
              </button>
              <button
                onClick={() => handleFilterSelect("tvl")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "tvl" ? "bg-[#AD47FF]/20" : ""
                }`}
              >
                TVL
              </button>

              <button
                onClick={() => handleFilterSelect("24h vol")}
                className={`w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#AD47FF]/20 transition-colors cursor-pointer ${
                  sortBy === "24h vol" ? "bg-[#AD47FF]/20" : ""
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
                      Balance:{" "}
                      <span className="text-white font-semibold">{selectedVault.isNative ? nativeBalance : "1"}</span>
                    </span>
                    <button
                      onClick={() => handleMaxClick(selectedVault.isNative && nativeBalance ? nativeBalance : "1")}
                      className="px-2 py-1 text-xs text-[#AD47FF] hover:text-pink-400 transition-colors cursor-pointer font-bold bg-[#AD47FF]/10 rounded border border-[#AD47FF]/30 hover:bg-[#AD47FF]/20"
                    >
                      MAX
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 gap-3">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-[60%] bg-transparent text-white text-3xl font-bold outline-none placeholder-gray-600"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#AD47FF]/10 rounded-lg border border-[#AD47FF]/20 shrink-0">
                    <span className="text-xl">{selectedVault.icon}</span>
                    <span className="text-white font-semibold text-sm">{selectedVault.token}</span>
                  </div>
                </div>
                {parseFloat(depositAmount) >
                  (selectedVault.isNative && nativeBalance ? parseFloat(nativeBalance) : 1) && (
                  <span className="text-sm text-red-500 font-medium">Exceeds available balance</span>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  ≈ ${depositAmount ? parseFloat(depositAmount) * 1 : "0.00"}
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
                      <span className="text-sm text-gray-300">Fixed APR Return</span>
                    </div>
                    <div className="text-right">
                      {/* TODO: Fixed APY 어떻게 할지 */}
                      <div className="text-green-400 font-bold text-sm">{selectedVault.apr}%</div>
                      <div className="text-xs text-gray-500">~${calculateAnnualReturn(depositAmount)}/year</div>
                    </div>
                  </div>

                  {/* Point Contribution */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Point Contribution</span>
                    </div>
                    <div className="text-right">
                      <div className="text-pink-400 font-bold text-sm">{depositAmount} P</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50 my-2"></div>

                  {/* Total APY */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-semibold">Daily Total Earn Points</span>
                    <div className="text-[#AD47FF] font-bold text-base">{selectedVault.apr}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {/* TODO: balance max */}
            <div className="space-y-3">
              <button
                onClick={handleDepositSubmit}
                disabled={
                  !depositAmount ||
                  parseFloat(depositAmount) <= 0 ||
                  parseFloat(depositAmount) > (selectedVault.isNative && nativeBalance ? parseFloat(nativeBalance) : 1)
                }
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-[#AD47FF] rounded-xl text-white font-bold text-base hover:shadow-[0_0_30px_rgba(173,71,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                {parseFloat(depositAmount) <=
                  (selectedVault.isNative && nativeBalance ? parseFloat(nativeBalance) : 1) &&
                depositAmount &&
                parseFloat(depositAmount) > 0
                  ? `Deposit ${depositAmount} ${selectedVault.token}`
                  : "Enter an amount"}
              </button>
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
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Pool</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">APR</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">
                  Total Deposits
                </th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">24h Volume</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Chain</th>
                <th className="px-6 py-4 text-center text-sm font-normal text-white whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedStaking.map((vault, index) => (
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

                  {/* APR */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-green-400 text-sm">{vault.apr}%</div>
                  </td>

                  {/* Total Deposits */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white text-sm">{vault.totalDeposits}</div>
                  </td>

                  {/* 24h Volume */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-white text-sm">{vault.volume24h}</div>
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
      {displayCount < sortedStaking.length && (
        <div ref={observerRef} className="flex justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#AD47FF] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading more Staking...</span>
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {displayCount >= sortedStaking.length && sortedStaking.length > 8 && (
        <div className="flex justify-center py-6">
          <span className="text-sm text-gray-500">All Staking loaded</span>
        </div>
      )}
    </div>
  );
}
