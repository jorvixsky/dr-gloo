// src/components/LedgerConnectButton.tsx
import { Button } from "~/components/ui/button";
import { signMessage } from "~/lib/ledger/sign-message";
import type { TransactionResult } from "../../lib/ledger/models/transaction-result";

interface LedgerHelloWorldButtonProps {
  sessionId?: string;
  onHelloWorld?: (result: TransactionResult) => void;
}

export const LedgerHelloWorldButton = ({sessionId, onHelloWorld}: LedgerHelloWorldButtonProps) => {
  const handleClick = async () => {
    try {
      if(!sessionId) {
        throw new Error("Session ID is required to sign Hello World");
      }
      const result = await signMessage(sessionId, "Hello world");
      console.log(result);
      onHelloWorld?.(result);
    } catch (err: any) {
      alert(`Error: ${err.message ?? err}`);
    }
  };

  return (
    <Button onClick={handleClick}>
      Hello world
    </Button>
  );
};


export default LedgerHelloWorldButton;