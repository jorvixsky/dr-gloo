import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { mainnet, arbitrum, optimism, polygon, base } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
    chains: [mainnet, polygon, optimism, arbitrum, base],
    projectId: "2285a6530a6489b50a90620b88905aac",
    appName: 'Token Aggregator',
});

// Hook to get connected addresses
export function useConnectedAddresses() {
    const { addresses, isConnected } = useAccount();
    return isConnected && addresses ? addresses : [];
}
