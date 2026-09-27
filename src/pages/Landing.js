import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import FeaturedCarousel from '../components/FeaturedCarousel';
import ItemCard from '../components/ItemCard';

export default function Landing() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .featuredItems()
      .then((res) => {
        if (Array.isArray(res)) {
          setFeatured(res);
        } else if (res && Array.isArray(res.data)) {
          setFeatured(res.data);
        } else if (res && Array.isArray(res.items)) {
          setFeatured(res.items);
        } else {
          setFeatured([]);
        }
      })
      .catch((e) => {
        setError(e?.message || 'Error loading items');
        setFeatured([]);
      });
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Community clothing exchange</p>
            <h1>Your style deserves more than one life.</h1>
            <p className="hero-lead">
             Give your clothes a second life. Swap what you no longer wear, discover something new, earn points, and keep fashion moving - not filling landfills.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Swapping
              </Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">
                Browse Items
              </Link>
              <Link to="/list" className="btn btn-ghost btn-lg">
                List an Item
              </Link>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <strong>2 modes</strong>
              <span>Direct swap or points redeem</span>
            </div>
            <div className="stat-card">
              <strong>Verified listings</strong>
              <span>Admin-moderated catalog</span>
            </div>
            <div className="stat-card">
              <strong>Full galleries</strong>
              <span>High-quality item photos</span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="container alert alert-warn">
          Could not load featured items. Start the backend API on port 5000.
        </p>
      )}

      {Array.isArray(featured) && featured.length > 0 && (
  <FeaturedCarousel items={featured.slice(0, 5)} />
)}

<section className="section">
  <div className="container">
    <div className="section-head">
      <h2>Fresh on the rack</h2>
      <Link to="/browse" className="text-link">
        View full catalog &rarr;
      </Link>
    </div>
    <div className="item-grid">
      {Array.isArray(featured) && featured.slice(0, 6).map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  </div>
</section>

      <section className="section section-muted">
        <div className="container steps">
          <h2>How ReWear works</h2>
          <ol className="steps-list">
            <li>
              <strong>List</strong> — Upload clear photos and details. Earn points when approved.
            </li>
            <li>
              <strong>Discover</strong> — Browse curated items with full descriptions and galleries.
            </li>
            <li>
              <strong>Exchange</strong> — Request a swap or redeem instantly with your points.
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
