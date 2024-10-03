import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { sepolia, baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { signMessage } from 'viem/wallet'
import ERC6538RegistryABI from './abi/ERC6538RegistryABI' 
import { generateFluidkeyMessage } from '@fluidkey/stealth-account-kit'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount(`0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`),
  chain: baseSepolia,
  transport: http(),
});

const contractAddress = '0x55649E01B5Df198D18D95b5cc5051630cfD45564'

// export async function registerKeysOnBehalf(registrant: string, schemeId: number, signature: string, stealthMetaAddress: string) {
//   const hash = await walletClient.writeContract({
//     address: contractAddress,
//     abi: ERC6538RegistryABI,
//     functionName: 'registerKeysOnBehalf',
//     args: [registrant, schemeId, signature, stealthMetaAddress],
//   });
//   // walletClient.signTransaction
//   console.log('Transaction hash:', hash);
// }

export async function announce(schemeId: number, stealthAddress: string, ephemeralPubKey: string, metadata: string) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: ERC6538RegistryABI,
    functionName: 'registerKeys',
    args: [schemeId, stealthAddress, ephemeralPubKey, metadata]
  })
  console.log('Transaction hash:', hash);

  return hash
}



// // Generate a valid signature (you need to adjust this to fit EIP-712)
// export async function generateSignature() {
//   // Generate the signature from which the private keys will be derived
//   const account = privateKeyToAccount(`0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`);
//   const { message } = generateFluidkeyMessage({
//     pin: '1234',
//     address: `0x${process.env.EXPO_PUBLIC_ADDRESS}`,
//   });
//   const signature = await account.signMessage({
//     message,
//   });
//   return signature;
// }


// export const listenEvent = async () => {
//   const logs = client.watchEvent({
//     address: contractAddress,
//     onLogs: logs => {
//       console.log('this hash')
//       console.log(logs)
//     },
//     // events:[ {
//     //   name: 'StealthMetaAddressSet',
//     //   inputs: [
//     //     { indexed: true, internalType: 'address', name: 'registrant', type: 'address' },
//     //     { indexed: true, internalType: 'uint256', name: 'schemeId', type: 'uint256' },
//     //     { indexed: false, internalType: 'bytes', name: 'stealthMetaAddress', type: 'bytes' },
//     //   ]
//     // }],
//     // abi: ERC6538RegistryABI,
//     // eventName: 'StealthMetaAddressSet',
//     // args: {
//     //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
//     //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
//     // },
//     // fromBlock: 16330000n,
//     // toBlock: 16330050n
//   })

//   // console.log('logs, ', logs)
//   return logs
// }



// Create stealth Address store to ERC6538Registry contract