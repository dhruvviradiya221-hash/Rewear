import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import ImageGallery from '../components/ImageGallery';
import LiveStatusBar from '../components/LiveStatusBar';
import { useAuth } from '../context/AuthContext';
import { useLiveData } from '../hooks/useLiveData';

export default function ItemDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, lastUpdated, refresh } = useLiveData(
    () => api.getItem(id).then((res) => res.item),
    [id]
  );

  const item = data;
  const available = item && ['approved', 'available'].includes(item.status);
  const isOwner = user && item && user.id === item.userId;

  const onSwap = async () => {
    setMessage('');
    setActionError('');
    setBusy(true);
    try {
      const res = await api.swapRequest(id);
      setMessage(res.message);
      await refresh();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onRedeem = async () => {
    setMessage('');
    setActionError('');
    setBusy(true);
    try {
      const res = await api.redeemItem(id);
      setMessage(res.message);
      await refreshUser();
      await refresh();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !item) {
    return (
      <div className="container page">
        <p className="alert alert-error">{error}</p>
        <Link to="/browse">← Back to browse</Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container page item-detail">
      <Link to="/browse" className="back-link">
        ← Browse
      </Link>

      <LiveStatusBar loading={loading} error={error} lastUpdated={lastUpdated} onRefresh={refresh} />

      <div className="detail-grid">
        <ImageGallery images={item.images} title={item.title} />
        <div className="detail-panel">
          <p className="eyebrow">
            {item.category} · {item.type}
          </p>
          <h1>{item.title}</h1>
          <p className={`status-line ${available ? 'open' : 'closed'}`}>
            Status: <strong>{item.status}</strong>
          </p>
          <p className="detail-desc">{item.description}</p>

          <dl className="detail-specs">
            <div>
              <dt>Size</dt>
              <dd>{item.size}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{item.condition}</dd>
            </div>
            <div>
              <dt>Redeem cost</dt>
              <dd>{item.pointsCost} points</dd>
            </div>
          </dl>

          {item.tags?.length > 0 && (
            <div className="tag-row">
              {item.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="uploader-card">
            <p className="uploader-label">Listed by</p>
            <p className="uploader-name">{item.uploader?.name}</p>
            <p className="uploader-meta">{item.uploader?.email}</p>
          </div>

          {message && <p className="alert alert-success">{message}</p>}
          {actionError && <p className="alert alert-error">{actionError}</p>}

          {user && !isOwner && available && (
            <div className="action-row">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={onSwap}>
                Swap Request
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy || user.points < item.pointsCost}
                onClick={onRedeem}
              >
                Redeem via Points ({item.pointsCost})
              </button>
            </div>
          )}

          {!user && available && (
            <p className="muted">
              <Link to="/login">Log in</Link> to request a swap or redeem with points.
            </p>
          )}

          {isOwner && <p className="muted">This is your listing.</p>}
        </div>
      </div>
    </div>
  );
}
