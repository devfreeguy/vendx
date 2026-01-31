import axios from "axios";

let bchPriceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

export async function getBchRate(): Promise<number> {
  const now = Date.now();

  if (bchPriceCache && now - bchPriceCache.timestamp < CACHE_DURATION_MS) {
    return bchPriceCache.price;
  }

  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd",
    );
    // Expected structure: { "bitcoin-cash": { "usd": 450.55 } }
    const price = response.data["bitcoin-cash"]?.usd;

    if (!price || typeof price !== "number") {
      throw new Error("Invalid price data from CoinGecko");
    }

    bchPriceCache = {
      price,
      timestamp: now,
    };

    return price;
  } catch (error) {
    console.error("Failed to fetch BCH price:", error);
    // If we have a stale price, return it rather than failing if reasonable?
    // For now, strict failure or fallback if critical.
    if (bchPriceCache) {
      return bchPriceCache.price;
    }
    throw new Error("Unable to fetch BCH rate");
  }
}
