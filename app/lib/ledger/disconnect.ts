// src/app/lib/ledger.ts
import { type ContextModuleCalBranch, type ContextModuleCalMode } from "@ledgerhq/context-module";
import { dmk } from "./dmk";

const DEFAULT_DERIVATION_PATH = "44'/60'/0'/0/0";

const config = {
  calConfig: {
    url: "https://crypto-assets-service.api.ledger.com/v1",
    mode: "prod" as ContextModuleCalMode,
    branch: "main" as ContextModuleCalBranch, // or "next" or "demo"
  },
  web3ChecksConfig: {
    url: "https://web3checks-backend.api.ledger.com/v3",
  },
  metadataServiceConfig: {
    url: "https://nft.api.live.ledger.com/v2",
  },
};

export async function disconnect(sessionId?: string) {
  try {
    // Close the session
    if (sessionId) {
        await dmk.disconnect({ sessionId });
        console.log(`Session ${sessionId} closed successfully.`);
    }
    else {
        await dmk.close();
    }
  } catch (error) {
    await dmk.close();
  }
  try {
    // Stop discovering devices
    await dmk.stopDiscovering();
    console.log("Stopped discovering devices.");
  } catch (error) {
    console.error("Failed to stop discovering devices:", error);
  }
    

}