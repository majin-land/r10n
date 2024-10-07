import 'react-native-get-random-values'

import { useStealthMetaAddress } from '@/context/StealthMetaAddress'
import { formatStealthAddress, formatStealthMetaAddress } from '@/utils/helper'
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useQuery } from '@apollo/client'
import { GET_STEALTH_META_ADDRESS_SETS } from '@/apollo/queries/stealthMetaAddressSets'
import { GET_ANNOUNCEMENTS } from '@/apollo/queries/announcements'
import { generateStealthInfo, generateStealthPrivate } from '@/libs/stealth'
import { useWallet } from '@/context/WalletContext'
import { useRouter } from 'expo-router'
import { getUsdcBalance, getUserBalance, transferUsdc } from '@/libs/viem'
import { formatEther } from 'viem'
import { LinearGradient } from 'expo-linear-gradient'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { generateStealthPrivateKey } from '@fluidkey/stealth-account-kit'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

type announcementType = {
  __typename: 'Announcement' | string
  block_number: string
  ephemeralPubKey: Hex | string
  id: string | Hex
  metadata: string | Hex
  schemeId: string
  stealthAddress: Hex | string
  timestamp_: string
  transactionHash_: string | Hex
}

// Updated activities data
const activitiesData = [
  {
    id: '1',
    date: 'October 1, 2024',
    amount: '400',
    type: 'received',
    token: 'USDC',
  },
  {
    id: '2',
    date: 'October 1, 2024',
    amount: '200',
    type: 'sent',
    token: 'USDC',
  },
  {
    id: '3',
    date: 'October 1, 2024',
    amount: '100',
    type: 'received',
    token: 'USDC',
  },
]

