import * as secp from '@noble/secp256k1'
import { bytesToHex } from '@noble/hashes/utils'

import { keccak256, toHex } from 'viem'

const isCompressed = true

function uintArrayToHex(uintArray: Uint8Array): string {
  return secp.etc.bytesToHex(uintArray)
}

function randomPrivateKey(): bigint {
  const randPrivateKey = secp.utils.randomPrivateKey()
  return BigInt(`0x${Buffer.from(randPrivateKey).toString('hex')}`)
}

function validatePublicKey(publicKey: string) {
  try {
    // Remove the '0x' prefix if present
    const publicKeyWithoutPrefix = publicKey.startsWith('0x')
      ? publicKey.slice(2)
      : publicKey

    // Check if the public key is valid by trying to parse it
    secp.ProjectivePoint.fromHex(publicKeyWithoutPrefix)
  } catch (e) {
    throw new Error('Public key is not a valid point on the secp256k1 curve.')
  }
}

// Generate stealth meta address
export function generateStealthMetaAddress(): [
  string,
  string,
  string,
  string,
  `st:base:0x${string}`,
] {
  const spendingPrivateKey = randomPrivateKey()
  const viewingPrivateKey = randomPrivateKey()
  const spendingPublicKey = uintArrayToHex(
    secp.getPublicKey(spendingPrivateKey, isCompressed),
  )
  const viewingPublicKey = uintArrayToHex(
    secp.getPublicKey(viewingPrivateKey, isCompressed),
  )
  const stealthMetaAddress =
    `st:base:0x${spendingPublicKey}${viewingPublicKey}` as `st:base:0x${string}`

  return [
    `0x${spendingPrivateKey.toString(16)}`,
    `0x${viewingPrivateKey.toString(16)}`,
    `0x${spendingPublicKey}`,
    `0x${viewingPublicKey}`,
    stealthMetaAddress,
  ]
}

function toEthAddress(PublicKey: string) {
  var stAA = keccak256(Buffer.from(PublicKey, 'hex').slice(1)).toString()
  return '0x' + stAA.slice(-40)
}

export function generateStealthInfo(stealthMetaAddress: `st:base:0x${string}`) {
  const USER = stealthMetaAddress
  if (!USER.startsWith('st:base:0x')) {
    throw 'Wrong address format Address must start with `st:base:0x...`'
  }

  // Parse the public keys (assuming uncompressed public keys of 130 hex characters for each)
  const spendPublicKeyHex = USER.slice(9, 75) // 66 hex characters (33 bytes)
  const viewPublicKeyHex = USER.slice(75) // Remaining hex characters

  validatePublicKey(spendPublicKeyHex)
  validatePublicKey(viewPublicKeyHex)

  const R_pubkey_spend = secp.ProjectivePoint.fromHex(spendPublicKeyHex)
  console.log('R_pubkey_spend:', R_pubkey_spend)

  const R_pubkey_view = secp.ProjectivePoint.fromHex(viewPublicKeyHex)

  const ephemeralPrivateKey = randomPrivateKey()

  const ephemeralPublicKey = secp.getPublicKey(
    ephemeralPrivateKey,
    isCompressed,
  )
  console.log(
    'ephemeralPublicKey:',
    Buffer.from(ephemeralPublicKey).toString('hex'),
  )
  console.log('ephemeralPrivateKey:', ephemeralPrivateKey.toString(16))

  // Calculate the shared secret
  const sharedSecret = secp.getSharedSecret(
    Buffer.from(ephemeralPrivateKey.toString(16).padStart(64, '0'), 'hex'),
    R_pubkey_view.toRawBytes(true),
  )
  console.log('sharedSecret:', sharedSecret)

  const hashedSharedSecret = keccak256(Buffer.from(sharedSecret.slice(1))) // Remove prefix byte
  console.log('hashedSharedSecret:', hashedSharedSecret)

  const ViewTag = hashedSharedSecret.slice(0, 2)
  console.log('View tag:', ViewTag.toString())

  const hashedSharedSecretPoint = secp.ProjectivePoint.fromPrivateKey(
    BigInt(`${hashedSharedSecret}`),
  )
  console.log('hashedSharedSecretPoint:', hashedSharedSecretPoint)

  const stealthPublicKey = R_pubkey_spend.add(hashedSharedSecretPoint)
  console.log('stealthPublicKey.toHex():', stealthPublicKey.toHex())

  const stealthAddress = toEthAddress(stealthPublicKey.toHex())
  console.log('stealthAddress:', stealthAddress)

  return {
    stealthAddress,
    ephemeralPublicKey: `0x${Buffer.from(ephemeralPublicKey).toString('hex')}`,
    ViewTag: `0x${ViewTag}`,
  }
}
