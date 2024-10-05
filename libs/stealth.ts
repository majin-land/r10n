import { privateKeyToAccount } from 'viem/accounts'
import {
  extractViewingPrivateKeyNode,
  generateEphemeralPrivateKey,
  generateKeysFromSignature,
  generateStealthAddresses,
  generateStealthPrivateKey,
  predictStealthSafeAddressWithBytecode,
  predictStealthSafeAddressWithClient,
  generateFluidkeyMessage,
} from '@fluidkey/stealth-account-kit'

import * as secp from '@noble/secp256k1'
import { Hex, keccak256, toHex } from 'viem'

import { randomPrivateKey, compressPublicKey } from '@/utils/helper'

import { registerKeys, registerKeysOnBehalf } from "../contracts";

/**
 * End-to-end example of how to generate stealth Safe accounts based on the user's private key and the key generation message to be signed.
 *
 * @param userPrivateKey
 * @param userPin
 * @param userAddress
 * @param viewingPrivateKeyNodeNumber
 * @param startNonce
 * @param endNonce
 * @param chainId
 * @returns two lists of objects containing the nonce, the corresponding stealth Safe address, and the private key controlling the stealth Safe at that address
 */

// function randomPrivateKey() {
//   const randPrivateKey = secp.utils.randomPrivateKey();
//   return `0x${Buffer.from(randPrivateKey).toString("hex")}`;
// }

export async function generateStealthMetaAddress({
  userPrivateKey,
  userPin,
  userAddress,
}: {
  userPrivateKey: `0x${string}`
  userPin: string
  userAddress: string
}) {
  // Generate the signature from which the private keys will be derived
  const account = privateKeyToAccount(userPrivateKey)
  const { message } = generateFluidkeyMessage({
    pin: userPin,
    address: userAddress,
  })
  const signature = await account.signMessage({
    message,
  })

  // Generate the private keys from the signature
  const { spendingPrivateKey, viewingPrivateKey } =
    generateKeysFromSignature(signature)

  // Get the spending public key
  const spendingAccount = privateKeyToAccount(spendingPrivateKey)
  const spendingPublicKey = spendingAccount.publicKey
  // Get the viewing public key
  const viewingAccount = privateKeyToAccount(viewingPrivateKey)
  const viewingPublicKey = viewingAccount.publicKey

  // Check that the public keys are valid
  if (spendingPublicKey.length !== 132 || viewingPublicKey.length !== 132) {
    throw new Error('Invalid public key length. Must be 130 hex characters.')
  }

  // Compress the spending and viewing public keys
  const compressedSpendingPublicKey = compressPublicKey(spendingPublicKey)
  const compressedViewingPublicKey = compressPublicKey(viewingPublicKey)

  // Get the stealth meta address
  const stealthMetaAddress =
    'st:base:0x' +
    compressedSpendingPublicKey.slice(2) +
    compressedViewingPublicKey.slice(2)

  // publish to registry smart contract
  registerKeys({
    userPrivateKey,
    schemeId: 1,
    stealthMetaAddress,
  })
  registerKeysOnBehalf({
    userPrivateKey,
    registrant: userAddress,
    schemeId: 1,
    signature,
    stealthMetaAddress,
  })

  return {
    spendingPrivateKey,
    viewingPrivateKey,
    spendingPublicKey,
    viewingPublicKey,
    stealthMetaAddress,
  }
}

export async function generateStealthInfo(
  stealthMetaAddress: `st:base:0x${string}`,
) {
  if (!stealthMetaAddress.startsWith('st:base:0x')) {
    throw new Error(
      'Wrong address format; Address must start with `st:base:0x...`',
    )
  }

  const spendPublicKey = ('0x' + stealthMetaAddress.slice(9, 75)) as Hex
  const viewPublicKey = ('0x' + stealthMetaAddress.slice(75)) as Hex

  // generate random ephemeral private key
  const ephemeralPrivateKey = toHex(randomPrivateKey())

  // generate shared secret
  const sharedSecret = secp.getSharedSecret(
    ephemeralPrivateKey.replace('0x', ''),
    viewPublicKey.replace('0x', ''),
  )
  const hashedSharedSecret = keccak256(Buffer.from(sharedSecret.slice(2)))

  const viewTag = hashedSharedSecret.slice(0, 4)

  // Generate the stealth owner address
  const { stealthAddresses } = generateStealthAddresses({
    spendingPublicKeys: [spendPublicKey],
    ephemeralPrivateKey,
  })

  // generate ephemeral public key
  const ephemeralAccount = privateKeyToAccount(ephemeralPrivateKey)
  const ephemeralPublicKey = ephemeralAccount.publicKey

  return {
    stealthMetaAddress,
    stealthAddress: stealthAddresses[0],
    ephemeralPublicKey,
    metadata: viewTag,
  }
}

export async function generateStealthPrivate({
  userPrivateKey,
  userPin,
  userAddress,
  ephemeralPublicKey,
}: {
  userPrivateKey: `0x${string}`
  userPin: string
  userAddress: string
  ephemeralPublicKey: `0x${string}`
}) {
  // Generate the signature from which the private keys will be derived
  const account = privateKeyToAccount(userPrivateKey)
  const { message } = generateFluidkeyMessage({
    pin: userPin,
    address: userAddress,
  })
  const signature = await account.signMessage({
    message,
  })

  // Generate the private keys from the signature
  const { spendingPrivateKey, viewingPrivateKey } =
    generateKeysFromSignature(signature)

  // Generate stealth private key from ephemeral public key
  const { stealthPrivateKey } = generateStealthPrivateKey({
    spendingPrivateKey,
    ephemeralPublicKey,
  })

  const stealthAccount = privateKeyToAccount(stealthPrivateKey)
  const stealthAddress = stealthAccount.address

  return {
    ephemeralPublicKey,
    stealthPrivateKey,
    stealthAddress,
  }
}
