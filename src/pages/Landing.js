import { Link } from 'react-router-dom';
import { api } from '../api/client';
import FeaturedCarousel from '../components/FeaturedCarousel';
import ItemCard from '../components/ItemCard';
import { useLiveData } from '../hooks/useLiveData';

const IMPACT_STATS = [
  { value: '10K+', label: 'Garments given a second life' },
  { value: '2', label: 'Ways to exchange — swap or points' },
  { value: '100%', label: 'Listings reviewed before going live' },
  { value: '24/7', label: 'Browse anytime' },
];

const FEATURES = [
  {
    title: 'Curated quality',
    desc: 'Every listing is moderated so you browse with confidence — no surprises, only style.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Points that reward',
    desc: 'List what you no longer wear, earn points when approved, and redeem pieces you actually want.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12M9 9.5h4.5a2 2 0 010 4H9" />
      </svg>
    ),
  },
  {
    title: 'Planet-first fashion',
    desc: 'Keep clothes in circulation and out of landfills — premium feel, responsible footprint.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 22c4-3 8-7 8-12a8 8 0 10-16 0c0 5 4 9 8 12z" />
        <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
  },
];

export default function Landing() {
  const { data: featured, loading, error } = useLiveData(() => api.featuredItems(), []);

  const items = Array.isArray(featured) ? featured : [];

  return (
    <>
      <section className="hero hero-premium">
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-glow hero-glow-a" aria-hidden="true" />
        <div className="hero-glow hero-glow-b" aria-hidden="true" />
        <div className="container hero-grid hero-grid-premium">
          <div className="hero-copy animate-in">
            <div className="hero-badge">
              <span className="hero-badge-dot" aria-hidden="true" />
              Sustainable fashion platform
            </div>
            <p className="eyebrow">Community clothing exchange</p>
            <h1>
              Wear the story.
              <span className="hero-title-accent"> Swap the rest.</span>
            </h1>
            <p className="hero-lead">
              ReWear is a premium circular wardrobe — list pieces you love but no longer wear,
              discover curated pre-loved style, and exchange through direct swaps or instant points.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg btn-shine">
                Start Swapping
              </Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">
                Browse Catalog
              </Link>
            </div>
            <p className="hero-trust">
              Trusted moderation · Curated catalog · Built for observers who notice the details
            </p>
          </div>
          <div className="hero-visual animate-in delay-1" aria-hidden="true">
            <div className="hero-card-stack">
              <div className="hero-float-card hero-float-card-1">
                <span className="hero-float-label">Swap</span>
                <strong>Verified listing</strong>
                <span className="hero-float-meta">Approved in under 24h</span>
              </div>
              <div className="hero-float-card hero-float-card-2">
                <span className="hero-float-label">Your balance</span>
                <strong className="hero-float-points">+120 pts</strong>
                <span className="hero-float-meta">Redeem on any item</span>
              </div>
              <div className="hero-orbit">
                <div className="hero-orbit-ring" />
                <div className="hero-orbit-core">
                  <span>Re</span>
                  <span>Wear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="marquee-wrap" aria-hidden="true">
          <div className="marquee-track">
            <span>Fashion has more than one life</span>
            <span>Earn while you list</span>
            <span>Wear it.Share it.Rewear it.</span>
            <span>Less waste, more style</span>
            <span>Fashion has more than one life</span>
            <span>Earn while you list</span>
            <span>Wear it.Share it.Rewear it.</span>
            <span>Less waste, more style</span>
          </div>
        </div>
      </section>

      <section className="impact-strip">
        <div className="container impact-grid">
          {IMPACT_STATS.map((stat) => (
            <div key={stat.label} className="impact-cell">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p className="container alert alert-warn">
          Could not load featured items. Make sure the backend API is running on port 5000.
        </p>
      )}

      {items.length > 0 && (
        <div className="carousel-shell">
          <FeaturedCarousel items={items.slice(0, 5)} />
        </div>
      )}

      <section className="section section-premium">
        <div className="container">
          <div className="section-head section-head-center">
            <p className="eyebrow">The collection</p>
            <h2>Fresh on the rack</h2>
            <p className="section-sub">
              Hand-picked pieces from the community — approved listings ready to swap or redeem.
            </p>
          </div>
          {loading && !items.length ? (
            <div className="item-grid skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="item-grid item-grid-premium">
              {items.slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
          <div className="section-cta-row">
            <Link to="/browse" className="btn btn-primary btn-lg">
              View full catalog
            </Link>
            <Link to="/list" className="btn btn-ghost btn-lg">
              List an item
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-features">
        <div className="container">
          <div className="section-head section-head-center">
            <p className="eyebrow">Why ReWear</p>
            <h2>Designed to feel premium — because circular should not look cheap</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <div>
            <p className="eyebrow eyebrow-light">Ready when you are</p>
            <h2>Your atyle deserves more than one life.</h2>
          </div>
          <div className="cta-band-actions">
            <Link to="/signup" className="btn btn-primary btn-lg btn-shine">
              Create free account
            </Link>
            <Link to="/browse" className="btn btn-outline-light btn-lg">
              Explore catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
