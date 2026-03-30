import RatioScale from './RatioScale';
import SignalDot from '../common/SignalDot';
import EditableValue from '../common/EditableValue';
import { formatNumber, formatRatio } from '../../lib/formatters';
import { getSpxGoldSignal } from '../../lib/calculations';

/**
 * RatioTracker - BTC/Gold ratio display with swap signal
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
  priceRow: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  priceCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
  },
  ratioBox: {
    background: 'var(--bg-card-active)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-3)',
  },
  ratioLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
  },
  ratioValue: {
    fontSize: 'var(--text-4xl)',
    fontWeight: 'var(--weight-semibold)',
    fontFamily: 'var(--font-mono)',
  },
  signalRow: {
    marginTop: 'var(--space-1)',
  },
  actionText: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-secondary)',
    marginTop: 'var(--space-2)',
    lineHeight: 'var(--leading-relaxed)',
  },
  footer: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-2)',
    paddingTop: 'var(--space-2)',
    borderTop: '1px solid var(--border-subtle)',
  },
};

export function RatioTracker({
  btcPrice,
  goldPrice,
  spx,
  btcGoldRatio,
  spxGoldRatio,
  ratioSignal,
  onBtcChange,
  onGoldChange,
}) {
  const spxGoldSignal = getSpxGoldSignal(spxGoldRatio);

  return (
    <div style={styles.container}>
      <div style={styles.header}>BTC / Gold ratio — swap signal</div>

      {/* Price inputs */}
      <div style={styles.priceRow}>
        <div style={styles.priceCol}>
          <div style={styles.priceLabel}>BTC Price</div>
          <div style={styles.priceValue}>
            $<EditableValue
              value={btcPrice}
              onSave={onBtcChange}
              formatter={(v) => formatNumber(v)}
            />
          </div>
        </div>
        <div style={styles.priceCol}>
          <div style={styles.priceLabel}>Gold Price</div>
          <div style={styles.priceValue}>
            $<EditableValue
              value={goldPrice}
              onSave={onGoldChange}
              formatter={(v) => formatNumber(v)}
            />
          </div>
        </div>
      </div>

      {/* Current ratio display */}
      <div style={styles.ratioBox}>
        <div style={styles.ratioLabel}>Current BTC/Gold ratio</div>
        <div style={{ ...styles.ratioValue, color: ratioSignal.color }}>
          {formatRatio(btcGoldRatio, 1)}
        </div>
        <div style={styles.signalRow}>
          <SignalDot color={ratioSignal.color} label={ratioSignal.label} size={8} />
        </div>
        <div style={styles.actionText}>{ratioSignal.action}</div>
      </div>

      {/* Ratio scale bar */}
      <RatioScale btcGoldRatio={btcGoldRatio} />

      {/* SPX/Gold ratio footer */}
      <div style={styles.footer}>
        SPX/Gold: {formatRatio(spxGoldRatio, 2)} — {spxGoldSignal.label}
      </div>
    </div>
  );
}

export default RatioTracker;
