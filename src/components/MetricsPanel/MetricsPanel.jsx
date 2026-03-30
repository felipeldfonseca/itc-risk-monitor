import MetricCard from './MetricCard';
import { formatNumber, formatPercent } from '../../lib/formatters';

/**
 * MetricsPanel - Grid of 4 key editable metrics
 */

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-5)',
  },
};

export function MetricsPanel({
  metrics,
  signals,
  onMetricChange,
}) {
  return (
    <div style={styles.grid}>
      <MetricCard
        label="Initial Claims"
        value={metrics.initialClaims}
        unit="K"
        signal={signals.claims}
        onValueChange={(v) => onMetricChange('initialClaims', v)}
        formatter={(v) => formatNumber(v)}
      />
      <MetricCard
        label="Unemployment"
        value={metrics.unemployment}
        unit="%"
        signal={signals.unemployment}
        onValueChange={(v) => onMetricChange('unemployment', v)}
        formatter={(v) => formatNumber(v, 1)}
      />
      <MetricCard
        label="DXY"
        value={metrics.dxy}
        unit=""
        signal={signals.dxy}
        onValueChange={(v) => onMetricChange('dxy', v)}
        formatter={(v) => formatNumber(v, 1)}
      />
      <MetricCard
        label="Fed Funds"
        value={metrics.fedFunds}
        unit="%"
        signal={signals.fed}
        onValueChange={(v) => onMetricChange('fedFunds', v)}
        formatter={(v) => formatNumber(v, 2)}
      />
    </div>
  );
}

export default MetricsPanel;
