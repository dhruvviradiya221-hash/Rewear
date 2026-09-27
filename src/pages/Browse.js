import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ItemCard from '../components/ItemCard';

const CATEGORIES = ['', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear'];

export default function Browse() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (q.trim()) params.q = q.trim();
    api
      .listItems(params)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, q]);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Browse items</h1>
        <p>Every listing includes a photo gallery and full details for confident swapping.</p>
      </header>

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
      {loading && <p className="muted">Loading catalog…</p>}
      {!loading && !items.length && <p className="muted">No items match your filters.</p>}

      <div className="item-grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
