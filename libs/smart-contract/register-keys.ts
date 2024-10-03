import { createWalletClient, createPublicClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { registryContractAddress } from "@/config/smart-contract-address";

import ERC6538RegistryABI from "../abi/ERC6538RegistryABI";

export async function registerKeys({
  userPrivateKey,
  schemeId,
  stealthMetaAddress,
}: {
  userPrivateKey: `0x${string}`;
  schemeId: number;
  stealthMetaAddress: string;
}) {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(userPrivateKey),
    chain: baseSepolia,
    transport: http(),
  });

  const hash = await walletClient.writeContract({
    address: registryContractAddress,
    abi: ERC6538RegistryABI,
    functionName: "registerKeys",
    args: [schemeId, stealthMetaAddress],
  });
  console.log("Successfully registered keys, Transaction hash:", hash);

  return hash;
}
