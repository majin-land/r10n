import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

import { registryContractAddress } from '@/config/smart-contract-address'

import ERC6538RegistryABI from './abi/ERC6538RegistryABI'

export async function registerKeysOnBehalf({
  userPrivateKey,
  registrant,
  schemeId,
  signature,
  stealthMetaAddress,
}: {
  userPrivateKey: `0x${string}`
  registrant: string
  schemeId: number
  signature: string
  stealthMetaAddress: string
}) {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(userPrivateKey),
    chain: baseSepolia,
    transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
  })

  const hash = await walletClient.writeContract({
    address: registryContractAddress,
    abi: ERC6538RegistryABI,
    functionName: 'registerKeysOnBehalf',
    args: [registrant, schemeId, signature, stealthMetaAddress],
  })
  console.log('Successfully register, Transaction hash:', hash)

  return hash
}
