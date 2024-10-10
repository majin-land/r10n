import React, { useEffect } from 'react'
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation, useRouter } from 'expo-router'
import { Hex } from 'viem'

import { useWallet } from '@/context/WalletContext'
import { useStealthMetaAddress } from '@/context/StealthMetaAddress'
import { useAnnouncements } from '@/context/AnnouncementContext'
import { createUserWalletEthers } from '@/libs/create-wallet-ethers'
import { generateStealthMetaAddress } from '@/libs/stealth'

const WalletScreen: React.FC = () => {
  const {
    walletAddress,
    privateKey,
    storeWallet,
    retrieveWallet,
    clearWallet,
    bib32RootKey,
  } = useWallet()
  const {
    storeStealthMetaAddress,
    retrieveStealthMetaAddress,
    spendingPrivateKey,
  } = useStealthMetaAddress()
  const {
    retrieveLatestBlockNumber,
    storeAnnouncements,
    retrieveAnnouncements,
    refetchAnnouncements,
  } = useAnnouncements()
  const router = useRouter()

  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  }, [navigation])

  const handleCreateWallet = async () => {
    try {
      console.log('Starting handleCreateWallet...')
      const existingWallet = await retrieveWallet()
      console.log('Existing wallet:', existingWallet)

      if (existingWallet) {
        const storedMetaAddress = await retrieveStealthMetaAddress()
        await retrieveAnnouncements()

        const storedBlockNumber = await retrieveLatestBlockNumber()
        console.log('Stored block number:', storedBlockNumber)

        if (!storedBlockNumber) {
          console.warn('Stored block number is null or undefined.')
          return
        }

        const dataAnnouncements = await refetchAnnouncements(
          storedBlockNumber as string,
        )
        console.log('Fetched announcements:', dataAnnouncements)

        if (dataAnnouncements && storedMetaAddress) {
          await storeAnnouncements(
            dataAnnouncements,
            storedMetaAddress.spendingPrivateKey as Hex,
            storedMetaAddress.stealthMetaAddress as `st:base:0x${string}`,
          )
        }

        console.log('Navigating to /home')
        router.replace('/home')
        return
      }

      console.log('Creating a new wallet...')
      const createNewWallet = async () => {
        const result = await createUserWalletEthers()
        const { address, privateKey } = result.accounts[0]
        const bip32RootKey = result.bip32RootKey

        await storeWallet(address, privateKey, bip32RootKey)
        return { address, privateKey }
      }

      const { address: newAddress, privateKey: newPrivateKey } =
        await createNewWallet()
      console.log('New wallet address:', newAddress)

      const stealthData = await generateStealthMetaAddress({
        userPrivateKey: newPrivateKey as Hex,
        userPin: '1234',
        userAddress: newAddress,
      })

      console.log('Generated stealth address data:', stealthData)

      if (stealthData) {
        const {
          stealthMetaAddress,
          spendingPrivateKey: generatedSpendingPrivKey,
          viewingPrivateKey: generatedViewingPrivKey,
          spendingPublicKey: generatedSpendingPubKey,
          viewingPublicKey: generatedViewingPubKey,
        } = stealthData

        await storeStealthMetaAddress({
          stealthMetaAddress,
          spendingPrivateKey: generatedSpendingPrivKey,
          viewingPrivateKey: generatedViewingPrivKey,
          spendingPublicKey: generatedSpendingPubKey,
          viewingPublicKey: generatedViewingPubKey,
        })
      }

      console.log('Navigating to /home after wallet creation')
      router.replace('/home')
    } catch (error) {
      console.error('Error in handleCreateWallet:', error)
    }
  }

  return (
    <View style={styles.container}>
      {walletAddress ? (
        <View style={styles.walletInfo}>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.value}>{walletAddress}</Text>

          <Text style={styles.label}>Private Key:</Text>
          <Text style={styles.value}>{privateKey}</Text>

          <Text style={styles.label}>BIP32 Root Key:</Text>
          <Text style={styles.value}>{bib32RootKey}</Text>

          <TouchableOpacity style={styles.clearButton} onPress={clearWallet}>
            <Text style={styles.clearButtonText}>Clear Wallet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.connectContainer}>
          <Text style={styles.connectMessage}>No wallet connected</Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleCreateWallet}
          >
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  walletInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  connectContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectMessage: {
    fontSize: 18,
    fontWeight: '500',
    color: '#888',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default WalletScreen
