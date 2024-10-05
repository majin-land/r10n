import 'react-native-get-random-values'

import { useStealthMetaAddress } from '@/context/StealthMetaAddress'
import { formatStealthAddress, formatStealthMetaAddress } from '@/utils/helper'
import React, { useEffect, useState } from 'react'
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
  const { stealthMetaAddress, spendingPublicKey, viewingPublicKey } = useStealthMetaAddress()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [stealthAddress, setStealthAddress] = useState<`0x${string}` | null>(
    null,
  )
  const [selectedTab, setSelectedTab] = useState<'meta' | 'stealth'>('meta');

  const router = useRouter(); 

  const { data, loading, error } = useQuery(GET_STEALTH_META_ADDRESS_SETS, {
    variables: {},
  })

  const { data: a } = useQuery(GET_ANNOUNCEMENTS, {
    variables: {},
  })

  // console.log('announcements', a)
  // console.log('registry', data)

  const copyToClipboard = async (address: string) => {
    await Clipboard.setStringAsync(address);
    alert('Copied to Clipboard');
  };

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
      const err = error instanceof Error ? JSON.parse(JSON.stringify(error)) : String(error)
      console.error(err)
    }
  }

  useEffect(() => {
    generateInitialStealthAddress()
  }, [])

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
      <Text style={styles.label}>Receive</Text>
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'meta' && styles.activeTab]}
            onPress={() => setSelectedTab('meta')}
          >
            <Text style={[styles.tabText, selectedTab === 'meta' && styles.activeTabText]}>Meta Address</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'stealth' && styles.activeTab]}
            onPress={() => setSelectedTab('stealth')}
          >
            <Text style={[styles.tabText, selectedTab === 'stealth' && styles.activeTabText]}>Stealth Address</Text>
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

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Balance</Text>
        <Text style={styles.balanceAmount}>400 USDC</Text>
      </View>
      <TouchableOpacity style={styles.clearButton} onPress={() => clearWallet().then(() => router.replace('/'))}>
        <Text style={styles.clearButtonText}>Reset keys</Text>
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
    marginBottom: 16
  },
  clearButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
    textAlign: "center",
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
    fontSize: 14,
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
    padding: 4
  }
})

export default HomeScreen
