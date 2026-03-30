import { useMetrics } from './hooks/useMetrics';
import { useAutoFetch } from './hooks/useAutoFetch';
import CascadeTracker from './components/CascadeTracker/CascadeTracker';
import MetricsPanel from './components/MetricsPanel/MetricsPanel';
import RatioTracker from './components/RatioTracker/RatioTracker';
import SwapSimulator from './components/SwapSimulator/SwapSimulator';
import DCAModel from './components/DCAModel/DCAModel';
import ActionPlan from './components/ActionPlan/ActionPlan';
import DataStatus from './components/DataStatus/DataStatus';
import './styles/tokens.css';
import './styles/global.css';

function App() {
  const {
    metrics,
    setMetric,
    setAllMetrics,
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

  // Auto-fetch hook - updates metrics when new data arrives
  const {
    isEnabled,
    hasFredKey,
    isFetching,
    lastUpdate,
    errors,
    toggleEnabled,
    refresh,
  } = useAutoFetch(setAllMetrics);

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="title">ITC Risk Cascade Monitor</h1>
          <p className="subtitle">
            Real-time macro cycle positioning dashboard — Based on Benjamin Cowen's ITC framework
          </p>
        </header>

        {/* Data Status Bar */}
        <DataStatus
          isEnabled={isEnabled}
          hasFredKey={hasFredKey}
          isFetching={isFetching}
          lastUpdate={lastUpdate}
          errors={errors}
          onToggleEnabled={toggleEnabled}
          onRefresh={refresh}
        />

        {/* Cascade Tracker - Full width */}
        <div className="section">
          <CascadeTracker />
        </div>

        {/* Metrics Panel - Full width */}
        <div className="section">
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
        <div className="grid-responsive section">
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
        <div className="section">
          <DCAModel
            claims={metrics.initialClaims}
            unemployment={metrics.unemployment}
            dcaModel={dcaModel}
          />
        </div>

        {/* Action Plan - Full width */}
        <div className="section">
          <ActionPlan />
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>
            {isEnabled
              ? 'Live data via CoinGecko & FRED APIs. Click any value to override.'
              : 'Manual mode. Click any value to edit. Values persist in localStorage.'}
          </p>
          <p className="footer-actions">
            <button className="btn-reset" onClick={resetMetrics}>
              Reset to defaults
            </button>
          </p>
          <p className="footer-credit">
            Based on{' '}
            <a
              href="https://www.youtube.com/@intothecryptoverse"
              target="_blank"
              rel="noopener noreferrer"
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
