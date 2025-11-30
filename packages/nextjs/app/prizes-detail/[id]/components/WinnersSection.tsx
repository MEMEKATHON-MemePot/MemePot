const mockWinners = [
  {
    id: 1,
    address: "0x742d...8f3a",
    prize: "5,792.50",
    currency: "ETH",
    place: "1st",
    date: "2024-01-15",
    avatar: "ri-user-fill",
  },
  {
    id: 2,
    address: "0x9a3c...2d1b",
    prize: "2,896.25",
    currency: "ETH",
    place: "2nd",
    date: "2024-01-15",
    avatar: "ri-user-2-fill",
  },
  {
    id: 3,
    address: "0x5e7f...4c9d",
    prize: "1,158.50",
    currency: "ETH",
    place: "3rd",
    date: "2024-01-15",
    avatar: "ri-user-3-fill",
  },
  {
    id: 4,
    address: "0x1b8a...6e2f",
    prize: "289.56",
    currency: "ETH",
    place: "4th",
    date: "2024-01-15",
    avatar: "ri-user-4-fill",
  },
  {
    id: 5,
    address: "0x3d4c...9a7b",
    prize: "289.56",
    currency: "ETH",
    place: "5th",
    date: "2024-01-15",
    avatar: "ri-user-5-fill",
  },
];

export default function WinnersSection() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-8 text-center">
        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Recent Winners
        </span>
      </h2>

      <div className="bg-gradient-to-br from-[#1a0a2e]/80 to-[#0a0118]/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Place</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Winner</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Prize</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockWinners.map((winner, index) => (
                <tr key={winner.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-600 to-orange-600"
                            : index === 1
                              ? "bg-gradient-to-br from-gray-400 to-gray-600"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-700 to-orange-900"
                                : "bg-gradient-to-br from-purple-600 to-pink-600"
                        }`}
                      >
                        {winner.place}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <i className={`${winner.avatar} text-purple-400`}></i>
                      </div>
                      <span className="font-mono text-white">{winner.address}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-cyan-400">{winner.prize}</span>
                      <span className="text-sm text-gray-400">{winner.currency}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-400">{winner.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
