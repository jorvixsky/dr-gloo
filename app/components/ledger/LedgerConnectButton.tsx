// src/components/LedgerConnectButton.tsx
import React from "react";
import { startDiscoveryAndConnect } from "../../lib/ledger/connect";
import { Button } from "~/components/ui/button"
import type { ConnectedDevice } from "@ledgerhq/device-management-kit";
import { type LedgerConnection } from "../../lib/ledger/models/ledger-connection";
import { disconnect } from "~/lib/ledger/disconnect";

interface LedgerConnectButtonProps {
  onConnect?: (params: LedgerConnection) => void;
}

export const LedgerConnectButton = ({onConnect}: LedgerConnectButtonProps) => {
  const handleClick = async () => {
    try {
      await disconnect(); // Ensure any previous session is disconnected before starting a new one
      const result = await startDiscoveryAndConnect();
      console.log(result);
      if (result && typeof result === 'object' && 'sessionId' in result) {
        const { sessionId, connectedDevice, account, chainId, publicKey } = result;
        // Call the onConnect callback with the required parameters
        onConnect?.({ sessionId, connectedDevice, account, chainId, publicKey });
      }
    } catch (err: any) {
      alert(`Error: ${err.message ?? err}`);
    }
  };

  return (
    <Button onClick={handleClick}>
      Connect Ledge
    </Button>
  );
};


export default LedgerConnectButton;