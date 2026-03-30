import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';

/**
 * BusinessCycleChart - Displays Ben Cowen's Business Cycle Metric
 * Formula: (SPX / UNRATE²) × USINTR × USIRYY / M2
 * With recession bands and SPX overlay
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
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
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
    height: 400,
    marginTop: 'var(--space-3)',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
    color: 'var(--text-dim)',
    fontSize: 'var(--text-sm)',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
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
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    marginRight: 'var(--space-3)',
  },
  legendDot: {
    width: 12,
    height: 3,
    borderRadius: 2,
  },
  recessionBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    background: 'rgba(156, 163, 175, 0.3)',
    border: '1px solid rgba(156, 163, 175, 0.5)',
  },
  currentValue: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-secondary)',
  },
};

// Custom tooltip component
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

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
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ fontWeight: 'var(--weight-medium)', marginBottom: 4 }}>
        {formattedDate}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ color: 'var(--color-blue)' }}>
          Metric: {data.value?.toFixed(4) || 'N/A'}
        </div>
        <div style={{ color: 'var(--color-green)' }}>
          S&P 500: {data.spx?.toLocaleString() || 'N/A'}
        </div>
      </div>
      {data.components && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
          <div>UNRATE: {data.components.unrate?.toFixed(1)}%</div>
          <div>Fed Funds: {data.components.fedfunds?.toFixed(2)}%</div>
          <div>Inflation YoY: {data.components.inflation?.toFixed(2)}%</div>
          <div>M2: ${(data.components.m2 / 1000).toFixed(1)}T</div>
        </div>
      )}
    </div>
  );
}

// Custom legend component
function CustomLegend() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
      <div style={styles.legendItem}>
        <div style={{ ...styles.legendDot, background: 'var(--color-blue)' }} />
        <span>Business Cycle Metric</span>
      </div>
      <div style={styles.legendItem}>
        <div style={{ ...styles.legendDot, background: 'var(--color-green)' }} />
        <span>S&P 500 (normalized)</span>
      </div>
      <div style={styles.legendItem}>
        <div style={styles.recessionBox} />
        <span>Recession</span>
      </div>
    </div>
  );
}

export function BusinessCycleChart() {
  const [data, setData] = useState([]);
  const [recessions, setRecessions] = useState([]);
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
        setRecessions(result.recessions || []);
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
  const currentSpx = data.length > 0 ? data[data.length - 1]?.spx : null;
  const dataStartDate = data.length > 0 ? data[0]?.date : null;

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

  // Filter recessions to only those within data range
  const visibleRecessions = recessions.filter(r => {
    if (!dataStartDate) return false;
    return r.end >= dataStartDate;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Business Cycle Metric</div>
        <div style={styles.formula}>(SPX / UNRATE²) × USINTR × USIRYY / M2</div>
      </div>

      <div style={styles.chartContainer}>
        {loading ? (
          <div style={styles.loading}>Loading historical data (this may take a moment)...</div>
        ) : error ? (
          <div style={styles.error}>Error: {error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />

              {/* Recession bands */}
              {visibleRecessions.map((recession, i) => (
                <ReferenceArea
                  key={i}
                  yAxisId="left"
                  x1={recession.start}
                  x2={recession.end}
                  fill="rgba(156, 163, 175, 0.25)"
                  stroke="rgba(156, 163, 175, 0.4)"
                  strokeWidth={1}
                  ifOverflow="extendDomain"
                />
              ))}

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
                yAxisId="left"
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Zero reference line */}
              <ReferenceLine yAxisId="left" y={0} stroke="var(--border-default)" />

              {/* SPX overlay (normalized to metric scale) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spxNormalized"
                stroke="var(--color-green)"
                strokeWidth={1}
                dot={false}
                opacity={0.6}
              />

              {/* Main business cycle metric line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="value"
                stroke="var(--color-blue)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-blue)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <CustomLegend />

      <div style={styles.footer}>
        <div>
          Data from {dataStartDate ? new Date(dataStartDate).getFullYear() : '—'} to present
        </div>
        {currentValue !== null && (
          <div style={styles.currentValue}>
            Current: {currentValue.toFixed(4)} | SPX: {currentSpx?.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessCycleChart;
