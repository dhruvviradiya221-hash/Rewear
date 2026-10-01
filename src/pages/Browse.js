import { useState } from 'react';
import { api } from '../api/client';
import ItemCard from '../components/ItemCard';
import LiveStatusBar from '../components/LiveStatusBar';
import { useLiveData } from '../hooks/useLiveData';

const CATEGORIES = ['', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];

export default function Browse() {
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  const { data: items, loading, error, lastUpdated, refresh } = useLiveData(async () => {
    const params = {};
    if (category) params.category = category;
    if (q.trim()) params.q = q.trim();
    return api.listItems(params);
  }, [category, q]);

  const list = Array.isArray(items) ? items : [];

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Browse items</h1>
        <p>Every listing includes a photo gallery and full details for confident swapping.</p>
      </header>

      <LiveStatusBar loading={loading} error={error} lastUpdated={lastUpdated} onRefresh={refresh} />

      <div className="filters-bar">
        <input
          type="search"
          placeholder="Search title, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search items"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map((c) => (
            <option key={c || 'all'} value={c}>
              {c || 'All categories'}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading && !list.length && (
        <div className="item-grid skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      )}
      {!loading && !list.length && !error && <p className="muted">No items match your filters.</p>}

      <div className="item-grid">
        {list.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
