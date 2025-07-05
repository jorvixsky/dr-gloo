// src/routes/ledger.tsx
import React, { Suspense } from "react";
import { LedgerConnectButton } from "../components/ledger/LedgerConnectButton";
import { LedgerDisconnectButton } from "../components/ledger/LedgerDisconnectButton";
import type { LedgerConnection } from "~/lib/ledger/models/ledger-connection";

// const LedgerConnectButton = React.lazy(() =>
//   import("../components/ledger/LedgerConnectButton")
// );

export default function LedgerPage() {
  const [ledgerInfo, setLedgerInfo] = React.useState<LedgerConnection|undefined>(undefined);

  const handleConnect = (params: LedgerConnection) => {
    console.log("Connected with params:", params);
    setLedgerInfo(params);
  };

  const handleDisconnect = () => {
    console.log("Disconnected");
    setLedgerInfo(undefined);
  };


  return (
    <div style={{ padding: "2rem" }}>
      <h1>Ledger</h1>
      <p className="mb-20">This is the Ledger page.</p>
      <LedgerConnectButton onConnect={handleConnect} />
      <LedgerDisconnectButton sessionId={ledgerInfo?.sessionId} onDisconnect={handleDisconnect}/>
    </div>  
  );
}