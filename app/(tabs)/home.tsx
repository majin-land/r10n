import 'react-native-get-random-values'

import { useStealthMetaAddress } from '@/context/StealthMetaAddress'
import {
  formatDate,
  formatStealthMetaAddress,
  getTokenSymbol,
  sortActivitiesByDateDesc,
} from '@/utils/helper'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
  ActivityIndicator,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { useQuery } from '@apollo/client'
import { GET_STEALTH_META_ADDRESS_SETS } from '@/apollo/queries/stealthMetaAddressSets'
import { generateStealthInfo } from '@/libs/stealth'
import { useWallet } from '@/context/WalletContext'
import { useRouter } from 'expo-router'
import {
  client,
  getUsdcBalance,
  getUserBalance,
  transferUsdc,
} from '@/libs/viem'
import { decodeEventLog, erc20Abi, formatEther, parseAbiItem } from 'viem'
import { LinearGradient } from 'expo-linear-gradient'
import { Hex } from 'viem'
import { SafeAreaView } from 'react-native-safe-area-context'

import { watchAnnouncements } from '@/contracts'
import { useAnnouncements } from '@/context/AnnouncementContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useERC20Transfers from '@/hooks/useERC20Transfers'

import { usdcTokenAddress } from '@/config/smart-contract-address'
import {
  ACTIVITY_STEALTH_ADDRESS,
  USER_STEALTH_ADDRESS_ACTIVED,
  USER_STEALTH_ADDRESS_COLLECTIONS,
} from '@/config/storage-key'
import { Activity, StealthInfo } from '@/interface'

// Updated activities data

