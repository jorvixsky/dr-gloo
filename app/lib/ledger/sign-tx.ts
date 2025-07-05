// src/app/lib/ledger.ts
import { ContextModuleBuilder } from "@ledgerhq/context-module";
import { hexaStringToBuffer } from "@ledgerhq/device-management-kit";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import {
  DeviceActionStatus
} from "@ledgerhq/device-management-kit";
import { filter, firstValueFrom } from "rxjs";
import { DEFAULT_DERIVATION_PATH, config } from "./config";
import { dmk } from "./dmk";
import { serializeTransaction, parseEther, parseGwei, type TransactionRequestBase } from 'viem';

const skipOpenApp = false;

export async function signTx(sessionId: string, txAction: any): Promise<{ r: string, s: string, v: number }> {

    console.log(`🦖 Signing transaction with sessionId: ${sessionId}`);
    const unsignedTx = serializeTransaction(txAction);

    console.log(`🦖 Serialized transaction: ${unsignedTx}`);
    const tx = hexaStringToBuffer(unsignedTx);

    console.log(`🦖 Transaction to sign: ${JSON.stringify(tx)}`);
    if (!tx) {
        throw new Error("Invalid transaction format");
    }

    console.log(`🦖 Transaction to sign: ${JSON.stringify(tx)}`);

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

    const transactionObservable = signerEth.signTransaction(DEFAULT_DERIVATION_PATH, tx, {
        domain: "",
        skipOpenApp: false,
    }).observable;
    console.log(`🦖 Requesting transaction sign`);
    
    let messageRes = await firstValueFrom(transactionObservable
        .pipe(
        filter((res) => res.status === DeviceActionStatus.Completed)
    ));

    // transactionObservable.subscribe({
    //     next: (res) => {
    //         console.log(`🦖 Response from signTx: ${JSON.stringify(res)}`);
    //         if (res.status === DeviceActionStatus.Completed) {
    //             messageRes = res;
    //         } else if (res.status === DeviceActionStatus.Failed) {
    //             throw new Error(`Transaction signing failed: ${res.error}`);
    //         } else {
    //             console.log(`🦖 Transaction signing in progress: ${res.status}`);
    //         }
    //     },
    //     error: (err) => {
    //         console.error(`🦖 Error during transaction signing: ${err}`)
    //         throw err;
    //     },
    //     complete: () => {
    //         console.log(`🦖 Transaction signing completed`);
    //     }
    // });

    console.log(`🦖 Response from signTx: ${JSON.stringify(messageRes)} 🎉`);

    return {
      r: messageRes.output.r,
      s: messageRes.output.s,
      v: messageRes.output.v
    }
}