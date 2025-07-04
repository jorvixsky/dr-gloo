import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div>
        <h1>Welcome to the Token Aggregator</h1>
        <Button>
          <Link to="/">
            <span>Just a button to test!</span>
          </Link>
        </Button>
        <ConnectButton />
      </div>
    </main>
  );
}