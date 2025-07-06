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
    <div className="flex flex-col items-center min-h-svh p-4">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Dr Gloo</h1>
          { connectedAddresses.length ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ): null}
        </div>
        
        {connectedAddresses.length > 0 ? (
          <div className="w-full">
            <WalletTable connectedAddresses={connectedAddresses} />
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No addresses connected. Connect your wallet to view your assets.</p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
