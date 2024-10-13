import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const activitiesData = [
  { id: '1', date: 'October 1, 2024', amount: '400', type: 'received', token: 'USDC' },
  { id: '2', date: 'October 1, 2024', amount: '200', type: 'sent', token: 'USDC' },
  { id: '3', date: 'October 1, 2024', amount: '100', type: 'received', token: 'USDC' },
];

const ActivityScreen: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
      <Text style={styles.header}>Activities</Text>
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
    backgroundColor: '#F9F9F9',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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

export default ActivityScreen;
