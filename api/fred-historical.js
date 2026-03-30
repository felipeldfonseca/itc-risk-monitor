/**
 * Vercel Serverless Function - FRED Historical Data API
 * Fetches historical time series data from FRED
 */

const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { series, start_date, end_date } = req.query;
  const apiKey = process.env.VITE_FRED_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'FRED API key not configured' });
  }

  if (!series) {
    return res.status(400).json({ error: 'Series ID required' });
  }

  // Valid FRED series for business cycle metric
  const validSeries = [
    'ICSA',      // Initial Claims
    'UNRATE',    // Unemployment Rate
    'FEDFUNDS',  // Fed Funds Rate
    'DTWEXBGS',  // DXY
    'CPIAUCSL',  // CPI (for inflation calculation)
    'M2SL',      // M2 Money Supply
  ];

  if (!validSeries.includes(series)) {
    return res.status(400).json({ error: 'Invalid series ID' });
  }

  try {
    const params = new URLSearchParams({
      series_id: series,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
    });

    // Add date filters if provided
    if (start_date) params.append('observation_start', start_date);
    if (end_date) params.append('observation_end', end_date);

    const response = await fetch(`${FRED_API}?${params}`);

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform observations to simpler format
    const observations = (data.observations || [])
      .filter(obs => obs.value !== '.')  // Filter out missing values
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));

    // Cache for 24 hours (historical data doesn't change often)
    res.setHeader('Cache-Control', 's-maxage=86400');

    return res.status(200).json({
      series,
      count: observations.length,
      observations,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error(`FRED historical proxy error for ${series}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
