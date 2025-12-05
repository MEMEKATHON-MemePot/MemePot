import PrizePoolCard from "./PrizePoolCard";

function get1DNextDraw(): Date {
  const now = new Date();
  // 1) 오늘 날짜에서 시/분/초를 0으로 초기화 → 일자 단위
  const onlyDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // +1일 추가
  const tomorrow = new Date(onlyDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow;
}

function get1WNextDraw(): Date {
  const now = new Date();

  // 현재 요일 (0: 일요일, 1: 월요일, ... 6: 토요일)
  const day = now.getDay();

  // 다음 월요일까지 며칠 남았는지 계산
  // 월요일은 1
  const daysUntilNextMonday = (8 - day) % 7 || 7;

  // 기준 날짜: 오늘 날짜에서 time 제거
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 다음주 월요일 00:00:00 생성
  const nextMonday = new Date(baseDate);
  nextMonday.setDate(baseDate.getDate() + daysUntilNextMonday);

  return nextMonday;
}

function get1MNextDraw(): Date {
  const now = new Date();

  // 현재 연도, 월
  const year = now.getFullYear();
  const month = now.getMonth(); // 0: 1월, 11: 12월

  // 다음달 1일 00:00:00 생성
  const nextMonthFirst = new Date(year, month + 1, 1, 0, 0, 0);

  return nextMonthFirst;
}

export interface PrizePool {
  id: string;
  poolNum: number; // 몇번째 열리는 풀인지 관한 값. 종료되면 1씩 증가
  name: string;
  tokenSymbol: string;
  tokenAddress: string;
  totalPrize: string;
  currency: string;
  frequency: string;
  duration: string;
  nextDraw: number;
  participants: number;
  totalTickets: number;
  icon?: string; //front에서 아이콘 지정 가능
  gradient?: string; //front에서 그라데이션 지정 가능
}

const mockPrizePools: PrizePool[] = [
  {
    id: "1",
    poolNum: 1,
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "string",
    totalPrize: "11,585",
    currency: "M",
    frequency: "1D",
    duration: "1D",
    nextDraw: get1DNextDraw().getTime(),
    participants: 5328,
    totalTickets: 101233,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "2",
    poolNum: 1,
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "string",
    totalPrize: "23,112",
    currency: "M",
    frequency: "1W",
    duration: "1W",
    nextDraw: get1WNextDraw().getTime(),
    participants: 1234,
    totalTickets: 22388,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "3",
    poolNum: 1,
    name: "MEMECORE Pool",
    tokenSymbol: "MEMECORE",
    tokenAddress: "string",
    totalPrize: "34,183",
    currency: "M",
    frequency: "1M",
    duration: "1M",
    nextDraw: get1MNextDraw().getTime(),
    participants: 876,
    totalTickets: 34000,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "4",
    poolNum: 1,
    name: "USDT Pool",
    tokenSymbol: "USDT",
    tokenAddress: "string",
    totalPrize: "11,585",
    currency: "USDT",
    frequency: "1D",
    duration: "1D",
    nextDraw: get1DNextDraw().getTime(),
    participants: 5328,
    totalTickets: 101233,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "5",
    poolNum: 1,
    name: "USDT Pool",
    tokenSymbol: "USDT",
    tokenAddress: "string",
    totalPrize: "23,112",
    currency: "USDT",
    frequency: "1W",
    duration: "1W",
    nextDraw: get1WNextDraw().getTime(),
    participants: 1234,
    totalTickets: 22388,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    id: "6",
    poolNum: 1,
    name: "NOCMU Special Pool",
    tokenSymbol: "NOCMU",
    tokenAddress: "string",
    totalPrize: "159,513",
    currency: "NOCMU",
    frequency: "1W",
    duration: "1W",
    nextDraw: get1WNextDraw().getTime(),
    participants: 5328,
    totalTickets: 101233,
    icon: "ri-coin-fill",
    gradient: "from-purple-600 to-pink-600",
  },
];

export default function PrizePoolsSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* All Pools Grid */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              All Active event Prize Pools
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockPrizePools.map(pool => (
              <PrizePoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
