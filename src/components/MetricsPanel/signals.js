/**
 * MetricsPanel - Signal threshold logic
 * Centralized signal definitions for each metric type
 */

import { COLORS } from '../../lib/constants';

export const METRIC_CONFIG = {
  initialClaims: {
    label: 'Initial Claims',
    unit: 'K',
    thresholds: [250, 300],
    signals: [
      { max: 250, label: 'No recession', color: COLORS.green },
      { max: 300, label: 'Rising — watch', color: COLORS.amber },
      { max: Infinity, label: 'Recession signal', color: COLORS.red },
    ],
    description: 'Weekly jobless claims (Thursday)',
  },
  unemployment: {
    label: 'Unemployment',
    unit: '%',
    thresholds: [4.5, 5.5],
    signals: [
      { max: 4.5, label: 'Stable', color: COLORS.green },
      { max: 5.5, label: 'Cooling', color: COLORS.amber },
      { max: Infinity, label: 'Nonlinear risk', color: COLORS.red },
    ],
    description: 'Monthly unemployment rate (1st Friday)',
  },
  dxy: {
    label: 'DXY',
    unit: '',
    thresholds: [97, 105],
    signals: [
      { max: 97, label: 'EM tailwind', color: COLORS.green },
      { max: 105, label: 'Tight', color: COLORS.amber },
      { max: Infinity, label: 'EM pressure', color: COLORS.red },
    ],
    description: 'Dollar Index (daily)',
  },
  fedFunds: {
    label: 'Fed Funds',
    unit: '%',
    thresholds: [3.0, 4.5],
    signals: [
      { max: 3.0, label: 'Accommodative', color: COLORS.green },
      { max: 4.5, label: 'Easing started', color: COLORS.amber },
      { max: Infinity, label: 'Restrictive', color: COLORS.red },
    ],
    description: 'Federal Funds Rate (per FOMC)',
  },
};

/**
 * Get the signal for a given metric value
 */
export function getMetricSignal(metricKey, value) {
  const config = METRIC_CONFIG[metricKey];
  if (!config) return null;

  for (const signal of config.signals) {
    if (value <= signal.max) {
      return signal;
    }
  }
  return config.signals[config.signals.length - 1];
}

export default METRIC_CONFIG;
