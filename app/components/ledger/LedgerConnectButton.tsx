// src/components/LedgerConnectButton.tsx
import React from "react";
import { startDiscoveryAndConnect } from "../../lib/ledger/connect";
import { Button } from "~/components/ui/button"

export const LedgerConnectButton: React.FC = () => {
  const handleClick = async () => {
    try {
      const result = await startDiscoveryAndConnect();
      console.log(result);
    } catch (err: any) {
      alert(`Error: ${err.message ?? err}`);
    }
  };

  return (
    <Button onClick={handleClick}>
      Connect Ledger & Sign TX
    </Button>
  );
};


export default LedgerConnectButton;