import React, { createContext, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  generateStealthMetaAddress,
} from "@/libs/stealth";
import { getUsdcBalance } from "@/libs/viem";

// Define the types
interface StealthMetaAddressContextType {
  spendingPrivateKey: string | null;
  viewingPrivateKey: string | null;
  spendingPublicKey: string | null;
  viewingPublicKey: string | null;
  stealthMetaAddress: string | null;
  retrieveStealthMetaAddress: (privateKey: string, address: string) => Promise<{ stealthMetaAddressAddress: string; privateKey: string } | null>;
  fetchStealthWalletBalance: () => Promise<number>
}

const StealthMetaAddressContext = createContext<StealthMetaAddressContextType | undefined>(undefined);

export const useStealthMetaAddress = (): StealthMetaAddressContextType => {
  const context = useContext(StealthMetaAddressContext);
  if (!context) {
    throw new Error("useStealthMetaAddress must be used within a StealthMetaAddressProvider");
  }
  return context;
};

export const StealthMetaAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string | null>(null);
  const [spendingPrivateKey, setSpendingPrivateKey] = useState<string | null>(null);
  const [viewingPrivateKey, setViewingPrivateKey] = useState<string | null>(null);
  const [spendingPublicKey, setSpendingPublicKey] = useState<string | null>(null);
  const [viewingPublicKey, setViewingPublicKey] = useState<string | null>(null);

  // Retrieve StealthMetaAddress credentials from SecureStore
  const retrieveStealthMetaAddress = async (privateKey: string, address: string): Promise<{ stealthMetaAddressAddress: string; privateKey: string } | null> => {
    try {
      const getMetaAddress = await generateStealthMetaAddress({
        userPrivateKey: privateKey as `0x${string}`,
        userPin: "1234",
        userAddress: address,
      });

      setStealthMetaAddress(getMetaAddress.stealthMetaAddress);
      setSpendingPrivateKey(getMetaAddress.spendingPrivateKey);
      setViewingPrivateKey(getMetaAddress.viewingPrivateKey);
      setSpendingPublicKey(getMetaAddress.spendingPublicKey);
      setViewingPublicKey(getMetaAddress.viewingPublicKey);
      // Set additional keys as needed
    } catch (error) {
      console.error("Error retrieving StealthMetaAddress", error);
    }
    return null;
  }

  const fetchStealthWalletBalance = async () => {
    const stealthAddresses = [
      {
        address: '0x1cF5559B49Ce06F81c1e2C1633833b60e090C04C',
        ephermalPubKey: '0x'
      },
      {
        address: '0xe8af41abe02c04d40a258729637e5a7c2a6e9d2d',
        ephermalPubKey: '0x'
      },
      {
        address: '0xa19b49d2783c22d106ae5b551782b21e096c5be8',
        ephermalPubKey: '0x'
      },
      {
        address: '0xb526f85a1987990a828429b9f1624ef4f7f43863',
        ephermalPubKey: '0x'
      }
    ]

    const balances = await Promise.all(stealthAddresses.map(annoucement => getUsdcBalance(annoucement.address as `0x${string}`)))
    
    const countBalances = balances.reduce((crr, ac) => crr + ac , 0)
    console.log(countBalances, 'sss')
    return countBalances
  }

  return (
    <StealthMetaAddressContext.Provider
      value={{
        spendingPrivateKey,
        viewingPrivateKey,
        spendingPublicKey,
        viewingPublicKey,
        stealthMetaAddress,
        retrieveStealthMetaAddress,
        fetchStealthWalletBalance,
      }}
    >
      {children}
    </StealthMetaAddressContext.Provider>
  );
};
