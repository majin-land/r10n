import { privateKeyToAccount } from "viem/accounts";
import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey,
  generateKeysFromSignature,
  generateStealthAddresses,
  generateStealthPrivateKey,
  predictStealthSafeAddressWithBytecode,
  predictStealthSafeAddressWithClient,
  generateFluidkeyMessage,
} from "@fluidkey/stealth-account-kit";

export async function generateStealthSafeAccount({
  userPrivateKey,
  userPin,
  userAddress,
  viewingPrivateKeyNodeNumber = 0,
  startNonce = BigInt(0),
  endNonce = BigInt(10),
  chainId = 0,
}: {
  userPrivateKey: `0x${string}`;
  userPin: string;
  userAddress: string;
  viewingPrivateKeyNodeNumber?: number;
  startNonce?: bigint;
  endNonce?: bigint;
  chainId?: number;
}) {
  // Create results array
  const results: {
    nonce: bigint;
    stealthSafeAddress: string;
    stealthPrivateKey: string;
  }[][] = [[], []];

  // Generate the signature for key derivation
  const account = privateKeyToAccount(userPrivateKey);
  const { message } = generateFluidkeyMessage({
    pin: userPin,
    address: userAddress,
  });
  const signature = await account.signMessage({ message });

  // Generate keys from signature
  const { spendingPrivateKey, viewingPrivateKey } =
    generateKeysFromSignature(signature);

  // Extract viewing private key node
  const privateViewingKeyNode = extractViewingPrivateKeyNode(
    viewingPrivateKey,
    viewingPrivateKeyNodeNumber
  );

  // Get public spending key
  const spendingAccount = privateKeyToAccount(spendingPrivateKey);
  const spendingPublicKey = spendingAccount.publicKey;

  // Generate stealth addresses within the nonce range
  for (let nonce = startNonce; nonce <= endNonce; nonce++) {
    const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
      viewingPrivateKeyNode: privateViewingKeyNode,
      nonce,
      chainId,
    });

    const { stealthAddresses } = generateStealthAddresses({
      spendingPublicKeys: [spendingPublicKey],
      ephemeralPrivateKey,
    });

    // Predict stealth Safe addresses using both client and bytecode
    const { stealthSafeAddress: stealthSafeAddressWithClient } =
      await predictStealthSafeAddressWithClient({
        threshold: 1,
        stealthAddresses,
        safeVersion: "1.3.0",
        useDefaultAddress: true,
      });

    const { stealthSafeAddress: stealthSafeAddressWithBytecode } =
      predictStealthSafeAddressWithBytecode({
        threshold: 1,
        stealthAddresses,
        safeVersion: "1.3.0",
        safeProxyBytecode:
          "0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564",
        useDefaultAddress: true,
      });

    // Generate stealth private key for the Safe
    const { stealthPrivateKey } = generateStealthPrivateKey({
      spendingPrivateKey,
      ephemeralPublicKey: privateKeyToAccount(ephemeralPrivateKey).publicKey,
    });

    // Store results
    results[0].push({
      nonce,
      stealthSafeAddress: stealthSafeAddressWithClient,
      stealthPrivateKey,
    });
    results[1].push({
      nonce,
      stealthSafeAddress: stealthSafeAddressWithBytecode,
      stealthPrivateKey,
    });
  }

  return results;
}
