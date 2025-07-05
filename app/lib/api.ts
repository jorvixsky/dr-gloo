import type { WalletData } from "~/components/wallet-table/columns";
import { formatUnits } from "viem";
// 1inch API Key - Replace with your own key
// You can get a key from https://portal.1inch.dev/
const ONE_INCH_API_KEY = import.meta.env.VITE_1INCH_API_KEY || "YOUR_API_KEY_HERE";

// Mapping of chain IDs to readable names
const chainIdToName: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon PoS',
  42161: 'Arbitrum',
  10: 'OP Mainnet',
  8453: 'Base',
  43114: 'Avalanche',
  59144: 'Linea',
};

// Map network names to chain IDs
const networkToChainId: Record<string, number> = {
  'eth-mainnet': 1,
  'matic-mainnet': 137,
  'arb-mainnet': 42161,
  'opt-mainnet': 10,
  'base-mainnet': 8453,
};

// Function to convert balance with proper decimals
function convertBalance(balance: string, decimals: number): number {
  try {
    // Check if the balance is zero
    if (balance === '0' || balance === '') {
      return 0;
    }
    
    // Use viem's formatUnits to convert the balance to a decimal number
    const formattedBalance = formatUnits(BigInt(balance), decimals);
    
    // Convert to number
    return parseFloat(formattedBalance);
  } catch (error) {
    console.error(`Error converting balance: ${error}`);
    return 0;
  }
}

// Check if a balance is effectively zero (accounting for potential floating point issues)
function isEffectivelyZero(balance: number): boolean {
  return balance < 0.000001; // Consider anything less than 0.000001 as effectively zero
}

// Type definitions for the 1inch Portfolio API response
interface Token {
  chain_id: number;
  contract_address: string;
  name: string;
  symbol: string;
  amount: number;
  price_to_usd: number;
  value_usd: number;
  abs_profit_usd: number;
  roi: number;
  status: number;
}

type PortfolioResponse = {
  result: Token[];
};

export async function fetchTokenBalances(addresses: string[], networks: string[] = ['eth-mainnet', 'base-mainnet', 'matic-mainnet', 'arb-mainnet', 'opt-mainnet']): Promise<WalletData[]> {
  try {
    if (addresses.length === 0) {
      console.log("No addresses provided, returning empty array");
      return [];
    }

    if (ONE_INCH_API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("Using default 1inch API key. Please replace it with your own key in app/lib/api.ts.");
    }
    
    const walletData: WalletData[] = [];
    let tokenCounter = 0;

    console.log(`Starting to fetch token balances for ${addresses.length} addresses across ${networks.length} networks using 1inch API...`);

    const chainIds = networks
      .map(network => networkToChainId[network])
      .filter((chainId): chainId is number => chainId !== undefined);

    if (chainIds.length === 0) {
      console.error('No valid chain IDs found for the provided networks');
      return [];
    }

    const headers = {
      'Authorization': `Bearer ${ONE_INCH_API_KEY}`,
    };
    
    for (const address of addresses) {
      try {
        const url = `https://cors-ethglobal-cannes.deno.dev/v0/https://api.1inch.dev/portfolio/portfolio/v4/overview/erc20/details?addresses=${addresses.join(',')}`;        
        console.log(`Fetching portfolio for address ${address}...`);

        const response = await fetch(url, { headers });

        if (!response.ok) {
          console.error(`Error fetching portfolio for ${address}: ${response.statusText}`);
          continue; // Continue to the next address
        }

        const portfolio: PortfolioResponse = await response.json();

        for (const token of portfolio.result) {
          try {
            const balance = token.amount;

            if (isEffectivelyZero(balance)) {
              continue;
            }

            const amountInUsd = token.value_usd;

            walletData.push({
              id: `${tokenCounter++}`,
              wallet: address,
              token: token.symbol,
              tokenName: token.name,
              tokenAddress: token.contract_address,
              chain: chainIdToName[token.chain_id] || `Chain-${token.chain_id}`,
              amount: balance,
              amountInUsd: amountInUsd,
            });
          } catch (e) {
              console.error(`Error processing token ${token.symbol} for wallet ${address} on chain ${token.chain_id}`, e);
          }
        }
      } catch (error) {
        console.error(`Error fetching data for address ${address}:`, error);
      }
    }

    console.log(`Processed ${tokenCounter} tokens with non-zero balances`);

    walletData.sort((a, b) => b.amountInUsd - a.amountInUsd);
    
    return walletData;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return []; // Return empty array on error
  }
} 