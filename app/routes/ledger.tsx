// src/routes/ledger.tsx
import React, { Suspense } from "react";

const LedgerConnectButton = React.lazy(() =>
  import("../components/ledger/LedgerConnectButton")
);

export default function LedgerPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Ledger</h1>
      <p className="mb-20">This is the Ledger page.</p>
      <LedgerConnectButton />
    </div>  
  );
}