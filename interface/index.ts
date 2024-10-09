export interface StealthInfo {
  stealthMetaAddress: `st:base:0x${string}`
  stealthAddress: `0x${string}`
  ephemeralPublicKey: `0x${string}`
  metadata: string
}
  
export interface Activity {
  txHash: string; // Transaction hash as a string
  type: 'c' | 'd'; // Define the type as either 'c' (credit) or 'd' (debit) if there are only two possible values
  token: string; // Token address as a string (e.g., USDC token address)
  stealthAddress: `0x${string}` | null; // Stealth address or null if not available
  amount: number; // Amount transferred in the proper USDC format (already divided by 1e6)
  date: string;
}
  