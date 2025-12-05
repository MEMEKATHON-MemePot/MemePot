"use client";

import StakingTable from "./components/StakingTable";

export default function Staking() {
  return (
    <div className="min-h-screen bg-[#0a0118]">
      {/* Hero Section with Stats */}
      <div className="relative pt-32 pb-12 px-6 overflow-hidden">
        {/* Background Design */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 left-1/2 w-72 h-72 bg-purple-600/5 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <i className="ri-water-flash-line text-purple-400 text-2xl"></i>
                </div>
                <h1 className="text-4xl font-bold text-white">Staking</h1>
              </div>
              <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
                Select{" "}
                <span className="text-transparent bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text font-semibold">
                  the asset
                </span>{" "}
                you want to stake! <br />
                We&apos;ll reward you with{" "}
                <span className="text-transparent bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text font-semibold">
                  carnival tickets
                </span>{" "}
                and{" "}
                <span className="text-transparent bg-gradient-to-r  from-pink-400 to-pink-500 bg-clip-text font-semibold">
                  staking interest.
                </span>
              </p>
            </div>

            {/* TODO: 연동 */}
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5 min-w-[160px]">
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1.5">7D Volume</div>
                  <div className="text-xl font-bold text-white">$172,774,670</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5 min-w-[160px]">
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1.5">7D TVL</div>
                  <div className="text-xl font-bold text-white">$23,450,000</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5 min-w-[160px]">
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1.5">7D Yields</div>
                  <div className="text-xl font-bold text-white">$131,061</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Table Section */}
      <div className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <StakingTable />
        </div>
      </div>
    </div>
  );
}
