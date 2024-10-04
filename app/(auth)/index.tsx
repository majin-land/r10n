import 'react-native-get-random-values'

import { createUserWalletEthers } from "@/libs/create-wallet-ethers"
import React, { useCallback, useEffect, useState } from "react"
import { Button, View, Text, StyleSheet, Alert } from "react-native"
import * as SecureStore from 'expo-secure-store'

const CreateWallet = () => {
  const [rootPrivateKey, setRootPrivateKey] = useState('')
  const [userWalletAddress, setUserWalletAddress] = useState('')
  const [userWalletAddressPk, setUserWalletAddressPk] = useState('')
  const [isWalletCreated, setIsWalletCreated] = useState(false)

  // Function to store wallet in SecureStore
  const storeWalletInSecureStore = async (address: string, privateKey: string) => {
    try {
      await SecureStore.setItemAsync("walletAddress", address)
      await SecureStore.setItemAsync("walletPrivateKey", privateKey)
      Alert.alert("Success", "Wallet stored securely in Secure Store!")
    } catch (error) {
      console.error("Error storing wallet in Secure Store", error)
      Alert.alert("Error", "Failed to store wallet")
    }
  }

  // Function to retrieve wallet from SecureStore
  const retrieveWalletFromSecureStore = async () => {
    try {
      const address = await SecureStore.getItemAsync("walletAddress")
      const privateKey = await SecureStore.getItemAsync("walletPrivateKey")
      console.log(address, privateKey, 'privateKey')
      if (address && privateKey) {
        // Wallet exists, update state
        setUserWalletAddress(address)
        setUserWalletAddressPk(privateKey)
        setIsWalletCreated(true)
        Alert.alert("Success", "Wallet retrieved from Secure Store")
      } else {
        console.log('No wallet stored, creating a new wallet...')
        await createUserWallet()
      }
    } catch (error) {
      console.error("Error retrieving wallet from Secure Store", error)
      Alert.alert("Error", "Failed to retrieve wallet")
    }
  }

  // Function to create a new wallet
  const createUserWallet = useCallback(async () => {
    try {
      const result = await createUserWalletEthers()
      const address = result.accounts[0].address
      const privateKey = result.accounts[0].privateKey
      const bip32RootKey = result.bip32RootKey

      setUserWalletAddress(address)
      setUserWalletAddressPk(privateKey)
      setRootPrivateKey(bip32RootKey)
      setIsWalletCreated(true)

      // Store the wallet credentials in SecureStore
      await storeWalletInSecureStore(address, privateKey)
    } catch (error) {
      console.error("Error creating wallet", error)
      Alert.alert("Error", "Failed to create wallet")
    }
  }, [])

  useEffect(() => {
    // Check if wallet exists in SecureStore when the component mounts
    retrieveWalletFromSecureStore()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Wallet</Text>
      
      <Button
        title={isWalletCreated ? "Wallet Exists" : "Create Wallet"}
        onPress={isWalletCreated ? () => {} : createUserWallet}
        disabled={isWalletCreated}
      />

      {isWalletCreated && (
        <View style={styles.walletInfo}>
          <Text style={styles.label}>Wallet Address:</Text>
          <Text style={styles.value}>{userWalletAddress}</Text>

          <Text style={styles.label}>Private Key:</Text>
          <Text style={styles.value}>{userWalletAddressPk}</Text>

          <Text style={styles.label}>Root Private Key:</Text>
          <Text style={styles.value}>{rootPrivateKey}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  walletInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
    marginVertical: 5,
  },
})

export default CreateWallet
