// src/app/lib/ledger.ts
import { ContextModuleBuilder } from "@ledgerhq/context-module";
import { SignerEthBuilder } from "@ledgerhq/device-signer-kit-ethereum";
import { filter, firstValueFrom } from "rxjs";
import { DEFAULT_DERIVATION_PATH, config } from "./config";
import { dmk } from "./dmk";

export async function startDiscoveryAndConnect() {
    await firstValueFrom(dmk.startDiscovering({ transport: undefined }));
    const devices = await firstValueFrom(dmk.listenToAvailableDevices({ transport: undefined }));
    if (!devices || devices.length === 0) {
      throw new Error("No device found");
    }
    const device = devices[0];
    console.log("Discovered device:", device);
    const sessionId = await dmk.connect({ device });
    console.log(`🦖 Response from connect: ${JSON.stringify(sessionId)} 🎉`);
    
    const connectedDevice = dmk.getConnectedDevice({
        sessionId: sessionId,
    });
    console.log(`Device name: ${connectedDevice.name}`);
    console.log(`Device model: ${connectedDevice.modelId}`);

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


    let address;
    let publicKey;

    const getAddressObservable = 
        signerEth.getAddress(DEFAULT_DERIVATION_PATH, {
            checkOnDevice: true,
            returnChainCode: true,
            skipOpenApp: false,
        }).observable;
    
    // getAddressObservable.subscribe({
    //     next: (address) => {
    //         console.log(`Address:`, JSON.stringify(address));
    //     },
    //     error: (error) => {
    //         console.error(`Error getting address:`, error);
    //     },
    //     complete: () => {
    //         console.log(`Address retrieval complete.`);
    //     }
    // });

    console.log(`🦖 Requesting address with derivation path: ${DEFAULT_DERIVATION_PATH}`);
    let observedAddress ;//= await firstValueFrom(getAddressObservable.pipe(filter(a => a.status === "completed")));
    
    try {
      observedAddress = await firstValueFrom(
        getAddressObservable.pipe(
          filter((a) => a.status === "completed")
        )
      );

      console.log("✅ Completed address:", observedAddress);
    } catch (err) {
      console.error("❌ No completed result:", err);
      throw err;
    }

    console.log(`🦖 Response from getAddress: ${JSON.stringify(observedAddress)} 🎉`);
    address = observedAddress.output.address;
    publicKey = observedAddress.output.publicKey;

    console.log(`🦖 Response from getAddress: ${JSON.stringify(observedAddress)} 🎉`);
    console.log(`Address: ${address}`);
    console.log(`Public Key: ${publicKey}`);

    return {
        sessionId,
        connectedDevice,
        account: address,
        chainId: 1, // Ethereum mainnet
        publicKey
    }

}