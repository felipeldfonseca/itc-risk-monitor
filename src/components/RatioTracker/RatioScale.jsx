import { getRatioPosition } from '../../lib/calculations';

/**
 * RatioScale - Visual scale bar showing BTC/Gold ratio position
 */

const styles = {
  container: {
    marginBottom: 'var(--space-2)',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
    marginBottom: 3,
  },
  track: {
    position: 'relative',
    height: 6,
    background: 'var(--border-default)',
    borderRadius: 3,
    overflow: 'visible',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 3,
    background: 'linear-gradient(90deg, var(--color-green), var(--color-blue), var(--color-amber), var(--color-red))',
  },
  thumb: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--text-primary)',
    border: '2px solid var(--bg-base)',
    transform: 'translateX(-50%)',
    transition: 'left var(--transition-normal)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export function RatioScale({ btcGoldRatio }) {
  const position = getRatioPosition(btcGoldRatio);
  const gradientWidth = Math.min(100, Math.max(5, position));

  return (
    <div style={styles.container}>
      <div style={styles.labels}>
        <span>Max compression (&lt;10)</span>
        <span>Current</span>
        <span>Too early (&gt;18)</span>
      </div>
      <div style={styles.track}>
        <div
          style={{
            ...styles.gradient,
            width: `${gradientWidth}%`,
          }}
        />
        <div
          style={{
            ...styles.thumb,
            left: `${Math.min(95, Math.max(5, position))}%`,
          }}
        />
      </div>
    </div>
  );
}

export default RatioScale;
