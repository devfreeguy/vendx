import { getBchRate } from "./price";

interface BchQuote {
  usdAmount: number;
  bchAmount: number;
  exchangeRate: number;
  rateExpiresAt: Date;
}

// 8 decimals for BCH/Bitcoin
const SATOSHIS_PER_BCH = 100_000_000;

export async function calculateBchAmount(usdAmount: number): Promise<BchQuote> {
  const rate = await getBchRate();

  // Convert USD to BCH: USD / Rate
  const rawBch = usdAmount / rate;

  // Format to 8 decimal places (standard for Bitcoin-like chains)
  // We floor to avoid overcharging due to floating point, or ceil to ensure full payment?
  // Usually standard rounding or ceil to be safe for merchant.
  // Let's use toFixed(8) then parse, ensuring we have a fixed precision number.
  const bchAmount = parseFloat(rawBch.toFixed(8));

  // Set expiration (e.g., 15 minutes from now)
  const rateExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return {
    usdAmount,
    bchAmount,
    exchangeRate: rate,
    rateExpiresAt,
  };
}
