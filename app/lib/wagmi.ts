
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base],
  projectId: "2285a6530a6489b50a90620b88905aac",
  appName: 'Token Aggregator',
});