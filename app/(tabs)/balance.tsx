import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { getUsdcBalance, getUserBalance } from '@/libs/viem'

const CheckStealthBalance = () => {
  const [stealthAddress, setStealthAddress] = useState<`0x${string}`>()
  const [balance, setBalance] = useState<{ eth?: string; usdc?: string }>({})

  const handleCheckBalance = async () => {
    try {
       if (!stealthAddress) throw 'stealthAddress is required'
       const eth = await getUserBalance(stealthAddress) 
       const usdc = await getUsdcBalance(stealthAddress) 
        const result = {
          eth: `${eth} ETH`,
          usdc: `${usdc} USDC`,
        }
      setBalance(result)
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch balance. Please check the address.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Check Stealth Address Balance</Text>

      {/* Input for Stealth Address */}
      <View style={styles.inputContainer}>
        <Ionicons name="wallet-outline" size={20} color="#555" />
        <TextInput
          placeholder="Enter Stealth Address"
          style={styles.input}
          value={stealthAddress}
          onChangeText={setStealthAddress}
        />
      </View>

      {/* Balance Display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance:</Text>
        <Text style={styles.balanceText}>{balance.eth || '--'}</Text>
        <Text style={styles.balanceText}>{balance.usdc || '--'}</Text>
      </View>

      {/* Check Balance Button */}
      <TouchableOpacity style={styles.button} onPress={handleCheckBalance}>
        <Text style={styles.buttonText}>Check Balance</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CheckStealthBalance

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f7',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
