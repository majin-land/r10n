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

export async function generateSignature() {
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
