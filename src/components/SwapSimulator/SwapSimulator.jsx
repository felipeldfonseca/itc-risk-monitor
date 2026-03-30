import { formatNumber, formatBtc, formatPercent, formatRatio } from '../../lib/formatters';

/**
 * SwapSimulator - Gold→BTC rotation calculator
 * Compares gold rotation path vs direct BTC purchase
 */

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
  assumption: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginBottom: 'var(--space-3)',
  },
  pathGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
  },
  pathCard: {
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
  },
  pathCardGold: {
    background: 'var(--color-green-10)',
  },
  pathCardDirect: {
    background: 'var(--bg-card-active)',
  },
  pathLabel: {
    fontSize: 'var(--text-sm)',
  },
  pathDesc: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginTop: 2,
  },
  pathValue: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
    marginTop: 'var(--space-1)',
  },
  advantageCard: {
    background: 'var(--color-blue-10)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    border: '1px solid rgba(55, 138, 221, 0.2)',
  },
  advantageLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-blue)',
  },
  advantageValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-2)',
    marginTop: 2,
  },
  advantagePct: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-blue)',
  },
  advantageText: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-dim)',
  },
  ratioInfo: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-1)',
  },
  footer: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-3)',
    lineHeight: 'var(--leading-normal)',
    fontStyle: 'italic',
  },
};

export function SwapSimulator({
  currentGoldPrice,
  goldTarget,
  btcBottomEstimate,
  swapAdvantage,
  btcGoldRatio,
}) {
  const { goldPathBtc, directPathBtc, advantagePct, futureRatio } = swapAdvantage;

  return (
    <div style={styles.container}>
      <div style={styles.header}>Gold → BTC swap simulator</div>

      <div style={styles.assumption}>
        Projection: If gold hits ${formatNumber(goldTarget)} and BTC bottoms at ${formatNumber(btcBottomEstimate)}
      </div>

      {/* Comparison paths */}
      <div style={styles.pathGrid}>
        <div style={{ ...styles.pathCard, ...styles.pathCardGold }}>
          <div style={{ ...styles.pathLabel, color: 'var(--color-green)' }}>Via Gold rotation</div>
          <div style={styles.pathDesc}>$10K → gold now → swap at bottom</div>
          <div style={{ ...styles.pathValue, color: 'var(--color-green)' }}>
            {formatBtc(goldPathBtc)}
          </div>
        </div>

        <div style={{ ...styles.pathCard, ...styles.pathCardDirect }}>
          <div style={{ ...styles.pathLabel, color: 'var(--text-muted)' }}>Direct BTC buy at bottom</div>
          <div style={styles.pathDesc}>$10K → hold USDT → buy at bottom</div>
          <div style={{ ...styles.pathValue, color: 'var(--text-muted)' }}>
            {formatBtc(directPathBtc)}
          </div>
        </div>
      </div>

      {/* Advantage display */}
      <div style={styles.advantageCard}>
        <div style={styles.advantageLabel}>Advantage of gold rotation</div>
        <div style={styles.advantageValue}>
          <span style={styles.advantagePct}>+{formatNumber(advantagePct, 0)}%</span>
          <span style={styles.advantageText}>more BTC</span>
        </div>
        <div style={styles.ratioInfo}>
          Projected ratio at bottom: {formatRatio(futureRatio, 1)} (current: {formatRatio(btcGoldRatio, 1)})
        </div>
      </div>

      <div style={styles.footer}>
        Assumptions editable. Gold target: ${formatNumber(goldTarget)}. BTC bottom estimate: ${formatNumber(btcBottomEstimate)}. Adjust BTC and Gold prices above to recalculate.
      </div>
    </div>
  );
}

export default SwapSimulator;
