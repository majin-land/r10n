import { Buffer } from "buffer";

// Ensure Buffer is globally available
global.Buffer = Buffer;

import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { generateStealthSafeAccount } from "@/libs/stealth";

export default function App() {
  const privateKey = process.env.EXPO_PUBLIC_PRIVATE_KEY || "";
  const address = process.env.EXPO_PUBLIC_ADDRESS || "";

  const [results, setResults] = useState<any>([]);

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
      {/* {results.length > 0 && (
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
      )} */}
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
