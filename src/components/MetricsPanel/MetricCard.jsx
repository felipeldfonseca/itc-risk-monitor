import SignalDot from '../common/SignalDot';
import EditableValue from '../common/EditableValue';

/**
 * MetricCard - Individual metric display with editable value and signal
 */

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
  unit: {
    fontSize: 'var(--text-md)',
    color: 'var(--text-muted)',
  },
  signalRow: {
    marginTop: 2,
  },
};

export function MetricCard({
  label,
  value,
  unit,
  signal,
  onValueChange,
  formatter,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={styles.valueRow}>
        <span style={styles.value}>
          <EditableValue
            value={value}
            onSave={onValueChange}
            formatter={formatter}
          />
        </span>
        {unit && <span style={styles.unit}>{unit}</span>}
      </div>
      {signal && (
        <div style={styles.signalRow}>
          <SignalDot color={signal.color} label={signal.label} />
        </div>
      )}
    </div>
  );
}

export default MetricCard;
