import { STAGES, STATUS_LABELS, STATUS_STYLES } from './stages';

/**
 * CascadeTracker - Visual representation of the 5-stage ITC Risk Cascade
 */

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 2,
    marginBottom: 'var(--space-5)',
  },
  stage: {
    flex: 1,
    padding: '10px 8px',
    borderRadius: 'var(--radius-md)',
    transition: 'background var(--transition-normal)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 'var(--space-1)',
  },
  badge: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-semibold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  label: {
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--weight-medium)',
    color: 'var(--text-secondary)',
    lineHeight: 'var(--leading-tight)',
  },
  description: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginTop: 3,
    lineHeight: 'var(--leading-tight)',
  },
};

function StageCard({ stage }) {
  const statusStyle = STATUS_STYLES[stage.status];
  const isComplete = stage.status === 'complete';

  return (
    <div
      style={{
        ...styles.stage,
        ...statusStyle,
      }}
    >
      <div style={styles.header}>
        <div
          style={{
            ...styles.badge,
            background: isComplete ? stage.color : 'transparent',
            border: `1.5px solid ${stage.color}`,
            color: isComplete ? 'var(--bg-base)' : stage.color,
          }}
        >
          {isComplete ? '✓' : stage.id}
        </div>
        <span style={{ ...styles.statusLabel, color: stage.color }}>
          {STATUS_LABELS[stage.status]}
        </span>
      </div>
      <div style={styles.label}>{stage.label}</div>
      <div style={styles.description}>{stage.description}</div>
    </div>
  );
}

export function CascadeTracker() {
  return (
    <div className="grid-5" style={{ marginBottom: 'var(--space-5)' }}>
      {STAGES.map((stage) => (
        <StageCard key={stage.id} stage={stage} />
      ))}
    </div>
  );
}

export default CascadeTracker;
