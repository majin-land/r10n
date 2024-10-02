import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import ERC6538RegistryABI from './abi/ERC6538RegistryABI' 

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount(`0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`),
  chain: sepolia,
  transport: http(),
});

const contractAddress = '0xYourContractAddressHere';

export async function registerKeysOnBehalf(registrant: string, schemeId: number, signature: string, stealthMetaAddress: string) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: ERC6538RegistryABI,
    functionName: 'registerKeysOnBehalf',
    args: [registrant, schemeId, signature, stealthMetaAddress],
  });

  console.log('Transaction hash:', hash);
}

