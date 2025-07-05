import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { 
    mainnet,
    avalanche,
    optimism,
    arbitrum,
    base,
    polygon,
    unichain,
    linea,
 } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
    chains: [mainnet, avalanche, optimism, arbitrum, base, polygon, unichain, linea],
    projectId: "2285a6530a6489b50a90620b88905aac",
    appName: 'Token Aggregator',
});

// Hook to get connected addresses
export function useConnectedAddresses() {
    const { addresses, isConnected } = useAccount();
    return isConnected && addresses ? addresses : [];
}
