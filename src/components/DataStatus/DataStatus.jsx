import { useState } from 'react';
import { formatLastUpdate } from '../../lib/api';

/**
 * DataStatus - Shows live data status and toggle
 * FRED API key is configured via VITE_FRED_API_KEY environment variable
 */

const styles = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--space-2)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flexWrap: 'wrap',
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
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
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
    background: 'var(--color-green)',
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
  refreshBtn: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-blue)',
    cursor: 'pointer',
    background: 'transparent',
    border: '1px solid var(--color-blue)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px 8px',
  },
  refreshBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  errorText: {
    fontSize: 'var(--text-xs)',
    color: 'var(--color-red)',
    marginTop: 'var(--space-2)',
  },
  hint: {
    fontSize: 'var(--text-xs)',
    color: 'var(--text-dim)',
    marginTop: 'var(--space-2)',
  },
};

export function DataStatus({
  isEnabled,
  hasFredKey,
  isFetching,
  lastUpdate,
  errors,
  onToggleEnabled,
  onRefresh,
}) {
  const hasErrors = errors?.crypto || errors?.macro;
  const isLive = isEnabled && !hasErrors;

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.left}>
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

          <div style={styles.sourceGroup}>
            <span style={styles.sourceLabel}>BTC/Gold:</span>
            <span style={styles.sourceValue}>
              {isEnabled ? formatLastUpdate(lastUpdate?.crypto) : 'Manual'}
            </span>
          </div>

          <div style={styles.sourceGroup}>
            <span style={styles.sourceLabel}>Macro:</span>
            <span style={styles.sourceValue}>
              {isEnabled && hasFredKey
                ? formatLastUpdate(lastUpdate?.macro)
                : hasFredKey
                ? 'Manual'
                : 'No env key'}
            </span>
          </div>
        </div>

        <div style={styles.right}>
          {isEnabled && (
            <button
              style={{
                ...styles.refreshBtn,
                ...(isFetching ? styles.refreshBtnDisabled : {}),
              }}
              onClick={onRefresh}
              disabled={isFetching}
            >
              {isFetching ? 'Fetching...' : 'Refresh'}
            </button>
          )}

          <div
            style={{
              ...styles.toggle,
              ...(isEnabled ? styles.toggleActive : {}),
            }}
            onClick={() => onToggleEnabled(!isEnabled)}
            title={isEnabled ? 'Disable live data' : 'Enable live data'}
          >
            <div
              style={{
                ...styles.toggleThumb,
                ...(isEnabled ? styles.toggleThumbActive : {}),
              }}
            />
          </div>
        </div>
      </div>

      {hasErrors && (
        <div style={styles.errorText}>
          {errors.crypto && `Crypto: ${errors.crypto}. `}
          {errors.macro && `Macro: ${errors.macro}`}
        </div>
      )}

      {!hasFredKey && (
        <div style={styles.hint}>
          Macro data requires VITE_FRED_API_KEY in .env file
        </div>
      )}
    </div>
  );
}

export default DataStatus;
