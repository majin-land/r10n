import { createUserWalletEthers } from "@/libs/create-wallet-ethers"
import React, { useCallback, useEffect, useState } from "react"
import { Button, View, Text, StyleSheet, Alert } from "react-native"
import * as Keychain from 'react-native-keychain'

const CreateWallet = () => {
  const [rootPrivateKey, setRootPrivateKey] = useState('')
  const [userWalletAddress, setUserWalletAddress] = useState('')
  const [userWalletAddressPk, setUserWalletAddressPk] = useState('')
  const [isWalletCreated, setIsWalletCreated] = useState(false)

  const storeWalletInKeychain = async (address, privateKey) => {
    try {
      await Keychain.setGenericPassword(address, privateKey, {
        service: "wallet",
      });
      Alert.alert("Success", "Wallet stored securely in Keychain!")
    } catch (error) {
      console.error("Error storing wallet in Keychain", error)
      Alert.alert("Error", "Failed to store wallet")
    }
  }

  const retrieveWalletFromKeychain = async () => {
    try {
      console.log('---------')

      const credentials = await Keychain.hasGenericPassword()
      // const credentials = await Keychain.getGenericPassword({ service: "wallet" })
      console.log(credentials, 'credentials')
      if (credentials) {
        // Wallet exists, update state
        setUserWalletAddress(credentials.username)
        setUserWalletAddressPk(credentials.password)
        setIsWalletCreated(true)
        Alert.alert("Success", "Wallet retrieved from Keychain")
      } else {
        console.log('No credentials stored, creating a new wallet...')
        await createUserWallet()
      }
    } catch (error) {
      console.error("Error retrieving wallet from Keychain", error)
      Alert.alert("Error", "Failed to retrieve wallet")
    }
  }

  const createUserWallet = useCallback(async () => {
    try {
      const result = await createUserWalletEthers()
      console.log(result)
      const address = result.accounts[0].address
      const privateKey = result.accounts[0].privateKey
      const bip32RootKey = result.bip32RootKey

      setUserWalletAddress(address)
      setUserWalletAddressPk(privateKey)
      setRootPrivateKey(bip32RootKey)
      setIsWalletCreated(true)

      // Store the wallet credentials in Keychain
      await storeWalletInKeychain(address, privateKey)
    } catch (error) {
      console.error("Error creating wallet", error)
      Alert.alert("Error", "Failed to create wallet")
    }
  }, [])

  useEffect(() => {
    // Check if wallet exists in keychain when the component mounts
    retrieveWalletFromKeychain()
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
