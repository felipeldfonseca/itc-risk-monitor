/**
 * ITC Risk Cascade Monitor - API Service Layer
 * Fetches live data from various free APIs
 */

// API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

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
 * Fetch S&P 500 price from CoinGecko (via SPY tracking)
 * Note: CoinGecko doesn't have SPX directly, we'll use an alternative
 */
export async function fetchMarketData() {
  try {
    // Using Fear & Greed index endpoint for market sentiment
    const response = await fetch(
      `${COINGECKO_API}/global`
    );

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
 * Fetch data from FRED API (requires API key)
 * @param {string} seriesId - FRED series ID
 * @param {string} apiKey - FRED API key
 */
export async function fetchFredSeries(seriesId, apiKey) {
  if (!apiKey) {
    return { error: 'FRED API key required' };
  }

  try {
    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit: '1',
    });

    const response = await fetch(`${FRED_API}?${params}`);

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();
    const observation = data.observations?.[0];

    if (!observation) {
      return { error: 'No data available' };
    }

    return {
      value: parseFloat(observation.value),
      date: observation.date,
      source: 'fred',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Failed to fetch FRED series ${seriesId}:`, error);
    return { error: error.message };
  }
}

/**
 * Fetch all FRED macro data
 * @param {string} apiKey - FRED API key
 */
export async function fetchMacroData(apiKey) {
  if (!apiKey) {
    return { error: 'FRED API key required' };
  }

  const results = await Promise.all([
    fetchFredSeries(FRED_SERIES.initialClaims, apiKey),
    fetchFredSeries(FRED_SERIES.unemployment, apiKey),
    fetchFredSeries(FRED_SERIES.fedFunds, apiKey),
    fetchFredSeries(FRED_SERIES.dxy, apiKey),
  ]);

  const [claims, unemployment, fedFunds, dxy] = results;

  return {
    // Initial claims comes in thousands, convert to K format
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
 * Fetch SPX from Yahoo Finance via a CORS proxy (alternative)
 * Note: This may not work in all environments due to CORS
 */
export async function fetchSPX() {
  try {
    // Using a public API that provides S&P 500 data
    // Alpha Vantage free tier or similar
    // For now, return null - user can input manually or we add server-side proxy
    return {
      spx: null,
      error: 'SPX auto-fetch requires server-side proxy (coming soon)',
      source: 'manual',
      timestamp: Date.now(),
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Fetch all available data
 * @param {Object} options - { fredApiKey }
 */
export async function fetchAllData(options = {}) {
  const { fredApiKey } = options;

  // Fetch crypto data (always available)
  const cryptoPromise = fetchCryptoPrices();
  const marketPromise = fetchMarketData();

  // Fetch FRED data if API key provided
  const macroPromise = fredApiKey
    ? fetchMacroData(fredApiKey)
    : Promise.resolve({ error: 'No FRED API key' });

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
