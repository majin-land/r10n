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

import { registerKeys, registerKeysOnBehalf } from './smart-contract'

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

export async function generateStealthSafeAccount({
  userPrivateKey,
  userPin,
  userAddress,
  viewingPrivateKeyNodeNumber = 0,
  startNonce = BigInt(0),
  endNonce = BigInt(10),
  chainId = 0,
}: {
  userPrivateKey: `0x${string}`
  userPin: string
  userAddress: string
  viewingPrivateKeyNodeNumber?: number
  startNonce?: bigint
  endNonce?: bigint
  chainId?: number
}): Promise<
  {
    nonce: bigint
    stealthSafeAddress: `0x${string}`
    stealthPrivateKey: `0x${string}`
  }[][]
> {
  // Create an empty array to store the results
  const results: {
    nonce: bigint
    stealthSafeAddress: `0x${string}`
    stealthPrivateKey: `0x${string}`
  }[][] = [[], []]

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

  // Extract the node required to generate the pseudo-random input for stealth address generation
  const privateViewingKeyNode = extractViewingPrivateKeyNode(
    viewingPrivateKey,
    viewingPrivateKeyNodeNumber,
  )

  // Get the spending public key
  const spendingAccount = privateKeyToAccount(spendingPrivateKey)
  const spendingPublicKey = spendingAccount.publicKey

  // Loop through the nonce range and predict the stealth Safe address
  for (let nonce = startNonce; nonce <= endNonce; nonce++) {
    // Generate the ephemeral private key
    const { ephemeralPrivateKey } = generateEphemeralPrivateKey({
      viewingPrivateKeyNode: privateViewingKeyNode,
      nonce,
      chainId,
    })

    // Generate the stealth owner address
    const { stealthAddresses } = generateStealthAddresses({
      spendingPublicKeys: [spendingPublicKey],
      ephemeralPrivateKey,
    })

    // Predict the corresponding stealth Safe address, both passing the client and using
    // the CREATE2 option with bytecode, making sure the addresses generated are the same
    const { stealthSafeAddress: stealthSafeAddressWithClient } =
      await predictStealthSafeAddressWithClient({
        threshold: 1,
        stealthAddresses,
        safeVersion: '1.3.0',
        useDefaultAddress: true,
      })
    const { stealthSafeAddress: stealthSafeAddressWithBytecode } =
      predictStealthSafeAddressWithBytecode({
        threshold: 1,
        stealthAddresses,
        safeVersion: '1.3.0',
        safeProxyBytecode:
          '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564',
        useDefaultAddress: true,
      })

    // Generate the stealth private spending key controlling the stealth Safe
    const { stealthPrivateKey } = generateStealthPrivateKey({
      spendingPrivateKey,
      ephemeralPublicKey: privateKeyToAccount(ephemeralPrivateKey).publicKey,
    })

    // Add the result to the results array
    results[0].push({
      nonce,
      stealthSafeAddress: stealthSafeAddressWithClient,
      stealthPrivateKey,
    })
    results[1].push({
      nonce,
      stealthSafeAddress: stealthSafeAddressWithBytecode,
      stealthPrivateKey,
    })
  }

  // Return the results
  return results
}

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
    stealthAddress: stealthAddresses,
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
