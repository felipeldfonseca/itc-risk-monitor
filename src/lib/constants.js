/**
 * ITC Risk Cascade Monitor - Constants
 * All thresholds, targets, and default values derived from Cowen Framework
 */

// BTC/Gold ratio swap zones
export const RATIO_ZONES = {
  TOO_EARLY: 18,      // > 18: Too early to swap, BTC still expensive vs gold
  COMPRESSING: 14,    // 14-18: Ratio compressing as expected, prepare
  NEAR_TARGET: 10,    // 10-14: Begin staged swap (25-50%)
  // < 10: Maximum compression, execute full swap
};

// DCA tier thresholds based on labor market signals
export const DCA_THRESHOLDS = {
  BASELINE: {
    claims: 250,      // Below this = no stress
    unemployment: 4.5,
    pct: 8,
    label: 'Baseline',
  },
  MODERATE: {
    claims: 300,      // 250-300K range
    unemployment: 5.0,
    pct: 15,
    label: 'Moderate',
  },
  AGGRESSIVE: {
    claims: 300,      // > 300K OR unemployment > 5%
    unemployment: 5.0,
    pct: 25,
    label: 'Aggressive',
  },
  MAXIMUM: {
    claims: 350,      // > 350K AND unemployment > 5.5%
    unemployment: 5.5,
    pct: 40,
    label: 'Maximum',
  },
};

// Initial claims signal thresholds
export const CLAIMS_THRESHOLDS = {
  SAFE: 250,          // < 250K: No recession signal
  WATCH: 300,         // 250-300K: Rising, watch closely
  ALERT: 300,         // > 300K sustained: Recession signal
};

// Unemployment rate thresholds
export const UNEMPLOYMENT_THRESHOLDS = {
  STABLE: 4.5,        // < 4.5%: Labor market stable
  COOLING: 5.0,       // 4.5-5.5%: Cooling
  NONLINEAR: 5.5,     // > 5.5%: Risk of nonlinear acceleration
};

// DXY (Dollar Index) thresholds
export const DXY_THRESHOLDS = {
  EM_TAILWIND: 95,    // < 95: EM tailwind, dollar weak
  NEUTRAL: 97,        // 95-105: Neutral range
  EM_PRESSURE: 105,   // > 105: EM pressure, dollar strength tightening conditions
};

// Fed Funds rate thresholds
export const FED_THRESHOLDS = {
  ACCOMMODATIVE: 3.0, // < 3%: Accommodative policy
  EASING: 4.0,        // 3-4.5%: Easing started
  RESTRICTIVE: 4.5,   // > 4.5%: Restrictive
};

// SPX/Gold ratio thresholds
export const SPX_GOLD_THRESHOLDS = {
  BREAKDOWN: 1.0,     // < 1.0: Historic breakdown zone
  GOLD_WINNING: 1.4,  // 1.0-1.4: Gold outperforming
  // > 1.4: Equities leading
};

// Default metric values (as of March 2026 reference)
export const DEFAULTS = {
  initialClaims: 213,   // In thousands
  unemployment: 4.4,    // Percentage
  dxy: 100.5,          // DXY index value
  spx: 5632,           // S&P 500 level
  goldPrice: 4450,     // USD per troy ounce
  btcPrice: 68000,     // USD
  btcDominance: 67,    // Percentage
  fedFunds: 4.12,      // Percentage
  vix: 22,             // VIX index
};

// Target assumptions for swap simulator
export const SWAP_ASSUMPTIONS = {
  goldTarget: 6150,      // Year-end consensus target (JPM, Wells Fargo, BofA, BNP)
  btcBottomEstimate: 48000, // Cycle bottom estimate based on prior midterm drawdowns
};

// Signal colors matching the dark terminal aesthetic
export const COLORS = {
  green: '#5DCAA5',
  blue: '#378ADD',
  amber: '#EF9F27',
  red: '#E24B4A',
  gray: '#888780',
  magenta: '#D4537E',
  text: {
    primary: '#E8E6DF',
    secondary: '#B4B2A9',
    muted: '#888780',
    dim: '#5F5E5A',
    subtle: '#444441',
  },
  background: {
    base: '#0D0D0F',
    card: 'rgba(255,255,255,0.02)',
    cardHover: 'rgba(255,255,255,0.04)',
    active: 'rgba(255,255,255,0.08)',
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    subtle: 'rgba(255,255,255,0.04)',
  },
};

// LocalStorage key
export const STORAGE_KEY = 'itc-monitor-metrics';
