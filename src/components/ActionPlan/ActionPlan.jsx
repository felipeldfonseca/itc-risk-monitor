import { COLORS } from '../../lib/constants';

/**
 * ActionPlan - Phase-based strategic roadmap
 */

const PHASES = [
  {
    phase: 'Now → Stage 4 confirmed',
    time: 'Q2-Q3 2026',
    color: COLORS.amber,
    actions: [
      'USDT yield: maintain ~60-70% as operational cushion + OTC',
      'Gold (PAXG): allocate ~20-25% of fixed income, taking advantage of -23% correction',
      'BTC DCA: baseline 8% of monthly capital — no aggressiveness',
      'Monitor: initial claims weekly, DXY, BTC/Gold ratio',
    ],
  },
  {
    phase: 'Stage 5 emerges',
    time: 'Q4 2026 — H1 2027?',
    color: COLORS.blue,
    actions: [
      'DCA BTC scales to 25% per month (claims > 300K)',
      'Gold should be near targets ($6K+) — begin partial gold→BTC swap',
      'Gradually reduce USDT yield — dollar weakening',
      'Monitor: unemployment nonlinear, SPX bottom proximity',
    ],
  },
  {
    phase: 'Recession + BTC bottom',
    time: '2027?',
    color: COLORS.green,
    actions: [
      'DCA BTC at maximum intensity (40% monthly capital)',
      'Execute full gold→BTC swap at maximum ratio compression point',
      'BTC historically bottoms ~15 days before recession declaration',
      'This is the maximum accumulation moment — the changing of hands',
    ],
  },
  {
    phase: 'New cycle + halving 2028',
    time: '2028-2029',
    color: COLORS.magenta,
    actions: [
      'Concentrated BTC position built over 2 years of accumulation',
      'April 2028 halving as catalyst',
      'Liquidity returns, Fed in easing mode, weak dollar, EM outperforms',
      'Bull market — harvest the fruits of strategic patience',
    ],
  },
];

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-4)',
  },
  header: {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 'var(--space-3)',
  },
  phaseCard: {
    marginBottom: 'var(--space-3)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    borderLeft: '3px solid',
  },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 'var(--space-2)',
  },
  phaseTitle: {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-semibold)',
  },
  phaseTime: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
  },
  actionItem: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-secondary)',
    lineHeight: 'var(--leading-relaxed)',
    paddingLeft: 'var(--space-2)',
  },
};

function PhaseCard({ phase }) {
  return (
    <div
      style={{
        ...styles.phaseCard,
        borderLeftColor: phase.color,
      }}
    >
      <div style={styles.phaseHeader}>
        <span style={{ ...styles.phaseTitle, color: phase.color }}>
          {phase.phase}
        </span>
        <span style={styles.phaseTime}>{phase.time}</span>
      </div>
      {phase.actions.map((action, i) => (
        <div key={i} style={styles.actionItem}>
          → {action}
        </div>
      ))}
    </div>
  );
}

export function ActionPlan() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Phase-based action plan</div>

      {PHASES.map((phase, i) => (
        <PhaseCard key={i} phase={phase} />
      ))}
    </div>
  );
}

export default ActionPlan;
