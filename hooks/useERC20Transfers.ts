import { useEffect, useState } from 'react'
import { createPublicClient, http, erc20Abi } from 'viem'
import { baseSepolia } from 'viem/chains'
import '@ethersproject/shims' // Polyfill for React Native
import AsyncStorage from '@react-native-async-storage/async-storage'

import { ACTIVITY_STEALTH_ADDRESS, USER_STEALTH_ADDRESS_ACTIVED} from '@/config/storage-key'

import { StealthInfo, Activity } from '@/interface'

const USDC_TOKEN_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
const DEFAULT_FROM_BLOCK = 16338834n



const useERC20Transfers = (targetAddress: `0x${string}` | null) => {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
    })

    const getBlockTimestamp = async (blockNumber: bigint) => {
      const block = await client.getBlock({ blockNumber });
      return Number(block.timestamp) * 1000
    }

    const processTransferLogs = async (logs: any[]) => {
      if (logs.length > 0) {
        const activatedStealthAddress = await AsyncStorage.getItem(USER_STEALTH_ADDRESS_ACTIVED)
        const activeStealthAddress: StealthInfo | null = activatedStealthAddress
          ? JSON.parse(activatedStealthAddress)
          : null

        if (activeStealthAddress) {
          const transferLog = logs[0]
          const amountTransferred = transferLog.args.value

          const blockTimestamp = await getBlockTimestamp(transferLog.blockNumber);
          const date = new Date(blockTimestamp).toISOString();

          const newActivity = {
            txHash: transferLog.transactionHash,
            type: 'c',
            token: USDC_TOKEN_ADDRESS,
            stealthAddress: targetAddress,
            amount: Number(amountTransferred) / 1e6, // Convert to USDC format,
            date,
          }

          const activities = await AsyncStorage.getItem(ACTIVITY_STEALTH_ADDRESS)
          const _activities: Activity[] = activities ? JSON.parse(activities) : []

          // Store the activity in AsyncStorage
          await AsyncStorage.setItem(ACTIVITY_STEALTH_ADDRESS, JSON.stringify([newActivity, ..._activities.filter(act => act.stealthAddress)]))

          // Clean up the active stealth address if needed
          await AsyncStorage.removeItem(USER_STEALTH_ADDRESS_ACTIVED)
          console.log('New Activity')
          console.log(JSON.stringify(newActivity, null, 4))
        }
      } else {
        console.log('No matching Transfer events found.')
      }
    }
    
    // Fetch past transfer events
    const fetchPastTransfers = async () => {
      try {
        setLoading(true)
        const logs = await client.getContractEvents({
          address: USDC_TOKEN_ADDRESS,
          abi: erc20Abi,
          eventName: 'Transfer',
          args: { to: targetAddress },
          fromBlock: DEFAULT_FROM_BLOCK,
          strict: true,
        })

        await processTransferLogs(logs)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }

    // Watch real-time transfer events
    const startWatchingTransfers = () => {
      const unwatch = client.watchContractEvent({
        address: USDC_TOKEN_ADDRESS,
        abi: erc20Abi,
        eventName: 'Transfer',
        args: { to: targetAddress },
        onLogs: async (logs) => {
          await processTransferLogs(logs)
          logs.forEach((log) => {
            const newTransfer = {
              from: log.args.from,
              to: log.args.to,
              value: Number(log.args.value) / 1e6, // Convert to human-readable format
              blockNumber: log.blockNumber,
            }
            setTransfers((prevTransfers) => [newTransfer, ...prevTransfers])
          })
        },
        onError: (err) => {
          setError(err instanceof Error ? err : new Error(String(err)))
        },
      })

      return unwatch // Return unwatch function for cleanup
    }

    fetchPastTransfers()
    const unwatch = startWatchingTransfers()

    // Cleanup when the component unmounts
    return () => {
      unwatch()
    }
  }, [targetAddress])

  return { transfers, loading, error }
}

export default useERC20Transfers
