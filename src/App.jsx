import { useMetrics } from './hooks/useMetrics';
import { SWAP_ASSUMPTIONS } from './lib/constants';
import CascadeTracker from './components/CascadeTracker/CascadeTracker';
import MetricsPanel from './components/MetricsPanel/MetricsPanel';
import RatioTracker from './components/RatioTracker/RatioTracker';
import SwapSimulator from './components/SwapSimulator/SwapSimulator';
import DCAModel from './components/DCAModel/DCAModel';
import ActionPlan from './components/ActionPlan/ActionPlan';
import './styles/tokens.css';
import './styles/global.css';

const styles = {
  app: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    padding: 'var(--space-4)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: 'var(--space-5)',
  },
  title: {
    fontSize: 'var(--text-3xl)',
    fontWeight: 'var(--weight-bold)',
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-1)',
  },
  subtitle: {
    fontSize: 'var(--text-base)',
    color: 'var(--text-dim)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--space-4)',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  footer: {
    marginTop: 'var(--space-5)',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--border-subtle)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-dim)',
    textAlign: 'center',
  },
  link: {
    color: 'var(--color-blue)',
    textDecoration: 'none',
  },
};

function App() {
  const {
    metrics,
    setMetric,
    resetMetrics,
    btcGoldRatio,
    spxGoldRatio,
    ratioSignal,
    dcaModel,
    claimsSignal,
    unemploymentSignal,
    dxySignal,
    fedSignal,
    swapAdvantage,
    goldTarget,
    btcBottomEstimate,
  } = useMetrics();

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>ITC Risk Cascade Monitor</h1>
          <p style={styles.subtitle}>
            Real-time macro cycle positioning dashboard — Based on Benjamin Cowen's ITC framework
          </p>
        </header>

        {/* Cascade Tracker - Full width */}
        <div style={styles.fullWidth}>
          <CascadeTracker />
        </div>

        {/* Metrics Panel - Full width */}
        <div style={{ ...styles.fullWidth, marginTop: 'var(--space-4)' }}>
          <MetricsPanel
            metrics={metrics}
            signals={{
              claims: claimsSignal,
              unemployment: unemploymentSignal,
              dxy: dxySignal,
              fed: fedSignal,
            }}
            onMetricChange={setMetric}
          />
        </div>

        {/* Two-column grid for ratio trackers and simulators */}
        <div style={{ ...styles.grid, marginTop: 'var(--space-4)' }}>
          {/* Left column */}
          <div>
            <RatioTracker
              btcPrice={metrics.btcPrice}
              goldPrice={metrics.goldPrice}
              spx={metrics.spx}
              btcGoldRatio={btcGoldRatio}
              spxGoldRatio={spxGoldRatio}
              ratioSignal={ratioSignal}
              onBtcChange={(v) => setMetric('btcPrice', v)}
              onGoldChange={(v) => setMetric('goldPrice', v)}
            />
          </div>

          {/* Right column */}
          <div>
            <SwapSimulator
              currentGoldPrice={metrics.goldPrice}
              goldTarget={goldTarget}
              btcBottomEstimate={btcBottomEstimate}
              swapAdvantage={swapAdvantage}
              btcGoldRatio={btcGoldRatio}
            />
          </div>
        </div>

        {/* DCA Model - Full width */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <DCAModel
            claims={metrics.initialClaims}
            unemployment={metrics.unemployment}
            dcaModel={dcaModel}
          />
        </div>

        {/* Action Plan - Full width */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <ActionPlan />
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>
            Data is manually updated. Click any value to edit. Values persist in localStorage.
          </p>
          <p style={{ marginTop: 'var(--space-2)' }}>
            <button
              onClick={resetMetrics}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 12px',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              Reset to defaults
            </button>
          </p>
          <p style={{ marginTop: 'var(--space-3)' }}>
            Based on{' '}
            <a
              href="https://www.youtube.com/@intothecryptoverse"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Benjamin Cowen's Into The Cryptoverse
            </a>{' '}
            research
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
