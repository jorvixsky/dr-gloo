// src/routes/ledger.tsx
import React, { Suspense } from "react";
import { LedgerConnectButton } from "../components/ledger/LedgerConnectButton";
import { LedgerDisconnectButton } from "../components/ledger/LedgerDisconnectButton";
import type { LedgerConnection } from "~/lib/ledger/models/ledger-connection";
import { LedgerInformation } from "../components/ledger/LedgerInformation";
import { LedgerHelloWorldButton } from "../components/ledger/LedgerHelloWorldButton";
import type { TransactionResult } from "~/lib/ledger/models/transaction";
import { LedgerDummyTransactionButton } from "../components/ledger/LedgerDummyTransactionButton";


// const LedgerConnectButton = React.lazy(() =>
//   import("../components/ledger/LedgerConnectButton")
// );

export default function LedgerPage() {
  const [ledgerInfo, setLedgerInfo] = React.useState<LedgerConnection|undefined>(undefined);
  const [helloWorldTransactionResult, setHelloWorldTransactionResult] = React.useState<TransactionResult|undefined>(undefined);
  const [dummyTransactionResult, setDummyTransactionResult] = React.useState<TransactionResult|undefined>(undefined);
  
  const handleConnect = (params: LedgerConnection) => {
    console.log("Connected with params:", params);
    setLedgerInfo(params);
  };

  const handleDisconnect = () => {
    console.log("Disconnected");
    setLedgerInfo(undefined);
  };

  const handleHelloWorld = (result: TransactionResult) => {
    console.log("Hello World transaction result:", result);
    setHelloWorldTransactionResult(result);
  };

  const handleDummyTransaction = (result: TransactionResult) => {
    console.log("Dummy transaction result:", result);
    setDummyTransactionResult(result);
  };


  return (
    <div style={{ padding: "2rem" }}>
      <h1>Ledger</h1>
      <p className="mb-20">This is the Ledger page.</p>
      <LedgerConnectButton onConnect={handleConnect} />

      <div className="mt-20">
        {ledgerInfo ? (
        <div>
          <LedgerDisconnectButton onDisconnect={handleDisconnect} />
          <LedgerInformation
            connectionInfo={ledgerInfo}
          />
          <LedgerHelloWorldButton
            sessionId={ledgerInfo.sessionId}
            onHelloWorld={handleHelloWorld}
          />
          {helloWorldTransactionResult ? (
            <div>
              <h2>Hello World Transaction Result</h2>
              <p>R: {helloWorldTransactionResult.r}</p>
              <p>S: {helloWorldTransactionResult.s}</p>
              <p>V: {helloWorldTransactionResult.v}</p>
              </div>
          ) : (
            <p>No Hello World transaction result yet.</p>
          )}
          <LedgerDummyTransactionButton
            sessionId={ledgerInfo.sessionId}
            onDummyTransaction={handleDummyTransaction}
          />
          {(dummyTransactionResult) ? (
            <div>
              <h2>Dummy Transaction Result</h2>
              <p>R: {dummyTransactionResult.r}</p>
              <p>S: {dummyTransactionResult.s}</p>
              <p>V: {dummyTransactionResult.v}</p>
            </div>
          ) : (
            <p>No Dummy transaction result yet.</p>
          )}
        </div>
        ) : (
          <p>No Ledger connected.</p>
        )}
      </div>
    </div>  
  );
}