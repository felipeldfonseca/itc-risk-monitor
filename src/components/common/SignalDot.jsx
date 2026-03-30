/**
 * SignalDot - Reusable status indicator component
 */

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  label: {
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--weight-medium)',
  },
};

export function SignalDot({ color, label, size = 7 }) {
  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.dot,
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
      {label && (
        <span style={{ ...styles.label, color }}>
          {label}
        </span>
      )}
    </div>
  );
}

export default SignalDot;
