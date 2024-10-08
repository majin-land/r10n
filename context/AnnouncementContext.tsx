import React, { createContext, useContext, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { generateStealthPrivateKey } from '@fluidkey/stealth-account-kit'
import { privateKeyToAccount } from 'viem/accounts'
import { Hex } from 'viem'
import { useQuery } from '@apollo/client'

import { GET_ANNOUNCEMENTS } from '@/apollo/queries/announcements'
import { generateStealthPrivate } from '@/libs/stealth'

// Define the types
type announcementsCredentials = {
  stealthAddress: Hex | string
  ephemeralPubKey: Hex | string
  schemeId: string | number
  metadata: string
  block_number: string
}

interface AnnouncementsContextType {
  latestBlockNumber: string | null
  announcements: announcementsCredentials[] | []
  storeAnnouncements: (
    announcements: announcementsCredentials[],
    spendingPrivateKey: Hex | string,
  ) => Promise<void>
  retrieveAnnouncements: () => Promise<announcementsCredentials[] | null>
  retrieveLatestBlockNumber: () => Promise<string | null>
  refetchAnnouncements: (
    block_number: string,
  ) => Promise<announcementsCredentials[]>
}

const AnnouncementsContext = createContext<
  AnnouncementsContextType | undefined
>(undefined)

export const useAnnouncements = (): AnnouncementsContextType => {
  const context = useContext(AnnouncementsContext)
  if (!context) {
    throw new Error(
      'useAnnouncements must be used within a AnnouncementsProvider',
    )
  }
  return context
}

export const AnnouncementsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [latestBlockNumber, setLatestBlockNumber] = useState<string>('0')
  const [announcements, setAnnouncements] = useState<
    announcementsCredentials[] | []
  >([])

  const { data: dataAnnouncements, refetch } = useQuery(GET_ANNOUNCEMENTS, {
    variables: { blockNumber: latestBlockNumber },
  })

  const refetchAnnouncements = async (
    block_number: string,
  ): Promise<announcementsCredentials[]> => {
    const dataRefetch = await refetch({ blockNumber: block_number })
    if (dataRefetch) {
      return dataRefetch.data.announcements
    }
    return dataAnnouncements
  }

  // store Announcements credentials to async storage
  const storeAnnouncements = async (
    announcements: announcementsCredentials[],
    spendingPrivateKey: Hex | string,
  ): Promise<void> => {
    if (!spendingPrivateKey) {
      console.error('Spending private key is missing or invalid.')
      return
    }

    if (!announcements || announcements.length === 0) {
      console.error('No announcements to store.')
      return
    }

    const theLatestBlockNumber = announcements[0].block_number

    // Store to async storage
    try {
      await AsyncStorage.setItem('latestBlockNumber', theLatestBlockNumber)
      setLatestBlockNumber(theLatestBlockNumber)
    } catch (error) {
      console.error('Error storing latestBlockNumber', error)
    }

    const storeAnnouncements = announcements.map(
      async (announcement: announcementsCredentials) => {
        const { stealthAddress, ephemeralPubKey } = announcement

        if (!stealthAddress || !ephemeralPubKey) {
          console.warn('Invalid announcement data:', announcement)
          return
        }

        // Generate stealth private key from ephemeral public key
        try {
          const { stealthAddress: generatedStealthAddress } =
            await generateStealthPrivate({
              ephemeralPublicKey: ephemeralPubKey as Hex,
              spendingPrivateKey: spendingPrivateKey as Hex,
            })

          // Check if generated stealth address matches the one from contract
          if (stealthAddress === generatedStealthAddress) {
            console.log('Saving announcements')
            try {
              // Check if announcements are already stored
              const storedAnnouncements = await AsyncStorage.getItem(
                '@announcements',
              )
              const currentAnnouncements = storedAnnouncements
                ? JSON.parse(storedAnnouncements)
                : []

              // Merge new announcements with current ones
              const updatedAnnouncements = [
                ...currentAnnouncements,
                announcement,
              ]
              await AsyncStorage.setItem(
                '@announcements',
                JSON.stringify(updatedAnnouncements),
              )

              console.log('Announcements updated successfully!')
            } catch (e) {
              console.error('Failed to update announcements:', e)
            }
          } else {
            console.warn(
              `Stealth address mismatch: expected ${stealthAddress}, got ${generatedStealthAddress}`,
            )
          }
        } catch (e) {
          console.error('Error generating stealth private key:', e)
        }
      },
    )

    await Promise.all(storeAnnouncements)
  }

  // Retrieve Announcements credentials from SecureStore
  const retrieveAnnouncements = async (): Promise<
    announcementsCredentials[] | null
  > => {
    try {
      const storedAnnouncements = await AsyncStorage.getItem('@announcements')
      const parsedStoredAnnouncements =
        storedAnnouncements != null ? JSON.parse(storedAnnouncements) : []
      if (storedAnnouncements) {
        setAnnouncements(JSON.parse(parsedStoredAnnouncements))
        return JSON.parse(parsedStoredAnnouncements)
      }
    } catch (e) {
      console.error('Failed to retrieve announcements:', e)
    }
    return null
  }

  const retrieveLatestBlockNumber = async (): Promise<string | null> => {
    try {
      const storedLatestBlockNumber = await AsyncStorage.getItem(
        'latestBlockNumber',
      )

      if (storedLatestBlockNumber) {
        setLatestBlockNumber(storedLatestBlockNumber)

        return storedLatestBlockNumber
      }
    } catch (e) {
      console.error('Failed to retrieve latest block number:', e)
    }
    return null
  }

  return (
    <AnnouncementsContext.Provider
      value={{
        latestBlockNumber,
        announcements,
        storeAnnouncements,
        retrieveAnnouncements,
        retrieveLatestBlockNumber,
        refetchAnnouncements,
      }}
    >
      {children}
    </AnnouncementsContext.Provider>
  )
}
