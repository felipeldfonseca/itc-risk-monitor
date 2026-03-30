/**
 * DCA Model - Tier definitions
 * Variable DCA model tied to labor market triggers
 */

import { COLORS, DCA_THRESHOLDS } from '../../lib/constants';

export const DCA_TIERS = [
  {
    label: 'Baseline',
    pct: '8%',
    trigger: 'Claims < 250K',
    color: COLORS.gray,
    check: (claims, unemployment) => claims < DCA_THRESHOLDS.BASELINE.claims,
  },
  {
    label: 'Moderate',
    pct: '15%',
    trigger: 'Claims 250-300K',
    color: COLORS.amber,
    check: (claims, unemployment) =>
      claims >= DCA_THRESHOLDS.BASELINE.claims && claims < DCA_THRESHOLDS.AGGRESSIVE.claims,
  },
  {
    label: 'Aggressive',
    pct: '25%',
    trigger: 'Claims > 300K or UR > 5%',
    color: COLORS.blue,
    check: (claims, unemployment) =>
      (claims >= DCA_THRESHOLDS.AGGRESSIVE.claims || unemployment > DCA_THRESHOLDS.AGGRESSIVE.unemployment) &&
      !(claims > DCA_THRESHOLDS.MAXIMUM.claims && unemployment > DCA_THRESHOLDS.MAXIMUM.unemployment),
  },
  {
    label: 'Maximum',
    pct: '40%',
    trigger: 'Claims > 350K + UR > 5.5%',
    color: COLORS.green,
    check: (claims, unemployment) =>
      claims > DCA_THRESHOLDS.MAXIMUM.claims && unemployment > DCA_THRESHOLDS.MAXIMUM.unemployment,
  },
];

export function getActiveTier(claims, unemployment) {
  for (let i = DCA_TIERS.length - 1; i >= 0; i--) {
    if (DCA_TIERS[i].check(claims, unemployment)) {
      return DCA_TIERS[i];
    }
  }
  return DCA_TIERS[0];
}

export default DCA_TIERS;
