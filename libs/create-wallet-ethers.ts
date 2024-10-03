import { ethers } from 'ethers'
import { toHex, toBytes } from 'viem/utils'
import { sha256 } from '@noble/hashes/sha2'
import { sha512 } from '@noble/hashes/sha512'
import { pbkdf2Async } from '@noble/hashes/pbkdf2'
import { hkdf } from '@noble/hashes/hkdf'
import * as secp from "@noble/secp256k1";
// import { derivePath } from 'bip32'
import { mnemonicToSeedSync } from 'bip39'


function randomPrivateKey(): bigint {
    const randPrivateKey = secp.utils.randomPrivateKey();
    return BigInt(`0x${Buffer.from(randPrivateKey).toString("hex")}`);
  }
  

export const createUserWalletEthers = async () => {
    
    // Generate random entropy
    const random = randomPrivateKey()
    
    // Broadcast and collect entropy from nodes (assuming Lit.Actions works similarly)
    const entropies = [toHex(random), toHex(randomPrivateKey()), toHex(randomPrivateKey())]
    
    // Combine entropies to form a single entropy hex string
    const entropyHex = entropies.sort().reduce((acc, s) => acc + s.slice(2), '0x')
    const entropy = hkdf(sha256, toBytes(entropyHex), new Uint8Array(32), 'seed', 32)
    console.log(entropy, 'ssssss')
    // Generate BIP39 Seed
    const password = ''
    const encoder = new TextEncoder()
    const salt = encoder.encode('mnemonic' + password)
    const seed = await pbkdf2Async(sha512, entropy, salt, { c: 2048, dkLen: 64 })
    
    // Generate BIP32 Root Key
    const rootHDNode = ethers.utils.HDNode.fromSeed(seed)
    // derivePath("m", seed)
    const { extendedKey: bip32RootKey } = rootHDNode
    
    // Derive BIP32 path for Ethereum network
    const networkPath = "m/44'/60'/0'/0"
    
    // Generate accounts from the derived HDNode
    const accounts = [0].map((num) => {
      const path = `${networkPath}/${num}`
      const hd = rootHDNode.derivePath(path)
      const wallet = new ethers.Wallet(hd)
      const { address, publicKey: publicKeyLong } = wallet
      
      // const { address, publicKey } = hd // Assume publicKey is extracted here
      return { path, address, publicKey: hd.publicKey, publicKeyLong, privateKey: hd.privateKey, mnemonic: hd.mnemonic }
    })

    return {
      accounts,
      bip32RootKey,
    }
}
