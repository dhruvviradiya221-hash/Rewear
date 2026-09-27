import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState({ ongoing: [], completed: [] });
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [myItems, mySwaps] = await Promise.all([api.myItems(), api.mySwaps()]);
      setItems(myItems);
      setSwaps(mySwaps);
      await refreshUser();
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (id, action) => {
    try {
      await api.respondSwap(id, action);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container page">
      <header className="page-header dashboard-head">
        <div>
          <h1>Your dashboard</h1>
          <p>Profile, points, listings, and swap activity in one place.</p>
        </div>
        <Link to="/list" className="btn btn-primary">
          + List item
        </Link>
      </header>

      {location.state?.flash && (
        <p className="alert alert-success">{location.state.flash}</p>
      )}
      {error && <p className="alert alert-error">{error}</p>}

      <section className="dashboard-profile">
        <div className="profile-card">
          <p className="eyebrow">Profile</p>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
        <div className="profile-card points-card">
          <p className="eyebrow">Points balance</p>
          <p className="points-big">{user?.points ?? 0}</p>
          <p className="muted">Use points to redeem items instantly.</p>
        </div>
      </section>

      <section className="section-block">
        <h2>Your listings</h2>
        {!items.length && <p className="muted">No items yet. List your first piece!</p>}
        <div className="dashboard-items">
          {items.map((item) => (
            <article key={item.id} className="dash-item">
              {item.images?.[0] ? (
                <img src={mediaUrl(item.images[0])} alt={item.title} />
              ) : (
                <div className="dash-item-placeholder" />
              )}
              <div>
                <Link to={`/items/${item.id}`}>
                  <strong>{item.title}</strong>
                </Link>
                <p className="muted">
                  {item.status} · {item.pointsCost} pts
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Ongoing swaps</h2>
        {!swaps.ongoing.length && <p className="muted">No active swap requests.</p>}
        <ul className="swap-list">
          {swaps.ongoing.map((s) => (
            <li key={s.id} className="swap-row">
              <div>
                <strong>{s.itemTitle}</strong>
                <p className="muted">
                  {s.kind} · {s.status} · You are {s.role}
                </p>
              </div>
              {s.role === 'owner' && s.status === 'pending' && s.kind === 'swap' && (
                <div className="swap-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => respond(s.id, 'accept')}>
                    Accept
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => respond(s.id, 'reject')}>
                    Decline
                  </button>
                </div>
              )}
              {s.role === 'owner' && s.status === 'accepted' && (
                <button type="button" className="btn btn-secondary" onClick={() => respond(s.id, 'complete')}>
                  Mark complete
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="section-block">
        <h2>Completed</h2>
        {!swaps.completed.length && <p className="muted">No completed exchanges yet.</p>}
        <ul className="swap-list compact">
          {swaps.completed.map((s) => (
            <li key={s.id}>
              {s.itemTitle} — {s.kind}, {s.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
