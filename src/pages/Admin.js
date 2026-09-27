import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api/client';

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const [p, a] = await Promise.all([api.adminPending(), api.adminAllItems()]);
      setPending(p);
      setAll(a);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id, action) => {
    setMsg('');
    try {
      const res = await api.adminModerate(id, action);
      setMsg(res.message);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this listing permanently?')) return;
    try {
      await api.adminDelete(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Admin panel</h1>
        <p>Approve new listings, reject spam, and remove inappropriate items.</p>
      </header>

      {msg && <p className="alert alert-success">{msg}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      <section className="section-block">
        <h2>Pending approval ({pending.length})</h2>
        {!pending.length && <p className="muted">Queue is clear.</p>}
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
                      {item.images?.[0] && (
                        <img src={mediaUrl(item.images[0])} alt="" />
                      )}
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
