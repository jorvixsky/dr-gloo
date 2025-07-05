import type { ConnectedDevice } from "@ledgerhq/device-management-kit";

export interface LedgerConnection {
  sessionId : string,
  connectedDevice: ConnectedDevice,
  account: `0x${string}`,
  chainId: number,
  publicKey : string
}