// src/components/LedgerConnectButton.tsx
import React from "react";
import { disconnect } from "../../lib/ledger/disconnect";
import { Button } from "~/components/ui/button"
import { on } from "events";

interface LedgerDisconnectButtonProps {
  sessionId?: string;
  onDisconnect?: () => void;
}

export const LedgerDisconnectButton = ({sessionId, onDisconnect}: LedgerDisconnectButtonProps) => {
  const handleClick = async () => {
    try {
      const result = await disconnect(sessionId);
      console.log(result);
      onDisconnect?.();
    } catch (err: any) {
      alert(`Error: ${err.message ?? err}`);
    }
  };

  return (
    <Button onClick={handleClick}>
      Disconnect
    </Button>
  );
};


export default LedgerDisconnectButton;