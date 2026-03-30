import { useState } from 'react';
import { formatLastUpdate } from '../../lib/api';

/**
 * DataStatus - Shows live data status and API settings
 */

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--space-2)',
  },
  title: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--weight-medium)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  statusDotLive: {
    background: 'var(--color-green)',
    boxShadow: '0 0 6px var(--color-green)',
  },
  statusDotManual: {
    background: 'var(--color-gray)',
  },
  statusDotError: {
    background: 'var(--color-red)',
  },
  toggleBtn: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-blue)',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: '4px 8px',
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
    alignItems: 'center',
  },
  sourceGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  sourceLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
  },
  sourceValue: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  refreshBtn: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-blue)',
    cursor: 'pointer',
    background: 'transparent',
    border: '1px solid var(--color-blue)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px 8px',
    marginLeft: 'auto',
  },
  refreshBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  settingsPanel: {
    marginTop: 'var(--space-3)',
    paddingTop: 'var(--space-3)',
    borderTop: '1px solid var(--border-subtle)',
  },
  settingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-2)',
  },
  settingsLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-muted)',
    minWidth: 100,
  },
  input: {
    flex: 1,
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-primary)',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 8px',
  },
  toggle: {
    position: 'relative',
    width: 36,
    height: 20,
    background: 'var(--border-default)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background var(--transition-normal)',
  },
  toggleActive: {
    background: 'var(--color-blue)',
  },
  toggleThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 16,
    height: 16,
    background: 'var(--text-primary)',
    borderRadius: '50%',
    transition: 'transform var(--transition-normal)',
  },
  toggleThumbActive: {
    transform: 'translateX(16px)',
  },
  hint: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-1)',
  },
  link: {
    color: 'var(--color-blue)',
    textDecoration: 'none',
  },
  errorText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-red)',
    marginTop: 'var(--space-1)',
  },
};

export function DataStatus({
  isEnabled,
  fredApiKey,
  isFetching,
  lastUpdate,
  errors,
  onToggleEnabled,
  onUpdateFredApiKey,
  onRefresh,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(fredApiKey);

  const hasErrors = errors?.crypto || errors?.macro;
  const isLive = isEnabled && !hasErrors;

  const handleApiKeySubmit = () => {
    onUpdateFredApiKey(tempApiKey);
  };

  const handleApiKeyKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApiKeySubmit();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <div
            style={{
              ...styles.statusDot,
              ...(hasErrors
                ? styles.statusDotError
                : isLive
                ? styles.statusDotLive
                : styles.statusDotManual),
            }}
          />
          {isLive ? 'Live Data' : isEnabled && hasErrors ? 'Error' : 'Manual Mode'}
        </div>
        <button
          style={styles.toggleBtn}
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.sourceGroup}>
          <span style={styles.sourceLabel}>BTC/Gold:</span>
          <span style={styles.sourceValue}>
            {isEnabled ? formatLastUpdate(lastUpdate?.crypto) : 'Manual'}
          </span>
        </div>

        <div style={styles.sourceGroup}>
          <span style={styles.sourceLabel}>Macro:</span>
          <span style={styles.sourceValue}>
            {isEnabled && fredApiKey
              ? formatLastUpdate(lastUpdate?.macro)
              : fredApiKey
              ? 'Manual'
              : 'No API key'}
          </span>
        </div>

        {isEnabled && (
          <button
            style={{
              ...styles.refreshBtn,
              ...(isFetching ? styles.refreshBtnDisabled : {}),
            }}
            onClick={onRefresh}
            disabled={isFetching}
          >
            {isFetching ? 'Fetching...' : 'Refresh Now'}
          </button>
        )}
      </div>

      {hasErrors && (
        <div style={styles.errorText}>
          {errors.crypto && `Crypto: ${errors.crypto}. `}
          {errors.macro && `Macro: ${errors.macro}`}
        </div>
      )}

      {showSettings && (
        <div style={styles.settingsPanel}>
          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>Auto-fetch:</span>
            <div
              style={{
                ...styles.toggle,
                ...(isEnabled ? styles.toggleActive : {}),
              }}
              onClick={() => onToggleEnabled(!isEnabled)}
            >
              <div
                style={{
                  ...styles.toggleThumb,
                  ...(isEnabled ? styles.toggleThumbActive : {}),
                }}
              />
            </div>
            <span style={{ ...styles.sourceValue, marginLeft: 8 }}>
              {isEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <div style={styles.settingsRow}>
            <span style={styles.settingsLabel}>FRED API Key:</span>
            <input
              type="password"
              style={styles.input}
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              onBlur={handleApiKeySubmit}
              onKeyDown={handleApiKeyKeyDown}
              placeholder="Enter your FRED API key"
            />
          </div>

          <div style={styles.hint}>
            Get a free FRED API key at{' '}
            <a
              href="https://fred.stlouisfed.org/docs/api/api_key.html"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              fred.stlouisfed.org
            </a>
            . BTC & Gold prices work without a key (via CoinGecko).
          </div>
        </div>
      )}
    </div>
  );
}

export default DataStatus;
