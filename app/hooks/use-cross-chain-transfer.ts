"use client";

import { useState } from "react";
import {
  encodeFunctionData,
  type HttpTransport,
  type Chain,
  type Account,
  type WalletClient,
  type Hex,
  TransactionExecutionError,
  parseUnits,
  formatUnits,
  parseEther,
} from "viem";
import { chainIdToDomain, messageTransmitter, tokenAddresses, tokenMessenger } from "../lib/cctp-contracts";
import { usePublicClient, useSwitchChain } from "wagmi";

export type TransferStep =
  | "idle"
  | "approving"
  | "burning"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";


export function useCrossChainTransfer() {
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const [currentStep, setCurrentStep] = useState<TransferStep>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_DECIMALS = 6;

  // EVM functions (existing)
  const approveUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    sourceChainId: number,
  ) => {
    setCurrentStep("approving");

    try {
      const tx = await client.sendTransaction({
        to: tokenAddresses[sourceChainId as keyof typeof tokenAddresses] as `0x${string}`,
        data: encodeFunctionData({
          abi: [
            {
              type: "function",
              name: "approve",
              stateMutability: "nonpayable",
              inputs: [
                { name: "spender", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              outputs: [{ name: "", type: "bool" }],
            },
          ],
          functionName: "approve",
          args: [
            tokenMessenger[sourceChainId] as `0x${string}`,
            10000000000n,
          ],
        }),
      });

      return tx;
    } catch (err) {
      setError("Approval failed");
      throw err;
    }
  };

  const burnUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    sourceChainId: number,
    amount: bigint,
    destinationChainId: number,
    destinationAddress: string,
  ) => {
    setCurrentStep("burning");

    try {
      const finalityThreshold =  1000;
      const maxFee = amount - 1n;

      // For EVM destinations, pad the hex address
      const mintRecipient = `0x${destinationAddress
        .replace(/^0x/, "")
        .padStart(64, "0")}`;

      const tx = await client.sendTransaction({
        to: tokenMessenger[sourceChainId] as `0x${string}`,
        data: encodeFunctionData({
          abi: [
            {
              type: "function",
              name: "depositForBurn",
              stateMutability: "nonpayable",
              inputs: [
                { name: "amount", type: "uint256" },
                { name: "destinationDomain", type: "uint32" },
                { name: "mintRecipient", type: "bytes32" },
                { name: "burnToken", type: "address" },
                { name: "hookData", type: "bytes32" },
                { name: "maxFee", type: "uint256" },
                { name: "finalityThreshold", type: "uint32" },
              ],
              outputs: [],
            },
          ],
          functionName: "depositForBurn",
          args: [
            amount,
            chainIdToDomain[destinationChainId],
            mintRecipient as Hex,
            tokenAddresses[sourceChainId as keyof typeof tokenAddresses] as `0x${string}`,
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            maxFee,
            finalityThreshold,
          ],
        }),
      });

      console.log(`Burn Tx: ${tx}`);
      return tx;
    } catch (err) {
      setError("Burn failed");
      throw err;
    }
  };

  const retrieveAttestation = async (
    transactionHash: string,
    sourceChainId: number,
  ) => {
    setCurrentStep("waiting-attestation");

    const url = `https://iris-api.circle.com/v2/messages/${chainIdToDomain[sourceChainId]}?transactionHash=${transactionHash}`;

    while (true) {
      try {
        const response = await fetch(url);

        if (response.status === 404) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData?.messages?.[0]?.status === "complete") {
          console.log("Attestation retrieved!");
          return responseData.messages[0];
        }

        console.log("Waiting for attestation...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        setError("Attestation retrieval failed");
        console.log(
          `Attestation error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        throw error;
      }
    }
  };

  const mintUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    destinationChainId: number,
    attestation: any,
  ) => {
    const MAX_RETRIES = 3;
    let retries = 0;
    setCurrentStep("minting");
    console.log("Minting USDC...");

    while (retries < MAX_RETRIES) {
        if (!publicClient) {
            throw new Error("Public client not found");
        }
      try {
        const feeData = await publicClient.estimateFeesPerGas();
        const contractConfig = {
          address: messageTransmitter[
            destinationChainId
          ] as `0x${string}`,
          abi: [
            {
              type: "function",
              name: "receiveMessage",
              stateMutability: "nonpayable",
              inputs: [
                { name: "message", type: "bytes" },
                { name: "attestation", type: "bytes" },
              ],
              outputs: [],
            },
          ] as const,
        };

        // Estimate gas with buffer
        const gasEstimate = await publicClient.estimateContractGas({
          ...contractConfig,
          functionName: "receiveMessage",
          args: [attestation.message, attestation.attestation],
          account: client.account,
        });

        // Add 20% buffer to gas estimate
        const gasWithBuffer = (gasEstimate * 120n) / 100n;
        console.log(`Gas Used: ${formatUnits(gasWithBuffer, 9)} Gwei`);

        const tx = await client.sendTransaction({
          to: contractConfig.address,
          data: encodeFunctionData({
            ...contractConfig,
            functionName: "receiveMessage",
            args: [attestation.message, attestation.attestation],
          }),
          gas: gasWithBuffer,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        });

        console.log(`Mint Tx: ${tx}`);
        setCurrentStep("completed");
        break;
      } catch (err) {
        if (err instanceof TransactionExecutionError && retries < MAX_RETRIES) {
          retries++;
          console.log(`Retry ${retries}/${MAX_RETRIES}...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
          continue;
        }
        throw err;
      }
    }
  };

  const executeTransfer = async (
    sourceChainId: number,
    destinationChainId: number,
    amount: string,
    walletClient: WalletClient<HttpTransport, Chain, Account>,
  ) => {
    try {
      if (!publicClient) {
        throw new Error("Public client not found");
      }

      const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);

      await switchChain({ chainId: sourceChainId });

      // Execute approve step
      await approveUSDC(walletClient, sourceChainId);

      // Execute burn step
      const burnTx = await burnUSDC(
        walletClient,
        sourceChainId,
        numericAmount,
        destinationChainId,
        walletClient.account.address,
      );

      await switchChain({ chainId: destinationChainId });

      // Retrieve attestation
      const attestation = await retrieveAttestation(burnTx, sourceChainId);

      // Check destination chain balance
      const minBalance = parseEther("0.01"); // 0.01 native token

      const balance = await publicClient.getBalance({
        address: walletClient.account.address,
      });
      if (balance < minBalance) {
        throw new Error("Insufficient native token for gas fees");
      }

      // Execute mint step
      await mintUSDC(walletClient, destinationChainId, attestation);
    } catch (error) {
      setCurrentStep("error");
      console.log(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const reset = () => {
    setCurrentStep("idle");
    setLogs([]);
    setError(null);
  };

  return {
    currentStep,
    logs,
    error,
    executeTransfer,
    reset,
  };
}
