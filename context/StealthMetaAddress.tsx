import React, { createContext, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  generateStealthMetaAddress,
} from "@/libs/stealth";

// Define the types
interface StealthMetaAddressContextType {
  spendingPrivateKey: string | null;
  viewingPrivateKey: string | null;
  spendingPublicKey: string | null;
  viewingPublicKey: string | null;
  stealthMetaAddress: string | null;
  retrieveStealthMetaAddress: (privateKey: string, address: string) => Promise<{ stealthMetaAddressAddress: string; privateKey: string } | null>;
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

  return (
    <StealthMetaAddressContext.Provider
      value={{
        spendingPrivateKey,
        viewingPrivateKey,
        spendingPublicKey,
        viewingPublicKey,
        stealthMetaAddress,
        retrieveStealthMetaAddress,
      }}
    >
      {children}
    </StealthMetaAddressContext.Provider>
  );
};
