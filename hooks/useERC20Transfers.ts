import { useEffect, useState } from 'react'
import { createPublicClient, http, erc20Abi } from 'viem'
import { baseSepolia } from 'viem/chains'
import '@ethersproject/shims' // Polyfill for React Native
import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  ACTIVITY_STEALTH_ADDRESS,
  USER_STEALTH_ADDRESS_ACTIVED,
  USER_STEALTH_ADDRESS_COLLECTIONS,
} from '@/config/storage-key'
import { usdcTokenAddress } from '@/config/smart-contract-address'
import { DEFAULT_FROM_BLOCK } from '@/config/token'
import { StealthInfo, Activity } from '@/interface'

const useERC20Transfers = (targetAddress: `0x${string}` | null) => {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    console.log('targetAddress', targetAddress)
    if (!targetAddress) return

    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
    })

    const getBlockTimestamp = async (blockNumber: bigint) => {
      const block = await client.getBlock({ blockNumber })
      return Number(block.timestamp) * 1000
    }

    const processTransferLogs = async (logs: any[]) => {
      if (logs.length > 0) {
        const activatedStealthAddress = await AsyncStorage.getItem(
          USER_STEALTH_ADDRESS_ACTIVED,
        )
        const activeStealthAddress: StealthInfo | null = activatedStealthAddress
          ? JSON.parse(activatedStealthAddress)
          : null

        if (activeStealthAddress) {
          const transferLog = logs[0]

          const activities = await AsyncStorage.getItem(
            ACTIVITY_STEALTH_ADDRESS,
          )
          const _activities: Activity[] = activities
            ? JSON.parse(activities)
            : []

          const activityExist = _activities.some(
            (a) => a.txHash == transferLog.transactionHash,
          )

          if (!activityExist) {
            const amountTransferred = transferLog.args.value

            const blockTimestamp = await getBlockTimestamp(
              transferLog.blockNumber,
            )
            const date = new Date(blockTimestamp).toISOString()

            const amount = Number(amountTransferred) / 1e6 // Convert to USDC format

            const newActivity = {
              txHash: transferLog.transactionHash,
              type: 'c',
              token: usdcTokenAddress,
              stealthAddress: targetAddress,
              amount,
              date,
            }
            console.log('New Activity')
            console.log(JSON.stringify(newActivity, null, 4))

            // Store the activity in AsyncStorage
            await AsyncStorage.setItem(
              ACTIVITY_STEALTH_ADDRESS,
              JSON.stringify([
                newActivity,
                ..._activities.filter((act) => act.stealthAddress),
              ]),
            )

            // update balance
            const stealthAddressCollection = await AsyncStorage.getItem(
              USER_STEALTH_ADDRESS_COLLECTIONS,
            )

            const _stealthAddressCollection: StealthInfo[] =
              stealthAddressCollection
                ? JSON.parse(stealthAddressCollection)
                : []

            const newCollection = _stealthAddressCollection.map((address) => {
              if (address.stealthAddress === targetAddress) {
                const _amount = address.balance[usdcTokenAddress]
                address.balance[usdcTokenAddress] = _amount + amount
              }
              return address
            })

            console.log('newCollection', newCollection)

            // Store the activity in AsyncStorage
            await AsyncStorage.setItem(
              USER_STEALTH_ADDRESS_COLLECTIONS,
              JSON.stringify(newCollection),
            )

            // Clean up the active stealth address if needed
            await AsyncStorage.removeItem(USER_STEALTH_ADDRESS_ACTIVED)
          }
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
          address: usdcTokenAddress,
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
        address: usdcTokenAddress,
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
