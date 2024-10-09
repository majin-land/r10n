import { useEffect, useState } from 'react';
import { createPublicClient, http, erc20Abi, parseAbiItem } from 'viem';
import { baseSepolia  } from 'viem/chains';
import '@ethersproject/shims'; // Polyfill for React Native

const USDC_TOKEN_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'


// Custom hook for combining past and real-time ERC-20 transfers
const useERC20Transfers = (targetAddress: `0x${string}`) => {
  const [transfers, setTransfers] = useState<any[]>([]); // Store all transfer events
  const [loading, setLoading] = useState(true); // Loading state for past events
  const [error, setError] = useState<Error | null>(null); // Error state

  useEffect(() => {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.EXPO_PUBLIC_BASE_RPC_URL),
    });

    const fetchPastTransfers = async () => {
      try {
        console.log('===================sss', targetAddress)
        setLoading(true);
        const logs = await client.getLogs({
          address: USDC_TOKEN_ADDRESS,
          event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
          args: { 
            to: targetAddress
          }
        });

        // ACTIVE_STEALTH_ADDRESS = RESET {}
        // ACTIVE_TRASNFER_STEALTH_ADDRESS  []
        // ACTIVITY_STEALTH_ADRESS = GET ALL
        // ACTIVITY_STEALTH_ADRESS = SET TX_HASH C(+) AMOUNT
        // ACTIVITY_STEALTH_ADRESS = SET TX_HASH D(-) AMOUNT

        console.log(logs, 'logsloxxxxxgs')
        const pastTransfers = logs.map((log) => ({
          from: log.args.from,
          to: log.args.to,
          value: log.args.value.toString(),
          blockNumber: log.blockNumber,
        }));
        setTransfers((prevTransfers) => [...prevTransfers, ...pastTransfers]);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    // Real-time event listener for Transfer events
    const startWatchingTransfers = () => {
      const unwatch = client.watchContractEvent({
        address: USDC_TOKEN_ADDRESS,
        abi: erc20Abi,
        eventName: 'Transfer',
        args: { to: targetAddress },
        onLogs: (logs) => {
          console.log(logs, 'logsloxxxxxgs watch')
          logs.forEach((log) => {
            const newTransfer = {
              from: log.args.from,
              to: log.args.to,
              value: log.args.value,
              blockNumber: log.blockNumber,
            };
            setTransfers((prevTransfers) => [newTransfer, ...prevTransfers]);
          });
        },
        onError: (err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
        },
      });

      // Cleanup watcher when component unmounts
      return () => unwatch();
    };

    // Fetch past transfers and start real-time listener
    fetchPastTransfers();
    const unwatch = startWatchingTransfers();

    // Cleanup when the component unmounts
    return () => {
      unwatch();
    };
  }, [targetAddress]);

  return { transfers, loading, error };
};

export default useERC20Transfers;
