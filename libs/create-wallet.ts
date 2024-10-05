import { toHex, toBytes } from 'viem/utils'
import { sha256 } from '@noble/hashes/sha2'
import { sha512 } from '@noble/hashes/sha512'
import { pbkdf2Async } from '@noble/hashes/pbkdf2'
import { hkdf } from '@noble/hashes/hkdf'
import * as secp from '@noble/secp256k1'

function randomPrivateKey(): bigint {
  const randPrivateKey = secp.utils.randomPrivateKey()
  return BigInt(`0x${Buffer.from(randPrivateKey).toString('hex')}`)
}

const createUserWallet = async () => {
  // Generate random entropy
  const random = randomPrivateKey()

  // Broadcast and collect entropy from nodes (assuming Lit.Actions works similarly)
  const entropies = [
    toHex(random),
    toHex(randomPrivateKey()),
    toHex(randomPrivateKey()),
  ]

  // Combine entropies to form a single entropy hex string
  const entropyHex = entropies
    .sort()
    .reduce((acc, s) => (acc + s.slice(2)) as `0x${string}`, '0x')
  const entropy = hkdf(
    sha256,
    toBytes(entropyHex),
    new Uint8Array(32),
    'seed',
    32,
  )

  // Generate BIP39 Seed
  const password = ''
  const encoder = new TextEncoder()
  const salt = encoder.encode('mnemonic' + password)
  const seed = await pbkdf2Async(sha512, entropy, salt, { c: 2048, dkLen: 64 })

  // Generate BIP32 Root Key
  const rootHDNode = derivePath('m', seed)
  const bip32RootKey = rootHDNode.toBase58()

  // Ensure all nodes agree on the same BIP32 Root Key
  // const rootKeyIds: string[] = await Lit.Actions.broadcastAndCollect({
  //   name: 'response',
  //   value: sha256(bip32RootKey),
  // })
  // if (!rootKeyIds.every((id) => id === rootKeyIds[0])) {
  //   throw new Error(
  //     `Node synchronization failed: Expected all responses to be "${rootKeyIds[0]}", but got variations: [${rootKeyIds.join(', ')}]`,
  //   )
  // }

  // Derive BIP32 path for Ethereum network
  const networkPath = "m/44'/60'/0'/0"

  // Generate accounts from the derived HDNode
  const accounts = [0].map((num) => {
    const path = `${networkPath}/${num}`
    const hd = derivePath(path, seed)
    const { address, publicKey } = hd // Assume publicKey is extracted here
    return [path, { address, publicKey }]
  })

  return {
    accounts,
    bip32RootKey,
  }
}
