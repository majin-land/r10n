import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
// import * as Crypto from "expo-crypto";

interface WalletContextType {
  walletAddress: string | null;
  privateKey: string | null;
  storeWallet: (address: string, privateKey: string, bib32RootKey: string) => Promise<void>;
  retrieveWallet: () => Promise<{ walletAddress: string; privateKey: string } | null>;
  clearWallet: () => Promise<void>;
  bib32RootKey: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [bib32RootKey, setBib32RootKey] = useState<string | null>(null);

  // Encrypt private key before storing
  // const encryptPrivateKey = (privateKey: string): string => {
  //   return CryptoJS.AES.encrypt(privateKey, secretKey).toString();
  // };

  // const hashPrivateKey = async (privateKey: string): Promise<string> => {
  //   const hashedKey = await Crypto.digestStringAsync(
  //     Crypto.CryptoDigestAlgorithm.SHA256,
  //     privateKey + secretKey
  //   );
  //   return hashedKey;
  // };

  // Decrypt private key when retrieving
  // const decryptPrivateKey = (cipherText: string): string => {
  //   const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  //   return bytes.toString(CryptoJS.enc.Utf8);
  // };

  // Save wallet credentials locally and to Supabase
  const storeWallet = async (address: string, privateKey: string, bib32RootKey: string): Promise<void> => {
    try {
      // const encryptedKey = encryptPrivateKey(privateKey);
      // const hashedKey = await hashPrivateKey(privateKey);


      await SecureStore.setItemAsync("walletAddress", address);
      await SecureStore.setItemAsync("privateKey", privateKey);
      await SecureStore.setItemAsync("bib32RootKey", bib32RootKey);

      setWalletAddress(address);
      setPrivateKey(privateKey);
      setBib32RootKey(bib32RootKey);

    } catch (error) {
      console.error("Error storing wallet", error);
    }
  };

  // Retrieve wallet credentials from SecureStore or Supabase
  const retrieveWallet = async (): Promise<{ walletAddress: string; privateKey: string; bib32RootKey: string } | null> => {
    try {
      const storedAddress = await SecureStore.getItemAsync("walletAddress");
      const storedPrivateKey = await SecureStore.getItemAsync("privateKey");
      const storedBib32RootKey = await SecureStore.getItemAsync("bib32RootKey");

      if (storedAddress && storedPrivateKey && storedBib32RootKey) {
        // Decrypt the private key
        // const decryptedKey = decryptPrivateKey(storedPrivateKey);

        setWalletAddress(storedAddress);
        setPrivateKey(storedPrivateKey);
        setBib32RootKey(storedPrivateKey);
        return { walletAddress: storedAddress, privateKey: storedPrivateKey, bib32RootKey: storedBib32RootKey };
      }

    } catch (error) {
      console.error("Error retrieving wallet", error);
    }
    return null;
  }

  const clearWallet = async (): Promise<void> => {
    try {
      // await SecureStore.deleteItemAsync("walletAddress");
      // await SecureStore.deleteItemAsync("privateKey");

      setWalletAddress(null);
      setPrivateKey(null);
    } catch (error) {
      console.error("Error clearing wallet", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        privateKey,
        storeWallet,
        retrieveWallet,
        clearWallet,
        bib32RootKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
