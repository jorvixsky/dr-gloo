  import type { Route } from "./+types/home";
  import { WalletTable } from "~/components/wallet-table";
  import { ConnectButton } from "@rainbow-me/rainbowkit";
  import { useConnectedAddresses } from "~/lib/wagmi";

  export function meta({}: Route.MetaArgs) {
    return [
      { title: "Dr Gloo" },
      { name: "description", content: "Dr Gloo is a cross-chain token consolidator" },
    ];
  }

  export default function Home() {
    const connectedAddresses = useConnectedAddresses();

    return (
      <div className="flex flex-col min-h-svh bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="w-full p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">🥽</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Dr Gloo</h1>
          </div>
        </header>

        {connectedAddresses.length > 0 ? (
          <div className="flex-1 p-4">
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col items-center mb-8">
                <div className="flex justify-center mb-4">
                  <ConnectButton />
                </div>
              </div>
              <WalletTable connectedAddresses={connectedAddresses} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto text-center">
              
              {/* Main Content */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
                {/* Mascot Image */}
                <div className="flex-shrink-0">
                  <img 
                    src="/dr-gloo.gif" 
                    alt="Dr Gloo Mascot" 
                    className="w-96 h-96 object-contain" 
                  />
                </div>
                
                {/* Main Text Content */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h2 className="text-4xl lg:text-5xl font-bold text-blue-600 mb-4">
                    What do you wanna Gloo?
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-md">
                    Consolidate your tokens across multiple chains into a single address.
                  </p>
                  
                  {/* Connect Wallet Button */}
                  <div className="mb-8">
                    <ConnectButton />
                  </div>
                </div>
              </div>
              
              {/* Supported Chains Section */}
              <div className="w-full max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">Supported Chains</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Mainnet_64x64.svg" alt="Ethereum" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Artbitrum_64x64.svg" alt="Arbitrum" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Optimism_64x64.svg" alt="Optimism" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Polygon_64x64.svg" alt="Polygon" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Avalanche_64x64.svg" alt="Avalanche" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Base_64x64.svg" alt="Base" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Linea_64x64.svg" alt="Linea" className="w-8 h-8" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src="/chains/Unichain_64x64.svg" alt="Unichain" className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
