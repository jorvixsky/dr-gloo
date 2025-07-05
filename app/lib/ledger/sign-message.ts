// src/app/lib/ledger.ts
import { ContextModuleBuilder } from "@ledgerhq/context-module";
import {
  DeviceActionStatus
} from "@ledgerhq/device-management-kit";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import { filter, firstValueFrom } from "rxjs";
import { DEFAULT_DERIVATION_PATH, config } from "./config";
import { dmk } from "./dmk";

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