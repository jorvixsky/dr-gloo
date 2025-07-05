// src/app/lib/ledger.ts
import {
  DeviceManagementKitBuilder,
  ConsoleLogger,
  OpenAppCommand,
  DeviceActionStatus
} from "@ledgerhq/device-management-kit";
import { webHidTransportFactory } from "@ledgerhq/device-transport-kit-web-hid";
import { ContextModuleBuilder, type ContextModuleCalMode, type ContextModuleCalBranch } from "@ledgerhq/context-module";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import { filter, firstValueFrom } from "rxjs";
import { ethers } from "ethers";
import { dmk } from "./dmk";
import type { LedgerConnection } from "./models/ledger-connection";
import { DEFAULT_DERIVATION_PATH, config } from "./config"

const skipOpenApp = false;

export async function signMessage(sessionId: string, message: string): Promise<{ r: string, s: string, v: number }> {

    const contextModule = new ContextModuleBuilder({
          originToken: "origin-token", // TODO: replace with your origin token
        })
      .addCalConfig(config.calConfig)
      .addWeb3ChecksConfig(config.web3ChecksConfig)
      .build();

    const signerEth = new SignerEthBuilder({
        dmk,
        sessionId: sessionId,
    }).withContextModule(contextModule)
      .build();

    const messageObservable = signerEth.signMessage(DEFAULT_DERIVATION_PATH, message, { skipOpenApp }).observable;
    
    console.log(`🦖 Requesting Hello world signing message`);
    let messageRes = await firstValueFrom(messageObservable.pipe(
        filter((res) => res.status === DeviceActionStatus.Completed
    )));
    
    
    console.log(`🦖 Response from signMessage: ${JSON.stringify(messageRes)} 🎉`);

    return {
      r: messageRes.output.r,
      s: messageRes.output.s,
      v: messageRes.output.v
    }
}