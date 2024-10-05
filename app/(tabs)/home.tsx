import { useStealthMetaAddress } from '@/context/StealthMetaAddress';
import { formatStealthMetaAddress } from '@/utils/helper';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useQuery } from '@apollo/client';
import { GET_STEALTH_META_ADDRESS_SETS } from '@/apollo/queries/stealthMetaAddressSets';
import { GET_ANNOUNCEMENTS } from '@/apollo/queries/announcements';

// Updated activities data
const activitiesData = [
  { id: '1', date: 'October 1, 2024', amount: '400', type: 'received', token: 'USDC' },
  { id: '2', date: 'October 1, 2024', amount: '200', type: 'sent', token: 'USDC' },
  { id: '3', date: 'October 1, 2024', amount: '100', type: 'received', token: 'USDC' },
];

const HomeScreen: React.FC = () => {
  const { stealthMetaAddress } = useStealthMetaAddress();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_STEALTH_META_ADDRESS_SETS, {
    variables: {}
  })

  const { data: a,  } = useQuery(GET_ANNOUNCEMENTS, {
    variables: {}
  })

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(stealthMetaAddress as string);
    Alert.alert("Copied to Clipboard", "Your address has been copied to the clipboard.");
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // if (loading) return <Text>Loading...</Text>;
  // if (error) return <Text>Error: {error.message}</Text>;

  console.log('Registry --', data)
  console.log('Announce --', a)

  const renderActivity = ({ item }: { item: typeof activitiesData[0] }) => (
    <View style={styles.activityContainer}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.activityHeader}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={[styles.amount, item.type === 'sent' ? styles.sent : styles.received]}>
          {item.amount} <Text style={styles.token}>{item.token}</Text>
        </Text>
      </TouchableOpacity>
      {expandedId === item.id && (
        <View style={styles.details}>
          <Text style={styles.detailsText}>
            {item.type === 'sent' ? 'You sent' : 'You received'} {item.amount} {item.token}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>R1ON</Text>
      <Text style={styles.label}>Receive</Text>
      <View style={styles.receiveContainer}>
        <Text style={styles.address}>{formatStealthMetaAddress(stealthMetaAddress as string)}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.copyButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Balance</Text>
        <Text style={styles.balanceAmount}>400 USDC</Text>
      </View>

      <Text style={styles.activitiesLabel}>Activities</Text>
      <FlatList
        data={activitiesData}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9', // light background color
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
    backgroundColor: 'linear-gradient(90deg, rgba(23,115,250,1) 0%, rgba(250,181,181,1) 35%)',
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
});

export default HomeScreen;
