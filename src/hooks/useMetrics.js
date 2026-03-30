import { useReducer, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULTS, STORAGE_KEY } from '../lib/constants';
import {
  getBtcGoldRatio,
  getSpxGoldRatio,
  getRatioSignal,
  getDCAIntensity,
  getClaimsSignal,
  getUnemploymentSignal,
  getDxySignal,
  getFedSignal,
  calculateSwapAdvantage,
} from '../lib/calculations';
import { SWAP_ASSUMPTIONS } from '../lib/constants';

// Action types
const ACTIONS = {
  SET_METRIC: 'SET_METRIC',
  SET_ALL: 'SET_ALL',
  RESET: 'RESET',
};

// Reducer for metrics state
function metricsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_METRIC:
      return {
        ...state,
        [action.key]: action.value,
      };
    case ACTIONS.SET_ALL:
      return {
        ...state,
        ...action.metrics,
      };
    case ACTIONS.RESET:
      return { ...DEFAULTS };
    default:
      return state;
  }
}

/**
 * Central state management hook for all metrics
 * Combines local state with localStorage persistence
 * Provides all derived calculations and signals
 */
export function useMetrics() {
  // Load persisted metrics from localStorage, falling back to defaults
  const [persistedMetrics, setPersistedMetrics] = useLocalStorage(STORAGE_KEY, DEFAULTS);

  // Use reducer for complex state updates
  const [metrics, dispatch] = useReducer(metricsReducer, persistedMetrics);

  // Update a single metric
  const setMetric = useCallback((key, value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue) && numValue > 0) {
      dispatch({ type: ACTIONS.SET_METRIC, key, value: numValue });
      // Persist immediately
      setPersistedMetrics((prev) => ({ ...prev, [key]: numValue }));
    }
  }, [setPersistedMetrics]);

  // Update multiple metrics at once (for API integration later)
  const setAllMetrics = useCallback((newMetrics) => {
    dispatch({ type: ACTIONS.SET_ALL, metrics: newMetrics });
    setPersistedMetrics((prev) => ({ ...prev, ...newMetrics }));
  }, [setPersistedMetrics]);

  // Reset to defaults
  const resetMetrics = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
    setPersistedMetrics(DEFAULTS);
  }, [setPersistedMetrics]);

  // Computed ratios
  const btcGoldRatio = useMemo(
    () => getBtcGoldRatio(metrics.btcPrice, metrics.goldPrice),
    [metrics.btcPrice, metrics.goldPrice]
  );

  const spxGoldRatio = useMemo(
    () => getSpxGoldRatio(metrics.spx, metrics.goldPrice),
    [metrics.spx, metrics.goldPrice]
  );

  // Signals
  const ratioSignal = useMemo(() => getRatioSignal(btcGoldRatio), [btcGoldRatio]);

  const dcaModel = useMemo(
    () => getDCAIntensity(metrics.initialClaims, metrics.unemployment),
    [metrics.initialClaims, metrics.unemployment]
  );

  const claimsSignal = useMemo(
    () => getClaimsSignal(metrics.initialClaims),
    [metrics.initialClaims]
  );

  const unemploymentSignal = useMemo(
    () => getUnemploymentSignal(metrics.unemployment),
    [metrics.unemployment]
  );

  const dxySignal = useMemo(() => getDxySignal(metrics.dxy), [metrics.dxy]);

  const fedSignal = useMemo(() => getFedSignal(metrics.fedFunds), [metrics.fedFunds]);

  // Swap advantage calculation
  const swapAdvantage = useMemo(
    () => calculateSwapAdvantage(
      metrics.goldPrice,
      SWAP_ASSUMPTIONS.goldTarget,
      SWAP_ASSUMPTIONS.btcBottomEstimate
    ),
    [metrics.goldPrice]
  );

  return {
    // Raw metrics
    metrics,

    // Setters
    setMetric,
    setAllMetrics,
    resetMetrics,

    // Computed ratios
    btcGoldRatio,
    spxGoldRatio,

    // Signals
    ratioSignal,
    dcaModel,
    claimsSignal,
    unemploymentSignal,
    dxySignal,
    fedSignal,

    // Swap calculations
    swapAdvantage,

    // Assumptions
    goldTarget: SWAP_ASSUMPTIONS.goldTarget,
    btcBottomEstimate: SWAP_ASSUMPTIONS.btcBottomEstimate,
  };
}

export default useMetrics;
