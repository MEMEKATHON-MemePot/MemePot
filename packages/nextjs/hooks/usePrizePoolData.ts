import { useScaffoldReadContract } from "./scaffold-eth";

// Match Solidity PrizePool struct
export interface PrizePoolData {
  name: string;
  token: `0x${string}`;
  status: number; // PoolStatus enum
  frequency: number; // DrawFrequency enum
  totalPrize: bigint;
  drawInterval: number;
  nextDrawTime: bigint;
  lastDrawTime: bigint;
  totalParticipants: bigint;
  totalTickets: bigint;
  drawCount: number;
}

/**
 * Hook to fetch all prize pools from PrizePoolManager contract
 * @returns Array of all prize pool data
 */
export function useAllPrizePools() {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PrizePoolManager",
    functionName: "getAllEventPools",
  });

  return {
    pools: data as PrizePoolData[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch specific prize pool information
 * @param poolId - The pool ID to query
 * @returns Prize pool data
 */
export function usePrizePool(poolId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PrizePoolManager",
    functionName: "getPoolInfo",
    args: [poolId],
    query: {
      enabled: poolId !== undefined,
    },
  });

  return {
    pool: data as PrizePoolData | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch user's ticket count for a specific pool
 * @param poolId - The pool ID
 * @param userAddress - User wallet address
 * @returns User's ticket count
 */
export function useUserTicketCount(poolId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PrizePoolManager",
    functionName: "getUserTicketCount",
    args: [poolId, userAddress],
    query: {
      enabled: poolId !== undefined && !!userAddress,
    },
  });

  return {
    ticketCount: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch user's win chance for a specific pool
 * @param poolId - The pool ID
 * @param userAddress - User wallet address
 * @returns User's win chance (in basis points, 100 = 1%)
 */
export function useUserWinChance(poolId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PrizePoolManager",
    functionName: "getUserWinChance",
    args: [poolId, userAddress],
    query: {
      enabled: poolId !== undefined && !!userAddress,
    },
  });

  // Convert from basis points to percentage
  const winChancePercent = data ? Number(data) / 10000 : 0;

  return {
    winChance: data as bigint | undefined,
    winChancePercent,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch draw result for a specific pool and draw number
 * @param poolId - The pool ID
 * @param drawNumber - The draw number
 * @returns Draw result data
 */
export function useDrawResult(poolId: bigint | undefined, drawNumber: bigint | undefined) {
  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "PrizePoolManager",
    functionName: "getDrawResult",
    args: [poolId, drawNumber],
    query: {
      enabled: poolId !== undefined && drawNumber !== undefined,
    },
  });

  return {
    drawResult: data as
      | {
          poolId: bigint;
          drawNumber: bigint;
          winners: `0x${string}`[];
          prizes: bigint[];
          timestamp: bigint;
          randomness: `0x${string}`;
        }
      | undefined,
    isLoading,
    error,
    refetch,
  };
}

// Enums matching contract
export enum PoolStatus {
  Active = 0,
  Drawing = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum DrawFrequency {
  Daily = 0,
  Weekly = 1,
  BiWeekly = 2,
  Monthly = 3,
  Quarterly = 4,
  SemiAnnual = 5,
}

// Helper function to get frequency string
export function getFrequencyString(frequency: number): string {
  switch (frequency) {
    case DrawFrequency.Daily:
      return "Daily";
    case DrawFrequency.Weekly:
      return "Weekly";
    case DrawFrequency.BiWeekly:
      return "Bi-Weekly";
    case DrawFrequency.Monthly:
      return "Monthly";
    case DrawFrequency.Quarterly:
      return "Quarterly";
    case DrawFrequency.SemiAnnual:
      return "Semi-Annual";
    default:
      return "Unknown";
  }
}

// Helper function to get status string
export function getStatusString(status: number): string {
  switch (status) {
    case PoolStatus.Active:
      return "Active";
    case PoolStatus.Drawing:
      return "Drawing";
    case PoolStatus.Completed:
      return "Completed";
    case PoolStatus.Cancelled:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

/**
 * Hook to fetch user's participation data for a specific pool
 * @param poolId - The pool ID
 * @param userAddress - User wallet address
 * @returns User participation data including tickets and claim status
 */
export function useUserParticipation(poolId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const { data: ticketCount } = useUserTicketCount(poolId, userAddress);
  const { data: winChance, winChancePercent } = useUserWinChance(poolId, userAddress);

  return {
    ticketCount,
    winChance,
    winChancePercent,
    hasTickets: ticketCount ? ticketCount > 0n : false,
  };
}
