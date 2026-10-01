import { useState } from 'react';
import { api, mediaUrl } from '../api/client';
import LiveStatusBar from '../components/LiveStatusBar';
import { useLiveData } from '../hooks/useLiveData';

export default function Admin() {
  const [msg, setMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const { data, loading, error, lastUpdated, refresh } = useLiveData(async () => {
    const [pending, all] = await Promise.all([api.adminPending(), api.adminAllItems()]);
    return { pending, all };
  }, []);

  const pending = data?.pending || [];
  const all = data?.all || [];

  const moderate = async (id, action) => {
    setMsg('');
    setActionError('');
    try {
      const res = await api.adminModerate(id, action);
      setMsg(res.message);
      await refresh();
    } catch (e) {
      setActionError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    setActionError('');
    try {
      await api.adminDelete(id);
      await refresh();
    } catch (e) {
      setActionError(e.message);
    }
  };

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Admin panel</h1>
        <p>Approve new listings, reject spam, and remove inappropriate items.</p>
      </header>

      <LiveStatusBar loading={loading} error={error} lastUpdated={lastUpdated} onRefresh={refresh} />

      {msg && <p className="alert alert-success">{msg}</p>}
      {(error || actionError) && <p className="alert alert-error">{actionError || error}</p>}

      <section className="section-block">
        <h2>Pending approval ({pending.length})</h2>
        {!pending.length && !loading && <p className="muted">Queue is clear.</p>}
        <div className="admin-grid">
          {pending.map((item) => (
            <article key={item.id} className="admin-card">
              {item.images?.[0] && (
                <img src={mediaUrl(item.images[0])} alt={item.title} className="admin-thumb" />
              )}
              <div>
                <h3>{item.title}</h3>
                <p className="muted">
                  {item.uploader?.name} · {item.category} · {item.size}
                </p>
                <p className="admin-desc">{item.description}</p>
                <div className="admin-actions">
                  <button type="button" className="btn btn-primary" onClick={() => moderate(item.id, 'approve')}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => moderate(item.id, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>All listings</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Uploader</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {all.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-table-item">
                      {item.images?.[0] && <img src={mediaUrl(item.images[0])} alt="" />}
                      <span>{item.title}</span>
                    </div>
                  </td>
                  <td>{item.status}</td>
                  <td>{item.uploader?.name}</td>
                  <td>
                    <button type="button" className="btn btn-ghost danger" onClick={() => remove(item.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
