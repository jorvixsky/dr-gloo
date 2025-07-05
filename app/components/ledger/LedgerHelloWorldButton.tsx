// src/components/LedgerConnectButton.tsx
import { Button } from "~/components/ui/button";
import { signHelloWorld } from "~/lib/ledger/sign-helloworld";
import type { HelloWorldTransactionResult } from "../../lib/ledger/models/hello-world-transaction-result";

interface LedgerHelloWorldButtonProps {
  sessionId?: string;
  onHelloWorld?: (result: HelloWorldTransactionResult) => void;
}

export const LedgerHelloWorldButton = ({sessionId, onHelloWorld}: LedgerHelloWorldButtonProps) => {
  const handleClick = async () => {
    try {
      if(!sessionId) {
        throw new Error("Session ID is required to sign Hello World");
      }
      const result = await signHelloWorld(sessionId);
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