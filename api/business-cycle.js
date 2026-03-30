/**
 * Vercel Serverless Function - Business Cycle Metric
 * Calculates Ben Cowen's Business Cycle indicator:
 * (SPX / UNRATE²) × USINTR × USIRYY / M2
 */

const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

// Fetch FRED series with all observations
async function fetchFredSeries(seriesId, apiKey, startDate = '1970-01-01') {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'asc',
    observation_start: startDate,
  });

  const response = await fetch(`${FRED_API}?${params}`);
  if (!response.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${response.status}`);
  }

  const data = await response.json();
  return (data.observations || [])
    .filter(obs => obs.value !== '.')
    .map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}

// Fetch SPX from Yahoo Finance
async function fetchSPX(startTimestamp = 0) {
  const endTimestamp = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${startTimestamp}&period2=${endTimestamp}&interval=1mo&events=history`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance error: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  if (!result) throw new Error('No SPX data');

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return timestamps.map((ts, i) => {
    const date = new Date(ts * 1000);
    // Normalize to first of month for alignment
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    return { date: dateStr, value: closes[i] };
  }).filter(obs => obs.value != null);
}

// Calculate YoY inflation from CPI
function calculateYoYInflation(cpiData) {
  const result = [];
  for (let i = 12; i < cpiData.length; i++) {
    const current = cpiData[i];
    const yearAgo = cpiData[i - 12];
    if (current && yearAgo && yearAgo.value > 0) {
      const yoyRate = ((current.value - yearAgo.value) / yearAgo.value) * 100;
      result.push({ date: current.date, value: yoyRate });
    }
  }
  return result;
}

// Create a map for quick date lookups
function toDateMap(observations) {
  const map = new Map();
  for (const obs of observations) {
    // Normalize to YYYY-MM format for monthly alignment
    const monthKey = obs.date.substring(0, 7);
    map.set(monthKey, obs.value);
  }
  return map;
}

// Get value for a month, with fallback to previous month if needed
function getValueForMonth(map, monthKey, maxLookback = 3) {
  for (let i = 0; i < maxLookback; i++) {
    const [year, month] = monthKey.split('-').map(Number);
    const lookbackDate = new Date(year, month - 1 - i, 1);
    const lookbackKey = `${lookbackDate.getFullYear()}-${String(lookbackDate.getMonth() + 1).padStart(2, '0')}`;
    if (map.has(lookbackKey)) {
      return map.get(lookbackKey);
    }
  }
  return null;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_FRED_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FRED API key not configured' });
  }

  try {
    // Fetch all data in parallel
    const [unrate, fedfunds, cpi, m2, spx] = await Promise.all([
      fetchFredSeries('UNRATE', apiKey),
      fetchFredSeries('FEDFUNDS', apiKey),
      fetchFredSeries('CPIAUCSL', apiKey),
      fetchFredSeries('M2SL', apiKey),
      fetchSPX(),
    ]);

    // Calculate YoY inflation from CPI
    const inflation = calculateYoYInflation(cpi);

    // Convert to maps for easy lookup
    const unrateMap = toDateMap(unrate);
    const fedfundsMap = toDateMap(fedfunds);
    const inflationMap = toDateMap(inflation);
    const m2Map = toDateMap(m2);
    const spxMap = toDateMap(spx);

    // Get all unique months from SPX (our base timeline)
    const months = [...spxMap.keys()].sort();

    // Calculate the business cycle metric for each month
    const observations = [];
    for (const month of months) {
      const spxVal = spxMap.get(month);
      const unrateVal = getValueForMonth(unrateMap, month);
      const fedfundsVal = getValueForMonth(fedfundsMap, month);
      const inflationVal = getValueForMonth(inflationMap, month);
      const m2Val = getValueForMonth(m2Map, month);

      // Skip if any value is missing or invalid
      if (!spxVal || !unrateVal || fedfundsVal == null || inflationVal == null || !m2Val) {
        continue;
      }

      // Skip if unemployment is 0 (would cause division by zero)
      if (unrateVal === 0) continue;

      // Business Cycle Metric = (SPX / UNRATE²) × USINTR × USIRYY / M2
      // Multiply by a scaling factor for readability
      const metric = (spxVal / (unrateVal * unrateVal)) * fedfundsVal * inflationVal / m2Val;

      // Only include positive values (metric can go negative with negative rates/inflation)
      if (isFinite(metric)) {
        observations.push({
          date: `${month}-01`,
          value: metric,
          // Include component values for debugging/display
          components: {
            spx: spxVal,
            unrate: unrateVal,
            fedfunds: fedfundsVal,
            inflation: inflationVal,
            m2: m2Val,
          },
        });
      }
    }

    // Cache for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400');

    return res.status(200).json({
      name: 'Business Cycle Metric',
      formula: '(SPX / UNRATE²) × FEDFUNDS × CPI_YoY / M2',
      count: observations.length,
      observations,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Business cycle metric error:', error);
    return res.status(500).json({ error: error.message });
  }
}