const HomeScreen: React.FC = () => {
  const { privateKey, walletAddress, clearWallet } = useWallet()
  const {
    stealthMetaAddress,
    spendingPublicKey,
    viewingPublicKey,
    spendingPrivateKey,
  } = useStealthMetaAddress()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [stealthAddress, setStealthAddress] = useState<`0x${string}` | null>(
    null,
  )

  const [mainBalance, setMainBalance] = useState<string>()
  const [mainBalanceUsdc, setMainBalanceUsdc] = useState<string>()

  const [selectedTab, setSelectedTab] = useState<'meta' | 'stealth'>('meta')
  const [blockNumber, setBlockNumber] = useState('14282482')
  const [stealthAddresses, setStealthAddresses] = useState([])

  const router = useRouter()

  const { data, loading, error } = useQuery(GET_STEALTH_META_ADDRESS_SETS, {
    variables: {},
  })
  const { data: queryAnnouncements } = useQuery(GET_ANNOUNCEMENTS, {
    variables: { blockNumber: blockNumber },
  })

  const fetchMainBalance = async () => {
    const userBalance = await getUserBalance(walletAddress as `0x${string}`)
    const usdcBalance = await getUsdcBalance(walletAddress as `0x${string}`)
    console.log(usdcBalance, 'ssssssss')
    console.log(formatEther(userBalance), 'ssssssss')
    setMainBalanceUsdc(String(usdcBalance))
    setMainBalance(formatEther(userBalance))
  }
  // console.log('registry', data)

  const copyToClipboard = async (address: string) => {
    await Clipboard.setStringAsync(address)
    alert('Copied to Clipboard')
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const generateInitialStealthAddress = async () => {
    try {
      const stealthInfo = await generateStealthInfo(
        stealthMetaAddress as `st:base:0x${string}`,
      )
      console.log(stealthInfo.stealthAddress, 'stealth address')

      setStealthAddress(stealthInfo.stealthAddress as unknown as `0x${string}`)

      // TODO: Store to storage and publish generated Address
    } catch (error) {
      const err =
        error instanceof Error
          ? JSON.parse(JSON.stringify(error))
          : String(error)
      console.error(err)
    }
  }

  const storeAnnouncements = async (announcements: any) => {
    const latestBlockNumber = announcements[0].block_number

    // store to async storage
    try {
      console.log(latestBlockNumber, 'Latest Block Number') // log the latest block number
      await AsyncStorage.setItem('latestBlockNumber', latestBlockNumber)

      setBlockNumber(latestBlockNumber)
    } catch (error) {
      console.error('Error storing latestBlockNumber', error)
    }

    announcements.map(async (announcement) => {
      const { stealthAddress, ephemeralPubKey } = announcement

      // Generate stealth private key from ephemeral public key
      const { stealthPrivateKey } = generateStealthPrivateKey({
        spendingPrivateKey: spendingPrivateKey as Hex,
        ephemeralPublicKey: ephemeralPubKey as Hex,
      })

      // get the stealth address
      const stealthAccount = privateKeyToAccount(stealthPrivateKey)
      const generatedStealthAddress = stealthAccount.address

      // check generated stealth address === stealth address from contract
      if (stealthAddress === generatedStealthAddress) {
        try {
          // check if current exist announcements storage
          const storedAnnouncements = await AsyncStorage.getItem(
            '@announcements',
          )
          const currentAnnouncements = storedAnnouncements
            ? JSON.parse(storedAnnouncements)
            : []

          // Merge the new announcements with the current ones
          const updatedAnnouncements = [
            ...currentAnnouncements,
            ...announcement,
          ]
          // store the announcement
          await AsyncStorage.setItem(
            '@announcements',
            JSON.stringify(updatedAnnouncements),
          )

          console.log('Announcements updated successfully!')
        } catch (e) {
          console.error('Failed to update announcements:', e)
        }
      }
    })
    console.log(announcements, 'DATA Announcements')
  }

  const retrieveAnnouncements = async () => {
    try {
      const storedAnnouncements = await AsyncStorage.getItem('@announcements')
      const parsedStoredAnnouncements =
        storedAnnouncements != null ? JSON.parse(storedAnnouncements) : []
      if (storedAnnouncements) {
        setStealthAddresses(JSON.parse(parsedStoredAnnouncements))
      }
    } catch (e) {
      console.error('Failed to retrieve announcements:', e)
    }
  }

  const getStoredLatestBlockNumber = async () => {
    const storedLatestAnnouncementsBlockNumber = await AsyncStorage.getItem(
      'latestBlockNumber',
    )

    if (storedLatestAnnouncementsBlockNumber) {
      setBlockNumber(storedLatestAnnouncementsBlockNumber)
    }
  }

  useEffect(() => {
    generateInitialStealthAddress()
    storeAnnouncements(queryAnnouncements.announcements)
    getStoredLatestBlockNumber()
    retrieveAnnouncements()
  }, [queryAnnouncements])

  useEffect(() => {
    fetchMainBalance()
  }, [walletAddress])

  // if (loading) return <Text>Loading...</Text>;
  // if (error) return <Text>Error: {error.message}</Text>;

  const renderActivity = ({ item }: { item: (typeof activitiesData)[0] }) => (
    <View style={styles.activityContainer}>
      <TouchableOpacity
        onPress={() => toggleExpand(item.id)}
        style={styles.activityHeader}
      >
        <Text style={styles.date}>{item.date}</Text>
        <Text
          style={[
            styles.amount,
            item.type === 'sent' ? styles.sent : styles.received,
          ]}
        >
          {item.amount} <Text style={styles.token}>{item.token}</Text>
        </Text>
      </TouchableOpacity>
      {expandedId === item.id && (
        <View style={styles.details}>
          <Text style={styles.detailsText}>
            {item.type === 'sent' ? 'You sent' : 'You received'} {item.amount}{' '}
            {item.token}
          </Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>R1ON</Text>
      <Text style={styles.label}>Main Wallet</Text>
      <LinearGradient
        colors={['#4ca1af', '#c4e0e5']}
        style={styles.balanceCard}
      >
        <View style={styles.mainWalletbalance}>
          <Text style={styles.balanceText}>{mainBalance || 0} ETH</Text>
          <Text style={styles.balanceText}>{mainBalanceUsdc || 0} ETH</Text>
        </View>
        <Text style={styles.text}>{walletAddress}</Text>
      </LinearGradient>
      <Text style={styles.label}>Receive</Text>
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'meta' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('meta')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'meta' && styles.activeTabText,
              ]}
            >
              Stealth Meta Address
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'stealth' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('stealth')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'stealth' && styles.activeTabText,
              ]}
            >
              Stealth Address
            </Text>
          </TouchableOpacity>
        </View>
        {selectedTab === 'meta' ? (
          <View style={styles.addressContainer}>
            <Text style={styles.address}>
              {formatStealthMetaAddress(stealthMetaAddress || '')}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(stealthMetaAddress || '')}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressContainer}>
            <Text style={styles.address}>{stealthAddress}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(stealthAddress || '')}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <LinearGradient
        colors={['#4ca1af', '#007AFF']}
        style={styles.balanceContainer}
      >
        <Text style={styles.balanceText}>Balance</Text>
        <Text style={styles.balanceAmount}>400 USDC</Text>
      </LinearGradient>
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => clearWallet().then(() => router.replace('/'))}
      >
        <Text style={styles.clearButtonText}>Reset keys</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.successButton}
        onPress={() =>
          transferUsdc(
            stealthAddress as `0x${string}`,
            1,
            privateKey as `0x${string}`,
          )
            .then(console.log)
            .catch(console.log)
        }
      >
        <Text style={styles.clearButtonText}>Transfer to stealh Address</Text>
      </TouchableOpacity>

      <Text style={styles.activitiesLabel}>Activities</Text>
      <FlatList
        data={activitiesData}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F3F3', // light background color
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  receiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF', // Border color
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#E3F2FD', // Light blue background
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  copyButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#007AFF', // Button color
  },
  copyButtonText: {
    color: '#FFFFFF',
  },
  balanceContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor:
      'linear-gradient(90deg, rgba(23,115,250,1) 0%, rgba(250,181,181,1) 35%)',
    color: '#FFFFFF',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  activitiesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  activityContainer: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
    padding: 15,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  received: {
    color: 'green',
  },
  sent: {
    color: 'red',
  },
  token: {
    fontSize: 14,
    color: '#777',
  },
  details: {
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
  },
  resetButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  successButton: {
    backgroundColor: '#4CAF50',
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    borderRadius: 0,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#FFF',
    fontSize: 12,
  },
  activeTabText: {
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    padding: 4,
  },
  text: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  balanceCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  mainWalletbalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default HomeScreen
