/**
 * ITC Risk Cascade Monitor - API Service Layer
 * Fetches live data from various APIs
 */

// API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// FRED series IDs
const FRED_SERIES = {
  initialClaims: 'ICSA',      // Initial Claims
  unemployment: 'UNRATE',      // Unemployment Rate
  fedFunds: 'FEDFUNDS',        // Federal Funds Rate
  dxy: 'DTWEXBGS',             // Trade Weighted U.S. Dollar Index
};

/**
 * Fetch BTC and Gold prices from CoinGecko (free, no API key)
 */
export async function fetchCryptoPrices() {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      btcPrice: data.bitcoin?.usd || null,
      btcChange24h: data.bitcoin?.usd_24h_change || null,
      goldPrice: data['pax-gold']?.usd || null, // PAXG tracks gold price
      goldChange24h: data['pax-gold']?.usd_24h_change || null,
      source: 'coingecko',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    return { error: error.message };
  }
}

/**
 * Fetch market data from CoinGecko
 */
export async function fetchMarketData() {
  try {
    const response = await fetch(`${COINGECKO_API}/global`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      btcDominance: data.data?.market_cap_percentage?.btc || null,
      totalMarketCap: data.data?.total_market_cap?.usd || null,
      source: 'coingecko',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return { error: error.message };
  }
}

/**
 * Fetch data from FRED via our serverless proxy (bypasses CORS)
 * @param {string} seriesId - FRED series ID
 */
export async function fetchFredSeries(seriesId) {
  try {
    // Use our Vercel serverless function as proxy
    const response = await fetch(`/api/fred?series=${seriesId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      value: data.value,
      date: data.date,
      source: 'fred',
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error(`Failed to fetch FRED series ${seriesId}:`, error);
    return { error: error.message };
  }
}

/**
 * Fetch all FRED macro data via proxy
 */
export async function fetchMacroData() {
  const results = await Promise.all([
    fetchFredSeries(FRED_SERIES.initialClaims),
    fetchFredSeries(FRED_SERIES.unemployment),
    fetchFredSeries(FRED_SERIES.fedFunds),
    fetchFredSeries(FRED_SERIES.dxy),
  ]);

  const [claims, unemployment, fedFunds, dxy] = results;

  // Check if all failed (likely API key issue)
  const allFailed = results.every(r => r.error);
  if (allFailed) {
    return {
      error: claims.error || 'Failed to fetch macro data',
      timestamp: Date.now(),
    };
  }

  return {
    // Initial claims comes in raw numbers, convert to K format
    initialClaims: claims.value ? claims.value / 1000 : null,
    initialClaimsDate: claims.date,
    unemployment: unemployment.value,
    unemploymentDate: unemployment.date,
    fedFunds: fedFunds.value,
    fedFundsDate: fedFunds.date,
    dxy: dxy.value,
    dxyDate: dxy.date,
    source: 'fred',
    timestamp: Date.now(),
    errors: {
      initialClaims: claims.error,
      unemployment: unemployment.error,
      fedFunds: fedFunds.error,
      dxy: dxy.error,
    },
  };
}

/**
 * Fetch all available data
 */
export async function fetchAllData() {
  // Fetch crypto data (always available)
  const cryptoPromise = fetchCryptoPrices();
  const marketPromise = fetchMarketData();

  // Fetch FRED data via proxy
  const macroPromise = fetchMacroData();

  const [crypto, market, macro] = await Promise.all([
    cryptoPromise,
    marketPromise,
    macroPromise,
  ]);

  return {
    crypto,
    market,
    macro,
    timestamp: Date.now(),
  };
}

/**
 * Format the last update time
 */
export function formatLastUpdate(timestamp) {
  if (!timestamp) return 'Never';

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleDateString();
}

export default {
  fetchCryptoPrices,
  fetchMarketData,
  fetchMacroData,
  fetchAllData,
  formatLastUpdate,
  FRED_SERIES,
};
