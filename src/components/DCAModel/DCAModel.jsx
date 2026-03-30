import { DCA_TIERS } from './tiers';
import SignalDot from '../common/SignalDot';

/**
 * DCAModel - Variable DCA model display with tier visualization
 */

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-4)',
    marginBottom: 'var(--space-5)',
  },
  header: {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 'var(--space-3)',
  },
  tierGrid: {
    display: 'flex',
    gap: 'var(--space-1)',
    marginBottom: 'var(--space-4)',
  },
  tierCard: {
    flex: 1,
    padding: '10px 8px',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    transition: 'all var(--transition-normal)',
  },
  tierCardActive: {
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
  tierCardInactive: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
  },
  tierPct: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
  },
  tierLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
    marginTop: 2,
  },
  tierTrigger: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-1)',
  },
  signalBox: {
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  signalContent: {
    flex: 1,
  },
  signalTitle: {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-medium)',
  },
  signalNote: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
};

function TierCard({ tier, isActive }) {
  const activeStyle = isActive
    ? {
        background: `${tier.color}15`,
        borderColor: tier.color,
      }
    : {};

  return (
    <div
      style={{
        ...styles.tierCard,
        ...(isActive ? styles.tierCardActive : styles.tierCardInactive),
        ...activeStyle,
      }}
    >
      <div
        style={{
          ...styles.tierPct,
          color: isActive ? tier.color : 'var(--text-dim)',
        }}
      >
        {tier.pct}
      </div>
      <div
        style={{
          ...styles.tierLabel,
          color: isActive ? tier.color : 'var(--text-dim)',
        }}
      >
        {tier.label}
      </div>
      <div style={styles.tierTrigger}>{tier.trigger}</div>
    </div>
  );
}

export function DCAModel({ claims, unemployment, dcaModel }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Variable DCA model — BTC accumulation intensity</div>

      {/* Tier grid */}
      <div style={styles.tierGrid}>
        {DCA_TIERS.map((tier) => (
          <TierCard
            key={tier.label}
            tier={tier}
            isActive={tier.label === dcaModel.label}
          />
        ))}
      </div>

      {/* Current signal box */}
      <div
        style={{
          ...styles.signalBox,
          background: `${dcaModel.color}10`,
          border: `1px solid ${dcaModel.color}30`,
        }}
      >
        <SignalDot color={dcaModel.color} size={8} />
        <div style={styles.signalContent}>
          <div style={{ ...styles.signalTitle, color: dcaModel.color }}>
            Current signal: {dcaModel.label} ({dcaModel.pct}% of monthly capital → BTC)
          </div>
          <div style={styles.signalNote}>{dcaModel.note}</div>
        </div>
      </div>
    </div>
  );
}

export default DCAModel;
