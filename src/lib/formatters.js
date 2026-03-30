/**
 * ITC Risk Cascade Monitor - Formatters
 * Number formatting utilities for consistent display
 */

/**
 * Format a number with locale-aware thousands separators
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `$${formatNumber(value, decimals)}`;
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format initial claims (in thousands)
 */
export function formatClaims(value) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${formatNumber(value)}K`;
}

/**
 * Format a ratio with fixed decimals
 */
export function formatRatio(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toFixed(decimals);
}

/**
 * Format BTC amount
 */
export function formatBtc(value, decimals = 3) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)} BTC`;
}

/**
 * Format a number compactly (K, M, B suffixes)
 */
export function formatCompact(value) {
  if (value === null || value === undefined || isNaN(value)) return '—';

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return formatNumber(value);
}

/**
 * Parse a string value to a number, handling common formats
 */
export function parseValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;

  // Remove currency symbols, commas, percent signs
  const cleaned = value.replace(/[$,%K\s]/g, '');
  return parseFloat(cleaned);
}

/**
 * Validate a number is positive and within a reasonable range
 */
export function isValidMetric(value, min = 0, max = Infinity) {
  const num = typeof value === 'string' ? parseValue(value) : value;
  return !isNaN(num) && num >= min && num <= max;
}
