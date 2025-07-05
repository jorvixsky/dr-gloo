// src/components/LedgerConnectButton.tsx
import { Button } from "~/components/ui/button";
import { signTx } from "~/lib/ledger/sign-tx";
import type { TransactionResult } from "../../lib/ledger/models/transaction";
import { parseEther, parseGwei } from "viem";

interface LedgerDummyTransactionButtonProps {
  sessionId?: string;
  onDummyTransaction?: (result: TransactionResult) => void;
}

export const LedgerDummyTransactionButton = ({sessionId, onDummyTransaction}: LedgerDummyTransactionButtonProps) => {
  const handleClick = async () => {
    try {
      if(!sessionId) {
        throw new Error("Session ID is required to sign Hello World");
      }
      const result = await signTx(sessionId, {
        to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        type: "eip1559",
        chainId: 1,
      });
      console.log(result);
      onDummyTransaction?.(result);
    } catch (err: any) {
      alert(`Error: ${err.message ?? err}`);
    }
  };

  return (
    <Button onClick={handleClick}>
      Sign Tx
    </Button>
  );
};


export default LedgerDummyTransactionButton;