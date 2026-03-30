/**
 * Vercel Serverless Function - Business Cycle Metric
 * Calculates Ben Cowen's Business Cycle indicator:
 * (SPX / UNRATE²) × USINTR × USIRYY / M2
 */

const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

// US Recession periods (NBER official dates)
const RECESSIONS = [
  { start: '1969-12-01', end: '1970-11-01', label: '1969-70' },
  { start: '1973-11-01', end: '1975-03-01', label: '1973-75' },
  { start: '1980-01-01', end: '1980-07-01', label: '1980' },
  { start: '1981-07-01', end: '1982-11-01', label: '1981-82' },
  { start: '1990-07-01', end: '1991-03-01', label: '1990-91' },
  { start: '2001-03-01', end: '2001-11-01', label: '2001' },
  { start: '2007-12-01', end: '2009-06-01', label: '2007-09' },
  { start: '2020-02-01', end: '2020-04-01', label: '2020' },
];

// Fetch FRED series with all observations
async function fetchFredSeries(seriesId, apiKey, startDate = '1960-01-01') {
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

// Fetch SPX from Yahoo Finance (has much longer history than FRED's 10-year limit)
async function fetchSPXFromYahoo() {
  // Start from 1960 (Unix timestamp)
  const startTimestamp = -315619200; // Jan 1, 1960
  const endTimestamp = Math.floor(Date.now() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${startTimestamp}&period2=${endTimestamp}&interval=1mo&events=history`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance error: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  if (!result) throw new Error('No SPX data from Yahoo Finance');

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return timestamps.map((ts, i) => {
    const date = new Date(ts * 1000);
    // Normalize to first of month for alignment (YYYY-MM-01)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    return { date: dateStr, value: closes[i] };
  }).filter(obs => obs.value != null && !isNaN(obs.value));
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

// Get value for a month, with fallback to previous months if needed
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

// Normalize SPX values to fit on the same scale as the metric
function normalizeForOverlay(values, metricValues) {
  if (values.length === 0 || metricValues.length === 0) return [];

  const metricMax = Math.max(...metricValues.filter(v => isFinite(v)));
  const metricMin = Math.min(...metricValues.filter(v => isFinite(v)));
  const spxMax = Math.max(...values);
  const spxMin = Math.min(...values);

  const metricRange = metricMax - metricMin;
  const spxRange = spxMax - spxMin;

  if (spxRange === 0) return values.map(() => metricMin);

  return values.map(v => ((v - spxMin) / spxRange) * metricRange + metricMin);
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
    // Using Yahoo Finance for SPX (FRED only has 10 years due to licensing)
    const [unrate, fedfunds, cpi, m2, spx] = await Promise.all([
      fetchFredSeries('UNRATE', apiKey),
      fetchFredSeries('FEDFUNDS', apiKey),
      fetchFredSeries('CPIAUCSL', apiKey),
      fetchFredSeries('M2SL', apiKey),
      fetchSPXFromYahoo(),
    ]);

    // Calculate YoY inflation from CPI
    const inflation = calculateYoYInflation(cpi);

    // Convert to maps for easy lookup
    const unrateMap = toDateMap(unrate);
    const fedfundsMap = toDateMap(fedfunds);
    const inflationMap = toDateMap(inflation);
    const m2Map = toDateMap(m2);
    const spxMap = toDateMap(spx);

    // Get all unique months where we have SPX data
    const months = [...spxMap.keys()].sort();

    // Calculate the business cycle metric for each month
    const observations = [];
    const spxValues = [];
    const metricValues = [];

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
      const metric = (spxVal / (unrateVal * unrateVal)) * fedfundsVal * inflationVal / m2Val;

      // Only include finite values
      if (isFinite(metric)) {
        observations.push({
          date: `${month}-01`,
          value: metric,
          spx: spxVal,
          components: {
            spx: spxVal,
            unrate: unrateVal,
            fedfunds: fedfundsVal,
            inflation: inflationVal,
            m2: m2Val,
          },
        });
        spxValues.push(spxVal);
        metricValues.push(metric);
      }
    }

    // Normalize SPX values for overlay
    const normalizedSpx = normalizeForOverlay(spxValues, metricValues);
    observations.forEach((obs, i) => {
      obs.spxNormalized = normalizedSpx[i];
    });

    // Cache for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400');

    return res.status(200).json({
      name: 'Business Cycle Metric',
      formula: '(SPX / UNRATE²) × FEDFUNDS × CPI_YoY / M2',
      count: observations.length,
      observations,
      recessions: RECESSIONS,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Business cycle metric error:', error);
    return res.status(500).json({ error: error.message });
  }
}
