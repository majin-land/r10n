import { Buffer } from "buffer";

// Ensure Buffer is globally available
global.Buffer = Buffer;

import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { generateStealthSafeAccount } from "@/libs/stealth";
import { privateKeyToAccount } from "viem/accounts";
import {
  generateFluidkeyMessage,
  generateKeysFromSignature,
} from "@fluidkey/stealth-account-kit";
// import {
//   generateStealthInfo,
//   generateStealthMetaAddress,
// } from "@/libs/generate-meta-stealth-address";
import {
  generateStealthMetaAddress,
  generateStealthInfo,
  generateStealthPrivate,
} from "@/libs/stealth";

type SafeAccountResult = Awaited<ReturnType<typeof generateStealthSafeAccount>>;
type GenerateStealthInfoResult = Awaited<
  ReturnType<typeof generateStealthInfo>
>;
type GenerateStealthPrivate = Awaited<
  ReturnType<typeof generateStealthPrivate>
>;

const privateKey = process.env.EXPO_PUBLIC_PRIVATE_KEY || "";
const address = process.env.EXPO_PUBLIC_ADDRESS || "";

// 1- Bob generates and keeps secret a spending keys
// 2- secret spending key digunakan untuk generate stealth meta-address
// 3- memberika stealth meta-address ke Alice
// 4- Alice melakukan komputasi dari stealth meta-address untuk generate stealth address Bob
// 5- Alice bisa melakukan transfer Asset ke Bob menggunakan stealth Addres Bob
// 6- Ketika transfer Alice juga publish some extra cryptograpphy data (ephermal pubkey) di onchain

const generatedSpendingPrivateKey = async ({
  userPrivateKey,
  userPin,
  userAddress,
}: {
  userPrivateKey: `0x${string}`;
  userPin: string;
  userAddress: string;
}) => {
  const account = privateKeyToAccount(userPrivateKey);
  const { message } = generateFluidkeyMessage({
    pin: userPin,
    address: userAddress,
  });
  const signature = await account.signMessage({
    message,
  });

  // Generate the private keys from the signature
  const { spendingPrivateKey, viewingPrivateKey } =
    generateKeysFromSignature(signature);

  console.log(spendingPrivateKey, viewingPrivateKey);
  return spendingPrivateKey;
};

export default function App() {
  const [results, setResults] = useState<SafeAccountResult>([]);
  const [results2, setResults2] = useState<GenerateStealthInfoResult>();
  const [stealthPrivate, setStealthPrivate] =
    useState<GenerateStealthPrivate>();

  const handleGenerateStealthSafe = async () => {
    try {
      const generatedResults = await generateStealthSafeAccount({
        userPrivateKey: `0x${privateKey}`,
        userPin: "1234",
        userAddress: address,
      });
      setResults(generatedResults);
      console.log(results, "RESULTSSSSS");
    } catch (error) {
      console.error("Error generating stealth safe:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stealth Safe Account Generator</Text>
      <Button
        title="Generate Stealth Safe"
        onPress={handleGenerateStealthSafe}
      />
      {results.length > 0 && (
        <View>
          <Text style={styles.label}>Generated Stealth Safes:</Text>
          {results.map((resultSet, index) => (
            <View key={index}>
              {resultSet.map((result: any, subIndex: number) => (
                <Text key={subIndex}>
                  Nonce: {result.nonce.toString()}, Address:{" "}
                  {result.stealthSafeAddress}, Private Key:{" "}
                  {result.stealthPrivateKey}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
      <View>
        <Text>Bob Generate Spending Root Key</Text>
      </View>
      <Button
        title="Generate Root Spending key"
        onPress={() => {
          generatedSpendingPrivateKey({
            userPrivateKey: `0x${privateKey}`,
            userPin: "1234",
            userAddress: address,
          });
        }}
      />
      <View>
        <Text>Bob Get Stealth meta-address</Text>
      </View>
      <Button
        title="Get stealth meta-addres"
        onPress={async () => {
          const getMetaAddress = await generateStealthMetaAddress({
            userPrivateKey: `0x${privateKey}`,
            userPin: "1234",
            userAddress: address,
          });
          console.log(getMetaAddress, "getMetaAddres");
          const stealthInfo = await generateStealthInfo(
            getMetaAddress.stealthMetaAddress as `st:eth:0x${string}`
          );
          const stealthPrivate = await generateStealthPrivate({
            userPrivateKey: `0x${privateKey}`,
            userPin: "1234",
            userAddress: address,
            ephemeralPublicKey: stealthInfo.ephemeralPublicKey,
          });
          setResults2(stealthInfo);
          setStealthPrivate(stealthPrivate);
        }}
      />
      <View>
        <Text>Stealth Meta Address: {results2?.stealthMetaAddress}</Text>
        <Text>Stealth Address: {results2?.stealthAddress}</Text>
        <Text>Ephemeral Public Key: {results2?.ephemeralPublicKey}</Text>
        <Text>Metadata: {results2?.metadata}</Text>
        <Text>Stealth Private Key: {stealthPrivate?.stealthPrivateKey}</Text>
        <Text>
          Stealth Private Public Address: {stealthPrivate?.stealthAddress}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    marginTop: 10,
  },
});
