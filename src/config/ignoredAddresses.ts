// Addresses to ignore in transfer displays
export const IGNORED_ADDRESSES = new Set([
  '0x63242A4Ea82847b20E506b63B0e2e2eFF0CC6cB0', // KyberSwap
  '0x000000000000000000000000000000000000dEaD', // Burn address
  '0x3053530aBC03731BC78DE738F607748435F4796d', // Swap provider (TradingVaultImplementation/) / Aerodrome
  '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43' // Aerodrome
  // Add more addresses here as needed
]);