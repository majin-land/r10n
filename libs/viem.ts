import {
  createWalletClient,
  createPublicClient,
  http,
  erc20Abi,
} from "viem"
import { sepolia, baseSepolia } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import ERC6538RegistryABI from "./abi/ERC6538RegistryABI"
import { generateFluidkeyMessage } from "@fluidkey/stealth-account-kit"

const USDC_TOKEN_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

export const client = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
})

// const walletClient = createWalletClient({
//   account: privateKeyToAccount(`0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`),
//   chain: baseSepolia,
//   transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
// })

export async function generateSignature() {
  const account = privateKeyToAccount(
    `0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`
  )
  const { message } = generateFluidkeyMessage({
    pin: "1234",
    address: `0x${process.env.EXPO_PUBLIC_ADDRESS}`,
  })
  const signature = await account.signMessage({
    message,
  })
  return signature
}

// get eth balance
export const getUserBalance = async (address: `0x${string}`) => {
  return client.getBalance({ address })
}

// get usdc balance
export const getUsdcBalance = async (address: `0x${string}`) => {
  console.log('----', address)
  const balance = await client.readContract({
    address: USDC_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
  });

  // USDC usually has 6 decimal places, so we need to adjust it
  const formattedBalance = Number(balance) / 1e6; 

  // const formattedBalance = parseUnits(balance.toString(), 6); 
  console.log(`Balance: ${formattedBalance}`);

  return formattedBalance
}

// export const getUsdcBalance = async (address: `0x${string}`) => {
//   const contract = await getContract({
//     address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
//     abi: erc20Abi,
//     client: {
//       public: client,
//       // wallet: walletClient,
//     },
//   })
//   const balance = await contract.read.balanceOf([address])
//   const formattedBalance = parseUnits(balance.toString(), 6); 

//   console.log(formattedBalance , 'formattedBalance')
//   return formattedBalance
// }


// export const transferUsdcContract
// Create stealth Address store to ERC6538Registry contract

export const transferUsdc = async (to: `0x${string}`, amountInUSDC: number, privateKey: `0x${string}`) => {
  // Convert the amount to the smallest unit (since USDC has 6 decimals)
  const amount = BigInt(amountInUSDC * 1e6)  // 1 USDC = 10^6 micro USDC
  // TODO: refactor logic for private key
  const account = privateKeyToAccount(privateKey)

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
  })

  // Call the `transfer` function on the USDC contract
  const txHash = await walletClient.writeContract({
    address: USDC_TOKEN_ADDRESS, // USDC contract address
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, amount], // Arguments for `transfer(to, amount)`
    account
  });

  console.log('Transaction Hash:', txHash);
  return txHash;
}
