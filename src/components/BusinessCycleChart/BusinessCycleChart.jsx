import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/**
 * BusinessCycleChart - Displays Ben Cowen's Business Cycle Metric
 * Formula: (SPX / UNRATE²) × USINTR × USIRYY / M2
 */

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-3)',
  },
  title: {
    fontSize: 'var(--text-md)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  formula: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
    fontFamily: 'var(--font-mono)',
  },
  chartContainer: {
    height: 350,
    marginTop: 'var(--space-3)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 350,
    color: 'var(--text-dim)',
    fontSize: 'var(--text-sm)',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 350,
    color: 'var(--color-red)',
    fontSize: 'var(--text-sm)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-3)',
    paddingTop: 'var(--space-2)',
    borderTop: '1px solid var(--border-subtle)',
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
  },
  recessionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  recessionDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
  },
  currentValue: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
  },
};

// Known US recession periods (approximate)
const RECESSIONS = [
  { start: '1973-11-01', end: '1975-03-01', label: '1973-75' },
  { start: '1980-01-01', end: '1980-07-01', label: '1980' },
  { start: '1981-07-01', end: '1982-11-01', label: '1981-82' },
  { start: '1990-07-01', end: '1991-03-01', label: '1990-91' },
  { start: '2001-03-01', end: '2001-11-01', label: '2001' },
  { start: '2007-12-01', end: '2009-06-01', label: '2007-09' },
  { start: '2020-02-01', end: '2020-04-01', label: '2020' },
];

// Custom tooltip component
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-2)',
        fontSize: 'var(--text-xs)',
      }}
    >
      <div style={{ fontWeight: 'var(--weight-medium)', marginBottom: 4 }}>
        {formattedDate}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-blue)' }}>
        Value: {data.value?.toFixed(4) || 'N/A'}
      </div>
      {data.components && (
        <div style={{ marginTop: 4, color: 'var(--text-dim)' }}>
          <div>SPX: {data.components.spx?.toFixed(0)}</div>
          <div>UNRATE: {data.components.unrate?.toFixed(1)}%</div>
          <div>Fed Funds: {data.components.fedfunds?.toFixed(2)}%</div>
          <div>Inflation: {data.components.inflation?.toFixed(2)}%</div>
        </div>
      )}
    </div>
  );
}

export function BusinessCycleChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/business-cycle');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const result = await response.json();
        setData(result.observations || []);
      } catch (err) {
        console.error('Failed to fetch business cycle data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get current (latest) value
  const currentValue = data.length > 0 ? data[data.length - 1]?.value : null;

  // Format Y-axis ticks
  const formatYAxis = (value) => {
    if (Math.abs(value) >= 1) return value.toFixed(1);
    if (Math.abs(value) >= 0.01) return value.toFixed(2);
    return value.toFixed(4);
  };

  // Format X-axis dates
  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.getFullYear().toString();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Business Cycle Metric</div>
        <div style={styles.formula}>(SPX / UNRATE²) × USINTR × USIRYY / M2</div>
      </div>

      <div style={styles.chartContainer}>
        {loading ? (
          <div style={styles.loading}>Loading historical data...</div>
        ) : error ? (
          <div style={styles.error}>Error: {error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                axisLine={{ stroke: 'var(--border-subtle)' }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Zero reference line */}
              <ReferenceLine y={0} stroke="var(--border-default)" />

              {/* Main line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-blue)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-blue)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.recessionLabel}>
          <span style={styles.recessionDot} />
          <span>Gray bars on TradingView indicate recession periods</span>
        </div>
        {currentValue !== null && (
          <div style={styles.currentValue}>
            Current: {currentValue.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessCycleChart;
