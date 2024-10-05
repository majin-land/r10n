import React, { useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { createUserWalletEthers } from "@/libs/create-wallet-ethers";
import { View, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRouter } from 'expo-router';
import { useStealthMetaAddress } from "@/context/StealthMetaAddress";

const WalletScreen: React.FC = () => {
  const { walletAddress, privateKey, storeWallet, retrieveWallet, clearWallet, bib32RootKey } = useWallet();
  const { retrieveStealthMetaAddress } = useStealthMetaAddress()
  const router = useRouter(); 

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleCreateWallet = async () => {
    // Check if a wallet already exists
    const existingWallet = await retrieveWallet();

    // If a wallet exists, use its details
    if (existingWallet) {
      const { walletAddress, privateKey } = existingWallet;
      await retrieveStealthMetaAddress(privateKey, walletAddress);
      router.replace('/home');
      return;
    }
  
    // Otherwise, create a new wallet
    const createNewWallet = async () => {
      const result = await createUserWalletEthers();
      const { address, privateKey } = result.accounts[0];
      const bip32RootKey = result.bip32RootKey;
  
      await storeWallet(address, privateKey, bip32RootKey);
      return { address, privateKey };
    };
    
    // Create the new wallet and proceed with its details
    const { address: newAddress, privateKey: newPrivateKey } = await createNewWallet();
    await retrieveStealthMetaAddress(newPrivateKey, newAddress);
  
    router.replace('/home');
  };

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
          <TouchableOpacity style={styles.connectButton} onPress={handleCreateWallet}>
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  walletInfo: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  connectContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  connectMessage: {
    fontSize: 18,
    fontWeight: "500",
    color: "#888",
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
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
});

export default WalletScreen;
