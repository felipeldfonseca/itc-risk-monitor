/**
 * Vercel Serverless Function - Yahoo Finance Proxy
 * Fetches historical stock data from Yahoo Finance (no API key needed)
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, period1, period2 } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol required' });
  }

  // Only allow specific symbols for security
  const validSymbols = ['^GSPC', '^SPX', 'SPY'];  // S&P 500 variants
  if (!validSymbols.includes(symbol)) {
    return res.status(400).json({ error: 'Invalid symbol' });
  }

  try {
    // Default to fetching from 1970 to now if no dates provided
    const startTimestamp = period1 || '0';  // Unix timestamp
    const endTimestamp = period2 || Math.floor(Date.now() / 1000).toString();

    // Yahoo Finance v7 chart API (no auth required)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1mo&events=history`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return res.status(404).json({ error: 'No data available' });
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes = quotes.close || [];

    // Transform to date/value pairs
    const observations = timestamps.map((ts, i) => {
      const date = new Date(ts * 1000);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        value: closes[i],
      };
    }).filter(obs => obs.value != null);  // Filter out null values

    // Cache for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400');

    return res.status(200).json({
      symbol,
      count: observations.length,
      observations,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`Yahoo Finance proxy error for ${symbol}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
