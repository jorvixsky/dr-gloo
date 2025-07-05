import { type ContextModuleCalBranch, type ContextModuleCalMode } from "@ledgerhq/context-module";

export const DEFAULT_DERIVATION_PATH = "44'/60'/0'/0/0";1

export const config = {
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