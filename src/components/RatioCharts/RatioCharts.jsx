import { useEffect, useRef, memo } from 'react';

/**
 * RatioCharts - TradingView embedded charts for BTC/Gold and SPX/Gold ratios
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: 'var(--space-4)',
  },
  chartWrapper: {
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: 'var(--bg-card-active)',
  },
  chartLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    padding: 'var(--space-2) var(--space-3)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  chartContainer: {
    height: 400,
  },
};

// TradingView Widget Component
function TradingViewWidget({ symbol, containerId }) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Clean up previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create widget container div
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    containerRef.current?.appendChild(widgetContainer);

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'W',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(19, 23, 34, 1)',
      gridColor: 'rgba(42, 46, 57, 0.3)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current?.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '100%', width: '100%' }}
    />
  );
}

// Memoize to prevent unnecessary re-renders
const MemoizedWidget = memo(TradingViewWidget);

export function RatioCharts() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Historical Ratio Charts</div>

      <div style={styles.chartsGrid}>
        {/* BTC/Gold Ratio Chart */}
        <div style={styles.chartWrapper}>
          <div style={styles.chartLabel}>BTC / Gold Ratio</div>
          <div style={styles.chartContainer}>
            <MemoizedWidget
              symbol="BITSTAMP:BTCUSD/OANDA:XAUUSD"
              containerId="btc-gold-chart"
            />
          </div>
        </div>

        {/* SPX/Gold Ratio Chart */}
        <div style={styles.chartWrapper}>
          <div style={styles.chartLabel}>S&P 500 / Gold Ratio</div>
          <div style={styles.chartContainer}>
            <MemoizedWidget
              symbol="SP:SPX/TVC:GOLD"
              containerId="spx-gold-chart"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatioCharts;
