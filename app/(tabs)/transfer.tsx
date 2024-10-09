import { useStealthMetaAddress } from '@/context/StealthMetaAddress';
import { transferUsdc } from '@/libs/viem';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const TransferScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const {
    stealthMetaAddress,
    spendingPublicKey,
    viewingPublicKey,
    spendingPrivateKey,
    fetchStealthWalletBalance,
  } = useStealthMetaAddress()
  const [userBalanceUsdc, setUserBalanceUsdc] = useState<string>()

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const stealthWalletbalance = await fetchStealthWalletBalance()
      setUserBalanceUsdc(String(stealthWalletbalance))

    }
    fetchWalletBalance()
  }, [])

  const send = useCallback(() => {
    if (toAddress.startsWith("st:base:0x")) {
      // check the stealth address in STEALTH_ADDRESS_COLLECTION
      // check the funds if total same with the amount
      // create the new stealth address for sender
      // send all funds to new stealth address
      // Generate stealth address by receiver stealth meta address
      // the new stealth address will send to receiver stealth address
    } else {
      // check the stealth address in STEALTH_ADDRESS_COLLECTION
      // check the funds if total same with the amount
      // create the new stealth address for sender
      // send all funds to new stealth address
      // the new stealth address will send to receiver stealth address
    }
  }, [toAddress, amount])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transfer</Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceAmount}>{userBalanceUsdc} USDC</Text>
        <Text style={styles.balanceValue}>$ {userBalanceUsdc}.00</Text>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="USDC"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>To</Text>
      <TextInput
        style={styles.input}
        placeholder="Stealth meta address or address"
        value={toAddress}
        onChangeText={setToAddress}
      />

      <TouchableOpacity style={styles.sendButton} onPress={send}>
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9', // Light background color
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#BBDEFB', // Light blue background
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceValue: {
    fontSize: 16,
    color: '#777',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF', // Button color
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransferScreen;
