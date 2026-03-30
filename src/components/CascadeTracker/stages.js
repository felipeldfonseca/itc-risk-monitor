/**
 * ITC Risk Cascade - Stage definitions
 * Based on Benjamin Cowen's Risk Cascade Framework
 */

import { COLORS } from '../../lib/constants';

export const STAGES = [
  {
    id: 1,
    label: 'Speculative participation declines',
    status: 'complete',
    color: COLORS.green,
    description: 'Social risk metric at 0. Retail gone.',
    detail: 'Retail engagement has faded. YouTube views, Twitter activity, and exchange signups declined since 2021 peak.',
  },
  {
    id: 2,
    label: 'Highly speculative assets weaken',
    status: 'complete',
    color: COLORS.green,
    description: 'Altcoins bleeding since 2021. BTC.D at 67%.',
    detail: 'Capital consolidates into Bitcoin as liquidity tightens. Altcoins in structural bear market for years.',
  },
  {
    id: 3,
    label: 'Traditional risk assets deteriorate',
    status: 'active',
    color: COLORS.blue,
    description: 'SPX/Gold breaking down. Equities losing to gold.',
    detail: 'SPX/Gold ratio has broken multi-year uptrend. Investors rotating toward defensive assets.',
  },
  {
    id: 4,
    label: 'Financial conditions tighten further',
    status: 'emerging',
    color: COLORS.amber,
    description: 'DXY above 100. Oil rising. Real yields elevated.',
    detail: 'Dollar strength and energy prices tighten conditions even as Fed begins easing.',
  },
  {
    id: 5,
    label: 'Labor market feedback loop',
    status: 'inactive',
    color: COLORS.red,
    description: 'Claims < 300K. No nonlinear unemployment yet.',
    detail: 'The negative feedback loop has not started. Layoffs remain contained. This is the final stage.',
  },
];

export const STATUS_LABELS = {
  complete: 'Done',
  active: 'Now',
  emerging: 'Emerging',
  inactive: 'Pending',
};

export const STATUS_STYLES = {
  complete: {
    background: 'var(--color-green-10)',
    border: '1px solid rgba(93, 202, 165, 0.2)',
  },
  active: {
    background: 'var(--color-blue-15)',
    border: '1px solid rgba(55, 138, 221, 0.4)',
  },
  emerging: {
    background: 'var(--color-amber-10)',
    border: '1px solid rgba(239, 159, 39, 0.3)',
  },
  inactive: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
  },
};

export function getStageStatus(stageId) {
  const stage = STAGES.find(s => s.id === stageId);
  return stage ? stage.status : 'inactive';
}

export default STAGES;