const HomeScreen: React.FC = () => {
  const { privateKey, walletAddress, clearWallet } = useWallet()
  const {
    stealthMetaAddress,
    spendingPublicKey,
    viewingPublicKey,
    spendingPrivateKey,
    fetchStealthWalletBalance,
  } = useStealthMetaAddress()
  const { announcements } = useAnnouncements()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [stealthAddress, setStealthAddress] = useState<`0x${string}` | null>(
    null,
  )
  const [initialLoading, setInitialLoading] = useState(false)
  const [stealthAddresses, setStealthAddresses] = useState<StealthInfo[] | []>(
    [],
  )

  const { transfers, loading } = useERC20Transfers(stealthAddress)

  // const { loading, transfers } = useERC20Transfers(stealthAddress)
  // console.log(transfers, 'transfers', stealthAddress)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mainBalance, setMainBalance] = useState<string>()
  const [mainBalanceUsdc, setMainBalanceUsdc] = useState<string>()
  const [activities, setActivities] = useState<Activity[]>([])

  const [userBalanceUsdc, setUserBalanceUsdc] = useState<string>()

  const [selectedTab, setSelectedTab] = useState<'meta' | 'stealth'>('meta')
  const router = useRouter()

  const {
    data,
    loading: isFetchStealthAddress,
    error,
  } = useQuery(GET_STEALTH_META_ADDRESS_SETS, {
    variables: {},
  })

  const fetchMainBalance = async () => {
    try {
      const userBalance = await getUserBalance(walletAddress as `0x${string}`)

      const usdcBalance = await getUsdcBalance(walletAddress as `0x${string}`)
      const stealthWalletbalance = await fetchStealthWalletBalance()

      setUserBalanceUsdc(String(stealthWalletbalance))

      setMainBalanceUsdc(String(usdcBalance))
      setMainBalance(formatEther(userBalance))
    } catch (error) {
      console.log('error:', error)
    }
  }

  const copyToClipboard = async (address: string) => {
    await Clipboard.setStringAsync(address)
    Alert.alert('Copied to Clipboard')
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const generateInitialStealthAddress = async () => {
    try {
      // Get the user stealth address collection from AsyncStorage
      const getUserStealthAddressCollection = await AsyncStorage.getItem(
        USER_STEALTH_ADDRESS_COLLECTIONS,
      )
      const getUserStealthAddress = await AsyncStorage.getItem(
        USER_STEALTH_ADDRESS_ACTIVED,
      )

      // Parse the retrieved string and check if it's a valid array of StealthInfo objects

      const activeStealthAdress: StealthInfo | null = getUserStealthAddress
        ? JSON.parse(getUserStealthAddress)
        : null

      // Check if stealthAdresses is valid and has items
      if (activeStealthAdress) {
        setStealthAddress(activeStealthAdress.stealthAddress)
        return
      }
      // If no stealth addresses, generate new stealthInfo
      const stealthInfo = await generateStealthInfo(
        stealthMetaAddress as `st:base:0x${string}`,
      )

      const stealthAdresses: StealthInfo[] | null =
        getUserStealthAddressCollection
          ? JSON.parse(getUserStealthAddressCollection)
          : null

      // Store new stealthInfo to AsyncStorage
      await AsyncStorage.setItem(
        USER_STEALTH_ADDRESS_COLLECTIONS,
        JSON.stringify([
          ...(stealthAdresses || []),
          { ...stealthInfo, balance: { [usdcTokenAddress]: 0 } },
        ]),
      )

      await AsyncStorage.setItem(
        USER_STEALTH_ADDRESS_ACTIVED,
        JSON.stringify(stealthInfo),
      )

      console.log(stealthInfo, 'USE THIS STEALTH ACCOUNT!!!')

      // Set the first stealth address
      setStealthAddress(stealthInfo.stealthAddress)

      // TODO: Store to storage and publish generated Address
    } catch (error) {
      // Handle the error properly
      const err = error instanceof Error ? error.message : String(error)
      console.error('Error generating stealth address:', err)
    }
  }

  const getActivities = async () => {
    const activities = await AsyncStorage.getItem(ACTIVITY_STEALTH_ADDRESS)
    const _activities: Activity[] = activities ? JSON.parse(activities) : []
    console.log(
      JSON.stringify(
        _activities.map((a) => ({
          txhash: a.txHash,
          amount: a.amount,
          address: a.stealthAddress,
        })),
        null,
        4,
      ),
    )
    setActivities(sortActivitiesByDateDesc(_activities))
  }

  const getStealthCollection = async () => {
    const getUserStealthAddressCollection = await AsyncStorage.getItem(
      USER_STEALTH_ADDRESS_COLLECTIONS,
    )

    const stealthAdresses: StealthInfo[] | [] = getUserStealthAddressCollection
      ? JSON.parse(getUserStealthAddressCollection)
      : []

    setStealthAddresses(stealthAdresses)
  }

  useEffect(() => {
    getStealthCollection()
  }, [])

  useEffect(() => {
    const fetchInitial = async () => {
      setInitialLoading(true)
      try {
        await Promise.all([
          fetchMainBalance(),
          getActivities(),
          generateInitialStealthAddress(),
        ])
      } catch (error) {
        console.warn('Error fetch:', error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchInitial()
  }, [transfers])

  useEffect(() => {
    watchAnnouncements(
      spendingPrivateKey as Hex,
      stealthMetaAddress as `st:base:0x${string}`,
    )
  }, [spendingPrivateKey, stealthMetaAddress])

  useEffect(() => {
    console.log(announcements, 'Current Announcements in Storage!')
  }, [announcements])

  // if (loading) return <Text>Loading...</Text>;
  // if (error) return <Text>Error: {error.message}</Text>;
  if (isFetchStealthAddress) return <Text>Loading ...</Text>

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.activityContainer}>
      <TouchableOpacity
        onPress={() => toggleExpand(item.txHash)}
        style={styles.activityHeader}
      >
        <Text style={styles.date}>{formatDate(item.date || new Date())}</Text>
        <Text
          style={[
            styles.amount,
            item.type === 'd' ? styles.sent : styles.received,
          ]}
        >
          {item.amount}{' '}
          <Text style={styles.token}>{getTokenSymbol(item.token)}</Text>
        </Text>
      </TouchableOpacity>
      {expandedId === item.txHash && (
        <View style={styles.details}>
          <Text style={styles.detailsText}>
            {item.type === 'd' ? 'You sent' : 'You received'} {item.amount}{' '}
            {getTokenSymbol(item.token)} ({item.token})
          </Text>
        </View>
      )}
    </View>
  )

  console.log(stealthAddress, 'stealthAddressstealthAddress')

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      ) : null}
      <FlatList
        data={activities}
        contentContainerStyle={styles.activityListContainer}
        renderItem={renderActivity}
        keyExtractor={(item, index) => item.txHash + item.date}
        refreshing={isRefreshing}
        onRefresh={async () => {
          Promise.all([
            generateInitialStealthAddress(),
            fetchMainBalance(),
            getActivities(),
          ]).then(() => setIsRefreshing(false))
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>R1ON</Text>
            <Text style={styles.label}>Main Wallet</Text>
            <LinearGradient
              colors={['#4ca1af', '#c4e0e5']}
              style={styles.balanceCard}
            >
              <View style={styles.mainWalletbalance}>
                <Text style={styles.balanceText}>{mainBalance || 0} ETH</Text>
                <Text style={styles.balanceText}>
                  {mainBalanceUsdc || 0} USDC
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(walletAddress as `0x${string}`)}
              >
                <Text style={styles.text}>{walletAddress}</Text>
              </TouchableOpacity>
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
              <Text style={styles.balanceAmount}>
                {userBalanceUsdc || 0} USDC
              </Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => clearWallet().then(() => router.replace('/'))}
            >
              <Text style={styles.clearButtonText}>Reset keys</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.successButton, loading && styles.disabledButton]}
              disabled={loading}
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
              <Text style={styles.clearButtonText}>
                Transfer from main to stealh Address
              </Text>
            </TouchableOpacity>
            <Text style={styles.activitiesLabel}>Activities</Text>
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F3F3F3',
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
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  activityListContainer: {
    paddingBottom: 60,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
})

export default HomeScreen
