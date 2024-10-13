import axios from 'axios'

const apiKey = process.env.CIRCLE_API_KEY || 'TEST_API_KEY:10ba590f1839978055613392357b02af:dd79b03368110532dcb31289ffb2ea5d'
const baseURL = 'https://api.circle.com'

const circleClient = axios.create({
    baseURL,
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    }
})

export async function pingCircleAPI() {
  try {
      const response = await circleClient.get('/ping')
      return response.data
  } catch (error) {
      console.error("Failed to ping Circle API:", error)
      throw error
  }
}

export async function createWallet(userId: string) {
  try {
      const response = await circleClient.post('/wallets', {
          idempotencyKey: userId,
          description: `Wallet for user ${userId}`,
      })
      return response.data
  } catch (error) {
      console.error("Failed to create wallet:", error)
      throw error
  }
}

export async function transferFunds(senderWalletId: string, recipientAddress: string, amount: string, currency: string) {
  try {
    const response = await circleClient.post('/transfers', {
        source: { type: 'wallet', id: senderWalletId },
        destination: { type: 'blockchain', address: recipientAddress, chain: 'ETH' },
        amount: { amount, currency },
        idempotencyKey: `transfer-${Date.now()}`,
    })
    return response.data
  } catch (error) {
    console.error("Failed to transfer funds:", error)
    throw error
  }
}

export async function payGasFee(transactionId: string) {
  try {
      const response = await circleClient.post(`/transactions/${transactionId}/pay`, {
          idempotencyKey: `paygas-${Date.now()}`
      })
      return response.data
  } catch (error) {
      console.error("Failed to pay gas fee:", error)
      throw error
  }
}

export async function createUser(userId: string) {
  try {
      const response = await circleClient.post('/v1/w3s/users', {
          userId: userId
      })
      return response.data
  } catch (error) {
      console.error("Failed to create user:", error)
      throw error
  }
}

export async function acquireUserToken(userId: string) {
  try {
      const response = await circleClient.post('/v1/w3s/users/token', {
          userId: userId
      })
      return response.data
  } catch (error) {
      console.error("Failed to acquire user token:", error)
      throw error
  }
}


export async function initializeUserAccount(userToken: string, accountType: string, blockchains: string[]) {
  try {
      const idempotencyKey = `initialize-${Date.now()}` 
      const response = await circleClient.post('/v1/w3s/user/initialize', {
          idempotencyKey: idempotencyKey,
          accountType: accountType,
          blockchains: blockchains 
      }, {
          headers: {
              'X-User-Token': userToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Headers': '*'
          }
      })

      return response.data
  } catch (error) {
      console.error("Failed to initialize user account:", error)
      throw error
  }
}

export default circleClient
