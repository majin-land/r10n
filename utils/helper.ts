import * as ethers from "ethers";
import * as secp from "@noble/secp256k1";

export function randomPrivateKey() {
  const randomWallet = ethers.Wallet.createRandom();
  return randomWallet.privateKey;
}

// Function to compress public keys
export function compressPublicKey(publicKey: string): string {
  // Remove the '0x' prefix if present
  const publicKeyWithoutPrefix = publicKey.startsWith("0x")
    ? publicKey.slice(2)
    : publicKey;

  // Convert the uncompressed public key to a Uint8Array
  const publicKeyBytes = Buffer.from(publicKeyWithoutPrefix, "hex");

  // Compress the public key using secp256k1
  const compressedPublicKey =
    secp.ProjectivePoint.fromHex(publicKeyBytes).toRawBytes(true);

  // Return the compressed public key as a hex string with '0x' prefix
  return "0x" + Buffer.from(compressedPublicKey).toString("hex");
}
