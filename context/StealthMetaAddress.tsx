import React, { createContext, useContext, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { StealthInfo } from '@/interface'
import { USER_STEALTH_ADDRESS_COLLECTIONS } from '@/config/storage-key'
import { usdcTokenAddress } from '@/config/smart-contract-address'

// Define the types
type stealthMetaAddressCredentials = {
  stealthMetaAddress: string
  spendingPrivateKey: string
  viewingPrivateKey: string
  spendingPublicKey: string
  viewingPublicKey: string
}

interface StealthMetaAddressContextType {
  spendingPrivateKey: string | null
  viewingPrivateKey: string | null
  spendingPublicKey: string | null
  viewingPublicKey: string | null
  stealthMetaAddress: string | null
  storeStealthMetaAddress: ({
    stealthMetaAddress,
    spendingPrivateKey,
    viewingPrivateKey,
    spendingPublicKey,
    viewingPublicKey,
  }: stealthMetaAddressCredentials) => Promise<void>
  retrieveStealthMetaAddress: () => Promise<stealthMetaAddressCredentials | null>
  fetchStealthWalletBalance: () => Promise<number>
}

const StealthMetaAddressContext = createContext<
  StealthMetaAddressContextType | undefined
>(undefined)

export const useStealthMetaAddress = (): StealthMetaAddressContextType => {
  const context = useContext(StealthMetaAddressContext)
  if (!context) {
    throw new Error(
      'useStealthMetaAddress must be used within a StealthMetaAddressProvider',
    )
  }
  return context
}

export const StealthMetaAddressProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string | null>(
    null,
  )
  const [spendingPrivateKey, setSpendingPrivateKey] = useState<string | null>(
    null,
  )
  const [viewingPrivateKey, setViewingPrivateKey] = useState<string | null>(
    null,
  )
  const [spendingPublicKey, setSpendingPublicKey] = useState<string | null>(
    null,
  )
  const [viewingPublicKey, setViewingPublicKey] = useState<string | null>(null)

  // Store StealthMetaAddress credentials to async storage
  const storeStealthMetaAddress = async ({
    stealthMetaAddress,
    spendingPrivateKey,
    viewingPrivateKey,
    spendingPublicKey,
    viewingPublicKey,
  }: {
    stealthMetaAddress: string
    spendingPrivateKey: string
    viewingPrivateKey: string
    spendingPublicKey: string
    viewingPublicKey: string
  }): Promise<void> => {
    try {
      // store generated keys and stealth meta address to local storage
      await AsyncStorage.setItem('stealthMetaAddress', stealthMetaAddress)
      await AsyncStorage.setItem('spendingPrivateKey', spendingPrivateKey)
      await AsyncStorage.setItem('viewingPrivateKey', viewingPrivateKey)
      await AsyncStorage.setItem('spendingPublicKey', spendingPublicKey)
      await AsyncStorage.setItem('viewingPublicKey', viewingPublicKey)

      setStealthMetaAddress(stealthMetaAddress)
      setSpendingPrivateKey(spendingPrivateKey)
      setViewingPrivateKey(viewingPrivateKey)
      setSpendingPublicKey(spendingPublicKey)
      setViewingPublicKey(viewingPublicKey)
    } catch (error) {
      console.error('Error storing Stealth meta address credentials', error)
    }
  }

  // Retrieve StealthMetaAddress credentials from SecureStore
  const retrieveStealthMetaAddress =
    async (): Promise<stealthMetaAddressCredentials | null> => {
      try {
        const storedStealthMetaAddress = await AsyncStorage.getItem(
          'stealthMetaAddress',
        )
        const storedSpendingPrivateKey = await AsyncStorage.getItem(
          'spendingPrivateKey',
        )
        const storedViewingPrivateKey = await AsyncStorage.getItem(
          'viewingPrivateKey',
        )
        const storedSpendingPublicKey = await AsyncStorage.getItem(
          'spendingPublicKey',
        )
        const storedViewingPublicKey = await AsyncStorage.getItem(
          'viewingPublicKey',
        )

        console.log(storedStealthMetaAddress, 'STORED META ADDRESS')

        if (
          storedStealthMetaAddress &&
          storedSpendingPrivateKey &&
          storedViewingPrivateKey &&
          storedSpendingPublicKey &&
          storedViewingPublicKey
        ) {
          // Decrypt the private key
          // const decryptedKey = decryptPrivateKey(storedPrivateKey);

          setStealthMetaAddress(storedStealthMetaAddress)
          setSpendingPrivateKey(storedSpendingPrivateKey)
          setViewingPrivateKey(storedViewingPrivateKey)
          setSpendingPublicKey(storedSpendingPublicKey)
          setViewingPublicKey(storedViewingPublicKey)
          return {
            stealthMetaAddress: storedStealthMetaAddress,
            spendingPrivateKey: storedSpendingPrivateKey,
            viewingPrivateKey: storedViewingPrivateKey,
            spendingPublicKey: storedSpendingPublicKey,
            viewingPublicKey: storedViewingPublicKey,
          }
        }
      } catch (error) {
        console.error(
          'Error retrieving stealth meta address credentials',
          error,
        )
      }
      return null
    }

  const fetchStealthWalletBalance = async () => {
    const getUserStealthAddressCollection = await AsyncStorage.getItem(
      USER_STEALTH_ADDRESS_COLLECTIONS,
    )

    const stealthAddresses: StealthInfo[] = getUserStealthAddressCollection
      ? JSON.parse(getUserStealthAddressCollection)
      : []

    // Calculate total balance directly from StealthInfo balance
    const totalBalance = stealthAddresses.reduce((total, address) => {
      const usdcBalance = address?.balance?.get(usdcTokenAddress) || 0
      return total + usdcBalance
    }, 0)

    return totalBalance
  }

  return (
    <StealthMetaAddressContext.Provider
      value={{
        spendingPrivateKey,
        viewingPrivateKey,
        spendingPublicKey,
        viewingPublicKey,
        stealthMetaAddress,
        storeStealthMetaAddress,
        retrieveStealthMetaAddress,
        fetchStealthWalletBalance,
      }}
    >
      {children}
    </StealthMetaAddressContext.Provider>
  )
}
