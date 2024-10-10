import React from "react"
import { Button, View } from "react-native"

const CreateWallet = () => {
    return (
      <View>
        <Button
          title="Create wallet"
          onPress={() => {
            console.log('Create Wallet')
          }}
        />
      </View>
    )
}

export default CreateWallet
