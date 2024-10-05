import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  getContract,
  erc20Abi,
} from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { signMessage } from "viem/wallet";
import ERC6538RegistryABI from "./abi/ERC6538RegistryABI";
import { generateFluidkeyMessage } from "@fluidkey/stealth-account-kit";

export const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  account: privateKeyToAccount(`0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`),
  chain: baseSepolia,
  transport: http(),
});

const contractAddress = "0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538";

export async function registerKeysOnBehalf(
  registrant: string,
  schemeId: number,
  signature: string,
  stealthMetaAddress: string
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: ERC6538RegistryABI,
    functionName: "registerKeysOnBehalf",
    args: [registrant, schemeId, signature, stealthMetaAddress],
  });
  // walletClient.signTransaction
  console.log("Transaction hash:", hash);
}

export async function registerKeys(
  schemeId: number,
  stealthMetaAddress: string
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: ERC6538RegistryABI,
    functionName: "registerKeys",
    args: [schemeId, stealthMetaAddress],
  });
  console.log("Transaction hash:", hash);

  return hash;
}

// Generate a valid signature (you need to adjust this to fit EIP-712)
export async function generateSignature() {
  // Generate the signature from which the private keys will be derived
  const account = privateKeyToAccount(
    `0x${process.env.EXPO_PUBLIC_PRIVATE_KEY}`
  );
  const { message } = generateFluidkeyMessage({
    pin: "1234",
    address: `0x${process.env.EXPO_PUBLIC_ADDRESS}`,
  });
  const signature = await account.signMessage({
    message,
  });
  return signature;
}

export const listenEvent = async () => {
  const logs = await client.getContractEvents({
    address: contractAddress,
    // onLogs: logs => {
    //   console.log('this hash')
    //   console.log(logs)
    // },

    // events:[ {
    //   name: 'StealthMetaAddressSet',
    //   inputs: [
    //     { indexed: true, internalType: 'address', name: 'registrant', type: 'address' },
    //     { indexed: true, internalType: 'uint256', name: 'schemeId', type: 'uint256' },
    //     { indexed: false, internalType: 'bytes', name: 'stealthMetaAddress', type: 'bytes' },
    //   ]
    // }],
    abi: ERC6538RegistryABI,
    // eventName: 'StealthMetaAddressSet',
    // args: {
    //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
    // },
    fromBlock: 16081458n,
    // toBlock: 16083401n
  });

  console.log("logs, ", logs);
  return logs;
};

// get eth balance
export const getUserBalance = (address: `0x${string}`) => {
  return client.getBalance({ address });
};

// get usdc balance
export const getUsdcBalance = async (address: `0x${string}`) => {
  const contract = await getContract({
    address: "0x5deac602762362fe5f135fa5904351916053cf70",
    abi: erc20Abi,
    client: {
      public: client,
      wallet: walletClient,
    },
  });
  return contract.read.balanceOf([address]);
};

// export const transferUsdcContract
// Create stealth Address store to ERC6538Registry contract
