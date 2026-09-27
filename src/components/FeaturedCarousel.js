import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client';

export default function FeaturedCarousel({ items }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items?.length) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items]);

  if (!items?.length) return null;

  const item = items[index];
  const image = item.images?.[0];

  return (
    <section className="featured-carousel" aria-label="Featured items">
      <div className="carousel-visual">
        {image && (
          <img
            key={item.id}
            src={mediaUrl(image)}
            alt={item.title}
            className="carousel-image"
          />
        )}
        <div className="carousel-overlay" />
      </div>
      <div className="carousel-content">
        <p className="eyebrow">Featured listing</p>
        <h2>{item.title}</h2>
        <p className="carousel-desc">{item.description}</p>
        <div className="carousel-actions">
          <Link to={`/items/${item.id}`} className="btn btn-primary">
            View item
          </Link>
          <Link to="/browse" className="btn btn-outline-light">
            Browse all
          </Link>
        </div>
        <div className="carousel-dots" role="tablist" aria-label="Featured slides">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'active' : ''}
              onClick={() => setIndex(i)}
              aria-label={`Show ${it.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
