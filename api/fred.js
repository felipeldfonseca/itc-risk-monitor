/**
 * Vercel Serverless Function - FRED API Proxy
 * Bypasses CORS by making server-side requests to FRED
 */

const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { series } = req.query;
  const apiKey = process.env.VITE_FRED_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'FRED API key not configured' });
  }

  if (!series) {
    return res.status(400).json({ error: 'Series ID required' });
  }

  // Valid FRED series we support
  const validSeries = ['ICSA', 'UNRATE', 'FEDFUNDS', 'DTWEXBGS', 'CPIAUCSL', 'M2SL'];
  if (!validSeries.includes(series)) {
    return res.status(400).json({ error: 'Invalid series ID' });
  }

  try {
    const params = new URLSearchParams({
      series_id: series,
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
      return res.status(404).json({ error: 'No data available' });
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600'); // Cache for 1 hour

    return res.status(200).json({
      series,
      value: parseFloat(observation.value),
      date: observation.date,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`FRED proxy error for ${series}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
