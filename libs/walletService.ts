// Dummy function

export const getWalletBalance = async (walletAddress: string): Promise<string> => {
    console.log(`Fetching wallet balance for address: ${walletAddress}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('2.345 ETH'); 
      }, 1000);
    });
  };
  
  export const getTokenBalances = async (walletAddress: string): Promise<Array<{ symbol: string; balance: string }>> => {
    console.log(`Fetching token balances for address: ${walletAddress}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { symbol: 'USDC', balance: '500.00' }, 
          { symbol: 'DAI', balance: '100.00' },
          { symbol: 'MATIC', balance: '250.12' }, 
        ]);
      }, 1500);
    });
  };
  
  export const getActivityHistory = async (walletAddress: string): Promise<Array<{ id: string; activity: string; date: string }>> => {
    console.log(`Fetching activity history for address: ${walletAddress}`);
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
  