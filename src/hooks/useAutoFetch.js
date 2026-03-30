import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCryptoPrices, fetchMarketData, fetchMacroData } from '../lib/api';

// Storage key for API settings
const API_SETTINGS_KEY = 'itc-monitor-api-settings';

// FRED API key from environment variable
const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY || '';

// Default refresh intervals (in milliseconds)
const REFRESH_INTERVALS = {
  crypto: 60000,      // 1 minute for crypto prices
  macro: 3600000,     // 1 hour for macro data (FRED updates daily/weekly)
};

/**
 * Load API settings from localStorage
 */
function loadApiSettings() {
  if (typeof window === 'undefined') {
    return { enabled: false };
  }

  try {
    const stored = localStorage.getItem(API_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { enabled: false };
  } catch {
    return { enabled: false };
  }
}

/**
 * Save API settings to localStorage
 */
function saveApiSettings(settings) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save API settings:', error);
  }
}

/**
 * Custom hook for auto-fetching live data
 * FRED API key is read from VITE_FRED_API_KEY environment variable
 */
export function useAutoFetch(onDataUpdate) {
  // API settings state (only enabled toggle is stored)
  const [isEnabled, setIsEnabled] = useState(() => loadApiSettings().enabled);

  // Fetch state
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdate, setLastUpdate] = useState({
    crypto: null,
    macro: null,
  });
  const [errors, setErrors] = useState({
    crypto: null,
    macro: null,
  });

  // Refs for interval management
  const cryptoIntervalRef = useRef(null);
  const macroIntervalRef = useRef(null);

  // Check if FRED API key is available
  const hasFredKey = Boolean(FRED_API_KEY);

  /**
   * Fetch crypto prices (BTC, Gold via PAXG)
   */
  const fetchCrypto = useCallback(async () => {
    if (!isEnabled) return;

    setIsFetching(true);
    try {
      const [priceData, marketData] = await Promise.all([
        fetchCryptoPrices(),
        fetchMarketData(),
      ]);

      if (priceData.error) {
        setErrors((prev) => ({ ...prev, crypto: priceData.error }));
      } else {
        setErrors((prev) => ({ ...prev, crypto: null }));
        setLastUpdate((prev) => ({ ...prev, crypto: priceData.timestamp }));

        // Call the update callback with new data
        if (onDataUpdate) {
          const updates = {};
          if (priceData.btcPrice) updates.btcPrice = priceData.btcPrice;
          if (priceData.goldPrice) updates.goldPrice = priceData.goldPrice;
          if (marketData.btcDominance) updates.btcDominance = marketData.btcDominance;

          if (Object.keys(updates).length > 0) {
            onDataUpdate(updates);
          }
        }
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, crypto: error.message }));
    } finally {
      setIsFetching(false);
    }
  }, [isEnabled, onDataUpdate]);

  /**
   * Fetch macro data from FRED
   */
  const fetchMacro = useCallback(async () => {
    if (!isEnabled || !FRED_API_KEY) return;

    setIsFetching(true);
    try {
      const data = await fetchMacroData(FRED_API_KEY);

      if (data.error) {
        setErrors((prev) => ({ ...prev, macro: data.error }));
      } else {
        setErrors((prev) => ({ ...prev, macro: null }));
        setLastUpdate((prev) => ({ ...prev, macro: data.timestamp }));

        // Call the update callback with new data
        if (onDataUpdate) {
          const updates = {};
          if (data.initialClaims) updates.initialClaims = data.initialClaims;
          if (data.unemployment) updates.unemployment = data.unemployment;
          if (data.fedFunds) updates.fedFunds = data.fedFunds;
          if (data.dxy) updates.dxy = data.dxy;

          if (Object.keys(updates).length > 0) {
            onDataUpdate(updates);
          }
        }
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, macro: error.message }));
    } finally {
      setIsFetching(false);
    }
  }, [isEnabled, onDataUpdate]);

  /**
   * Manual refresh trigger
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchCrypto(), fetchMacro()]);
  }, [fetchCrypto, fetchMacro]);

  /**
   * Toggle auto-fetch on/off
   */
  const toggleEnabled = useCallback((enabled) => {
    setIsEnabled(enabled);
    saveApiSettings({ enabled });
  }, []);

  // Set up auto-fetch intervals
  useEffect(() => {
    if (!isEnabled) {
      // Clear intervals when disabled
      if (cryptoIntervalRef.current) {
        clearInterval(cryptoIntervalRef.current);
        cryptoIntervalRef.current = null;
      }
      if (macroIntervalRef.current) {
        clearInterval(macroIntervalRef.current);
        macroIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchCrypto();
    if (FRED_API_KEY) {
      fetchMacro();
    }

    // Set up intervals
    cryptoIntervalRef.current = setInterval(fetchCrypto, REFRESH_INTERVALS.crypto);

    if (FRED_API_KEY) {
      macroIntervalRef.current = setInterval(fetchMacro, REFRESH_INTERVALS.macro);
    }

    return () => {
      if (cryptoIntervalRef.current) {
        clearInterval(cryptoIntervalRef.current);
      }
      if (macroIntervalRef.current) {
        clearInterval(macroIntervalRef.current);
      }
    };
  }, [isEnabled, fetchCrypto, fetchMacro]);

  return {
    // Settings
    isEnabled,
    hasFredKey,
    toggleEnabled,

    // Status
    isFetching,
    lastUpdate,
    errors,

    // Actions
    refresh,

    // Intervals info
    refreshIntervals: REFRESH_INTERVALS,
  };
}

export default useAutoFetch;
