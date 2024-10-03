import { createWalletClient, createPublicClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { announceContractAdddress } from "@/config/smart-contract-address";

import ERC5564AnnouncerABI from "../abi/ERC5564AnnouncerABI";

export async function announce({
  userPrivateKey,
  schemeId,
  stealthAddress,
  ephemeralPubKey,
  metadata,
}: {
  userPrivateKey: `0x${string}`;
  schemeId: number;
  stealthAddress: string;
  ephemeralPubKey: string;
  metadata: string;
}) {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(userPrivateKey),
    chain: baseSepolia,
    transport: http(),
  });

  const hash = await walletClient.writeContract({
    address: announceContractAdddress,
    abi: ERC5564AnnouncerABI,
    functionName: "announce",
    args: [schemeId, stealthAddress, ephemeralPubKey, metadata],
  });
  console.log("Successfully published announce, Transaction hash:", hash);

  return hash;
}
