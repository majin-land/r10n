import { createWalletClient, http, Hex, erc20Abi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  announceContractAdddress,
  usdcTokenAddress,
} from '@/config/smart-contract-address'
import {
  ACTIVITY_STEALTH_ADDRESS,
  USER_STEALTH_ADDRESS_COLLECTIONS,
} from '@/config/storage-key'
import { Activity, StealthInfo } from '@/interface'
import { generateStealthPrivate } from '@/libs/stealth'
import { client } from '@/libs/viem'
import { getBlockTimestamp } from '@/utils/helper'

import ERC5564AnnouncerABI from './abi/ERC5564AnnouncerABI'

export async function announce({
  userPrivateKey,
  schemeId,
  stealthAddress,
  ephemeralPubKey,
  metadata,
}: {
  userPrivateKey: `0x${string}`
  schemeId: number
  stealthAddress: string
  ephemeralPubKey: string
  metadata: string
}) {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(userPrivateKey),
    chain: baseSepolia,
    transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
  })

  const hash = await walletClient.writeContract({
    address: announceContractAdddress,
    abi: ERC5564AnnouncerABI,
    functionName: 'announce',
    args: [schemeId, stealthAddress, ephemeralPubKey, metadata],
  })
  console.log('Successfully published announce, Transaction hash:', hash)

  return hash
}

export async function watchAnnouncements(
  spendingPrivateKey: Hex | string,
  stealthMetaAddress: `st:base:0x${string}`,
) {
  let balance = 0
  if (!spendingPrivateKey) return

  const watch = client.watchContractEvent({
    address: announceContractAdddress,
    abi: ERC5564AnnouncerABI,
    eventName: 'Announcement',
    pollingInterval: 100_000,
    onError: (error) => console.log(error),
    onLogs: async (logs) => {
      const newAnnouncement = logs[0]

      // Get the user stealth address collection from AsyncStorage
      const getUserStealthAddressCollection = await AsyncStorage.getItem(
        USER_STEALTH_ADDRESS_COLLECTIONS,
      )

      if (newAnnouncement) {
        const newBlockNumber = newAnnouncement.blockNumber
          ?.toString()
          .slice(0, -1)
        console.log(
          newAnnouncement.blockNumber?.toString().slice(0, -1),
          'NEW BLOCK NUMBER',
        )
        // Store to async storage
        try {
          await AsyncStorage.setItem(
            'latestBlockNumber',
            newBlockNumber as string,
          )
        } catch (error) {
          console.error('Error storing latestBlockNumber', error)
        }

        const { stealthAddress, ephemeralPubKey, schemeId, metadata } =
          newAnnouncement.args
        const newAnnouncementMetadata = {
          stealthAddress,
          ephemeralPubKey,
          block_number: newBlockNumber,
          schemeId: schemeId.toString().slice(0, -1),
          metadata,
          transactionHash_: newAnnouncement.transactionHash,
          timestamp_: Date.now(),
        }

        if (!stealthAddress || !ephemeralPubKey) {
          console.warn('Invalid announcement data:', newAnnouncement)
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
                newAnnouncementMetadata,
              ]
              console.log(updatedAnnouncements, 'ANNOUNCEMENT WILL UPDATE')
              await AsyncStorage.setItem(
                '@announcements',
                JSON.stringify(updatedAnnouncements),
              )

              const stealthAdresses: StealthInfo[] | null =
                getUserStealthAddressCollection
                  ? JSON.parse(getUserStealthAddressCollection)
                  : null

              // TODO: check stealth address USDC balance and put into StealthInfo
              // get transfer events from erc20transfer, check there are available activity token in the stealth address
              try {
                const logs = await client.getContractEvents({
                  address: usdcTokenAddress,
                  abi: erc20Abi,
                  eventName: 'Transfer',
                  args: { to: stealthAddress },
                  strict: true,
                })

                if (logs.length > 0) {
                  const transferLog = logs[0]
                  const amountTransferred = transferLog.args.value

                  const blockTimestamp = await getBlockTimestamp(
                    transferLog.blockNumber,
                  )
                  const date = new Date(blockTimestamp).toISOString()

                  const newActivity = {
                    txHash: transferLog.transactionHash,
                    type: 'c',
                    token: usdcTokenAddress,
                    stealthAddress: stealthAddress,
                    amount: Number(amountTransferred) / 1e6, // Convert to USDC format,
                    date,
                  }

                  // update balance value = amountTransferred
                  balance = Number(amountTransferred) / 1e6

                  const activities = await AsyncStorage.getItem(
                    ACTIVITY_STEALTH_ADDRESS,
                  )
                  const _activities: Activity[] = activities
                    ? JSON.parse(activities)
                    : []

                  // check if there's no activity exist with the same tx hash
                  if (
                    !_activities.some(
                      (activity) =>
                        activity.txHash === transferLog.transactionHash,
                    )
                  ) {
                    // then Store the activity in AsyncStorage
                    await AsyncStorage.setItem(
                      ACTIVITY_STEALTH_ADDRESS,
                      JSON.stringify([
                        newActivity,
                        ..._activities.filter((act) => act.stealthAddress),
                      ]),
                    )
                    console.log('New Activity')
                    console.log(JSON.stringify(newActivity, null, 4))
                  }
                } else {
                  console.log('No matching Transfer events found.')
                }
              } catch (e) {
                console.error('Failed to get transfer events from announce:', e)
              }

              const stealthAnnouncementInfo: StealthInfo = {
                stealthMetaAddress,
                stealthAddress: stealthAddress as Hex,
                ephemeralPublicKey: ephemeralPubKey as Hex,
                metadata,
                balance,
              }

              // check this announcement's stealth address is not exist on stealth address collection
              if (
                !stealthAdresses?.some(
                  (sma) => sma.stealthAddress === stealthAddress,
                )
              ) {
                // Store new stealthInfo to AsyncStorage
                await AsyncStorage.setItem(
                  USER_STEALTH_ADDRESS_COLLECTIONS,
                  JSON.stringify([
                    ...(stealthAdresses || []),
                    stealthAnnouncementInfo,
                  ]),
                )
              }

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
      }
    },
  })

  return watch
}
