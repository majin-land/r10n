import { Buffer } from "buffer"

// Ensure Buffer is globally available
global.Buffer = Buffer

import React, { useState } from "react"
import { View, Text, Button, StyleSheet } from "react-native"
import { generateStealthSafeAccount } from "@/libs/stealth"
import { privateKeyToAccount } from "viem/accounts"
import { generateFluidkeyMessage, generateKeysFromSignature } from "@fluidkey/stealth-account-kit"
import { generateStealthInfo, generateStealthMetaAddress } from "@/libs/generate-meta-stealth-address"

type SafeAccountResult = Awaited<ReturnType<typeof generateStealthSafeAccount>>

const privateKey = process.env.EXPO_PUBLIC_PRIVATE_KEY || ""
const address = process.env.EXPO_PUBLIC_ADDRESS || ""

// 1- Bob generates and keeps secret a spending keys
// 2- secret spending key digunakan untuk generate stealth meta-address
// 3- memberika stealth meta-address ke Alice
// 4- Alice melakukan komputasi dari stealth meta-address untuk generate stealth address Bob
// 5- Alice bisa melakukan transfer Asset ke Bob menggunakan stealth Addres Bob
// 6- Ketika transfer Alice juga publish some extra cryptograpphy data (ephermal pubkey) di onchain

const generatedSpendingPrivateKey = async ({ userPrivateKey, userPin, userAddress }: { userPrivateKey: `0x${string}`, userPin: string; userAddress: string } ) => {
  const account = privateKeyToAccount(userPrivateKey)
  const { message } = generateFluidkeyMessage({
    pin: userPin,
    address: userAddress,
  })
  const signature = await account.signMessage({
    message,
  })

  // Generate the private keys from the signature
  const { spendingPrivateKey, viewingPrivateKey } =
    generateKeysFromSignature(signature)


    console.log(spendingPrivateKey, viewingPrivateKey)
  return spendingPrivateKey
}


export default function App() {

  const [results, setResults] = useState<SafeAccountResult>([])
  const [results2, setResults2] = useState<{
    metaStealthAddress: `st:eth:0x${string}`;
    stealthAddress: string;
    ephemeralPublicKey: string;
    ViewTag: string;
  }>()

  const handleGenerateStealthSafe = async () => {
    try {
      const generatedResults = await generateStealthSafeAccount({
        userPrivateKey: `0x${privateKey}`,
        userPin: "1234",
        userAddress: address,
      })
      setResults(generatedResults)
      console.log(results, "RESULTSSSSS")
    } catch (error) {
      console.error("Error generating stealth safe:", error)
    }
  }

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
        <Text>
          Bob Generate Spending Root Key
        </Text>
      </View>
      <Button
        title="Generate Root Spending key"
        onPress={() => {
          generatedSpendingPrivateKey({
            userPrivateKey: `0x${privateKey}`,
            userPin: "1234",
            userAddress: address,
          })
        }}
      />
      <View>
        Bob Get Stealth meta-address
      </View>
      <Button 
        title="Get stealth meta-addres"
        onPress={() => {
          const getMetaAddress = generateStealthMetaAddress()
          console.log(getMetaAddress, 'getMetaAddres')
          const stealthInfo = generateStealthInfo(getMetaAddress[4])
          setResults2({
            metaStealthAddress: getMetaAddress[4],
            ...stealthInfo,
          })
        }}
      />
      <View>
        <Text>
          {results2?.metaStealthAddress}
        </Text>
        <Text>
          {results2?.stealthAddress}
        </Text>
        <Text>
          {results2?.ephemeralPublicKey}
        </Text>
      </View>
    </View>
  )
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
})
