// src/components/LedgerConnectButton.tsx
import React from "react";
import { startDiscoveryAndConnect } from "../../lib/ledger/connect";
import { Button } from "~/components/ui/button"
import type { LedgerConnection } from "~/lib/ledger/models/ledger-connection";

interface LedgerInformationProps {
  connectionInfo: LedgerConnection;
}

export const LedgerInformation = ({connectionInfo}: LedgerInformationProps) => {

  return (
    <div className="mt-20">
      <h2>Ledger Information</h2>
      <p><strong>Session ID:</strong> {connectionInfo.sessionId}</p>
      <p><strong>Device Name:</strong> {connectionInfo.connectedDevice.name}</p>
      <p><strong>Device Model:</strong> {connectionInfo.connectedDevice.modelId}</p>
      <p><strong>Account:</strong> {connectionInfo.account}</p>
      <p><strong>Chain ID:</strong> {connectionInfo.chainId}</p>
      <p><strong>Public Key:</strong> {connectionInfo.publicKey}</p>
    </div>
  );
};


export default LedgerInformation;