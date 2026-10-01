function formatTime(date) {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function LiveStatusBar({ loading, error, lastUpdated, onRefresh }) {
  return (
    <div className="live-status-bar">
      <div className="container live-status-inner">
        <span className={`live-dot ${loading ? 'is-syncing' : error ? 'is-error' : 'is-live'}`} />
        <span className="live-status-text">
          {loading && !lastUpdated
            ? 'Loading latest catalog…'
            : error
              ? 'Connection issue — showing last known data'
              : `Live · Updated ${formatTime(lastUpdated)}`}
        </span>
        <button type="button" className="btn btn-ghost btn-sm live-refresh" onClick={onRefresh} disabled={loading}>
          Refresh
        </button>
      </div>
    </div>
  );
}
