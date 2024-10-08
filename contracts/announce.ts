import { createWalletClient, createPublicClient, custom, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { client } from "@/libs/viem";
import { announceContractAdddress } from "@/config/smart-contract-address";

import ERC5564AnnouncerABI from "./abi/ERC5564AnnouncerABI";
import { generateStealthPrivate } from "@/libs/stealth";

export async function announce({
  userPrivateKey,
  schemeId,
  stealthAddress,
  ephemeralPubKey,
  metadata,
}: {
  userPrivateKey: `0x${string}`;
  schemeId: number;
  stealthAddress: string;
  ephemeralPubKey: string;
  metadata: string;
}) {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(userPrivateKey),
    chain: baseSepolia,
    transport: http(),
  });

  const hash = await walletClient.writeContract({
    address: announceContractAdddress,
    abi: ERC5564AnnouncerABI,
    functionName: "announce",
    args: [schemeId, stealthAddress, ephemeralPubKey, metadata],
  });
  console.log("Successfully published announce, Transaction hash:", hash);

  return hash;
}

export async function watchAnnouncements(spendingPrivateKey: Hex | string) {
  if (!spendingPrivateKey) return

  const watch = client.watchContractEvent({
    address: announceContractAdddress,
    abi: ERC5564AnnouncerABI,
    eventName: 'Announcement',
    pollingInterval: 1_000,
    onError: error => console.log(error),
    onLogs: async (logs) => {
      const newAnnouncement = logs[0]

      if (newAnnouncement) {
        const newBlockNumber = newAnnouncement.blockNumber?.toString().slice(0, -1)
        console.log(newAnnouncement.blockNumber?.toString().slice(0, -1), 'NEW BLOCK NUMBER')
        // Store to async storage
        try {
          await AsyncStorage.setItem('latestBlockNumber', newBlockNumber as string)
        } catch (error) {
          console.error('Error storing latestBlockNumber', error)
        }

        const { stealthAddress, ephemeralPubKey, schemeId, metadata } = newAnnouncement.args
        const newAnnouncementMetadata = {
          stealthAddress,
          ephemeralPubKey,
          block_number: newBlockNumber,
          schemeId,
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
      }
    }
  })

  return watch
}
