// src/libs/walletService.ts

// Dummy function to simulate fetching wallet balance
export const getWalletBalance = async (walletAddress: string): Promise<string> => {
    console.log(`Fetching wallet balance for address: ${walletAddress}`);
    // Simulate a delay for async call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('2.345 ETH'); // Return a dummy wallet balance
      }, 1000);
    });
  };
  
  // Dummy function to simulate fetching token balances
  export const getTokenBalances = async (walletAddress: string): Promise<Array<{ symbol: string; balance: string }>> => {
    console.log(`Fetching token balances for address: ${walletAddress}`);
    // Simulate a delay for async call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { symbol: 'USDC', balance: '500.00' }, // Dummy USDC balance
          { symbol: 'DAI', balance: '100.00' },  // Dummy DAI balance
          { symbol: 'MATIC', balance: '250.12' }, // Dummy MATIC balance
        ]);
      }, 1500);
    });
  };
  
  // Dummy function to simulate fetching activity history
  export const getActivityHistory = async (walletAddress: string): Promise<Array<{ id: string; activity: string; date: string }>> => {
    console.log(`Fetching activity history for address: ${walletAddress}`);
    // Simulate a delay for async call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', activity: 'Sent 0.5 ETH to 0xabc...', date: '2024-10-02' },
          { id: '2', activity: 'Received 200 USDC from 0xdef...', date: '2024-09-29' },
          { id: '3', activity: 'Swapped 50 DAI to 0.1 ETH', date: '2024-09-25' },
        ]);
      }, 1200);
    });
  };
  