/**
 * ITC Risk Cascade Monitor - Calculations
 * All pure functions for derived values, signals, and DCA logic
 */

import {
  RATIO_ZONES,
  DCA_THRESHOLDS,
  CLAIMS_THRESHOLDS,
  UNEMPLOYMENT_THRESHOLDS,
  DXY_THRESHOLDS,
  FED_THRESHOLDS,
  SPX_GOLD_THRESHOLDS,
  COLORS,
} from './constants';

/**
 * Calculate BTC/Gold price ratio
 */
export function getBtcGoldRatio(btcPrice, goldPrice) {
  if (!goldPrice || goldPrice === 0) return 0;
  return btcPrice / goldPrice;
}

/**
 * Calculate SPX/Gold ratio
 */
export function getSpxGoldRatio(spxPrice, goldPrice) {
  if (!goldPrice || goldPrice === 0) return 0;
  return spxPrice / goldPrice;
}

/**
 * Get swap signal based on BTC/Gold ratio
 * Returns { label, color, action }
 */
export function getRatioSignal(btcGoldRatio) {
  if (btcGoldRatio > RATIO_ZONES.TOO_EARLY) {
    return {
      label: 'Too early',
      color: COLORS.gray,
      action: 'Hold gold. BTC still expensive vs gold.',
    };
  }
  if (btcGoldRatio > RATIO_ZONES.COMPRESSING) {
    return {
      label: 'Compressing',
      color: COLORS.amber,
      action: 'Prepare. Ratio falling as expected.',
    };
  }
  if (btcGoldRatio > RATIO_ZONES.NEAR_TARGET) {
    return {
      label: 'Near target',
      color: COLORS.blue,
      action: 'Begin staged swap: gold → BTC (25-50%).',
    };
  }
  return {
    label: 'Maximum compression',
    color: COLORS.green,
    action: 'Execute full swap. Gold → BTC. Best ratio.',
  };
}

/**
 * Get DCA intensity based on labor market indicators
 * Returns { pct, label, color, note }
 */
export function getDCAIntensity(initialClaims, unemployment) {
  // Maximum tier: Claims > 350K AND unemployment > 5.5%
  if (initialClaims > DCA_THRESHOLDS.MAXIMUM.claims && unemployment > DCA_THRESHOLDS.MAXIMUM.unemployment) {
    return {
      pct: DCA_THRESHOLDS.MAXIMUM.pct,
      label: DCA_THRESHOLDS.MAXIMUM.label,
      color: COLORS.green,
      note: 'Stage 5 confirmed. Recession likely. BTC near bottom.',
    };
  }

  // Aggressive tier: Claims > 300K OR unemployment > 5.0%
  if (initialClaims > DCA_THRESHOLDS.AGGRESSIVE.claims || unemployment > DCA_THRESHOLDS.AGGRESSIVE.unemployment) {
    return {
      pct: DCA_THRESHOLDS.AGGRESSIVE.pct,
      label: DCA_THRESHOLDS.AGGRESSIVE.label,
      color: COLORS.blue,
      note: 'Stage 5 emerging. Increase BTC accumulation.',
    };
  }

  // Moderate tier: Claims 250-300K
  if (initialClaims > DCA_THRESHOLDS.BASELINE.claims) {
    return {
      pct: DCA_THRESHOLDS.MODERATE.pct,
      label: DCA_THRESHOLDS.MODERATE.label,
      color: COLORS.amber,
      note: 'Late Stage 4. Claims rising. Stay alert.',
    };
  }

  // Baseline tier: Claims < 250K
  return {
    pct: DCA_THRESHOLDS.BASELINE.pct,
    label: DCA_THRESHOLDS.BASELINE.label,
    color: COLORS.gray,
    note: 'Stages 3-4. Preserve capital. Steady DCA.',
  };
}

/**
 * Get signal for initial claims value
 * Returns { label, color }
 */
export function getClaimsSignal(claims) {
  if (claims < CLAIMS_THRESHOLDS.SAFE) {
    return { label: 'No recession', color: COLORS.green };
  }
  if (claims < CLAIMS_THRESHOLDS.WATCH) {
    return { label: 'Rising — watch', color: COLORS.amber };
  }
  return { label: 'Recession signal', color: COLORS.red };
}

/**
 * Get signal for unemployment rate
 * Returns { label, color }
 */
export function getUnemploymentSignal(rate) {
  if (rate < UNEMPLOYMENT_THRESHOLDS.STABLE) {
    return { label: 'Stable', color: COLORS.green };
  }
  if (rate < UNEMPLOYMENT_THRESHOLDS.NONLINEAR) {
    return { label: 'Cooling', color: COLORS.amber };
  }
  return { label: 'Nonlinear risk', color: COLORS.red };
}

/**
 * Get signal for DXY (Dollar Index)
 * Returns { label, color }
 */
export function getDxySignal(dxy) {
  if (dxy > DXY_THRESHOLDS.EM_PRESSURE) {
    return { label: 'EM pressure', color: COLORS.red };
  }
  if (dxy > DXY_THRESHOLDS.NEUTRAL) {
    return { label: 'Tight', color: COLORS.amber };
  }
  return { label: 'EM tailwind', color: COLORS.green };
}

/**
 * Get signal for Fed Funds rate
 * Returns { label, color }
 */
export function getFedSignal(rate) {
  if (rate > FED_THRESHOLDS.RESTRICTIVE) {
    return { label: 'Restrictive', color: COLORS.red };
  }
  if (rate > FED_THRESHOLDS.ACCOMMODATIVE) {
    return { label: 'Easing started', color: COLORS.amber };
  }
  return { label: 'Accommodative', color: COLORS.green };
}

/**
 * Get signal for SPX/Gold ratio
 * Returns { label, color }
 */
export function getSpxGoldSignal(ratio) {
  if (ratio < SPX_GOLD_THRESHOLDS.BREAKDOWN) {
    return { label: 'Historic breakdown zone', color: COLORS.red };
  }
  if (ratio < SPX_GOLD_THRESHOLDS.GOLD_WINNING) {
    return { label: 'Gold outperforming', color: COLORS.amber };
  }
  return { label: 'Equities leading', color: COLORS.green };
}

/**
 * Calculate the advantage of the gold rotation strategy
 * Returns { goldPathBtc, directPathBtc, advantagePct, futureRatio }
 */
export function calculateSwapAdvantage(currentGoldPrice, goldTarget, btcBottom, capitalAmount = 10000) {
  // Path A: Buy gold now, swap to BTC at bottom
  const goldOunces = capitalAmount / currentGoldPrice;
  const goldValueAtTarget = goldOunces * goldTarget;
  const goldPathBtc = goldValueAtTarget / btcBottom;

  // Path B: Hold USDT, buy BTC at bottom
  const directPathBtc = capitalAmount / btcBottom;

  // Calculate advantage
  const advantagePct = ((goldPathBtc / directPathBtc) - 1) * 100;

  // Future ratio at targets
  const futureRatio = btcBottom / goldTarget;

  return {
    goldPathBtc,
    directPathBtc,
    advantagePct,
    futureRatio,
  };
}

/**
 * Check if a DCA tier is currently active based on metrics
 */
export function isTierActive(tierLabel, claims, unemployment) {
  const intensity = getDCAIntensity(claims, unemployment);
  return intensity.label === tierLabel;
}

/**
 * Get the ratio position as a percentage for the scale bar (0-100)
 * Maps ratio 5-25 to 0-100%
 */
export function getRatioPosition(btcGoldRatio) {
  const min = 5;
  const max = 25;
  const position = ((btcGoldRatio - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, position));
}
