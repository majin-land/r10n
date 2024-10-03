import { createUserWalletEthers } from "@/libs/create-wallet-ethers"
import { listenEvent } from "@/libs/stealth-address-registry-contract"
import React, { useCallback, useEffect, useState } from "react"
import { Button, View, Text } from "react-native"

const CreateWallet = () => {
  const [rootPrivateKey, setRootPrivateKey] = useState('')
  const [userWalletAddress, setUsereWalletAddress] = useState('')
  const [userWalletAddressPk, setUsereWalletAddressPk] = useState('')

  const createUserWallet = useCallback(async () => {
    const result = await createUserWalletEthers()
    console.log(result)
    setUsereWalletAddress(result.accounts[0].address)
    setUsereWalletAddressPk(result.accounts[0].privateKey)
    setRootPrivateKey(result.bip32RootKey)
  }, [])

  useEffect(() => {
    listenEvent()
  }, [])

  return (
    <View>
      <View>
        <Text>
          rootPrivateKey: 
        </Text>
        <Text>
          {rootPrivateKey} 
        </Text>
        <Text>
          userWalletAddress: 
        </Text>
        <Text>
          {userWalletAddress} 
        </Text>
        <Text>
          userWalletAddressPk: 
        </Text>
        <Text>
          {userWalletAddressPk} 
        </Text>
      </View>
      <Button
        title="Create wallet"
        onPress={createUserWallet}
      />
    </View>
  )
}

export default CreateWallet
