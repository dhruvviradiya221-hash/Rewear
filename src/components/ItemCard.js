import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client';

export default function ItemCard({ item }) {
  const cover = item.images?.[0];
  const available = ['approved', 'available'].includes(item.status);

  return (
    <article className="item-card">
      <Link to={`/items/${item.id}`} className="item-card-media">
        {cover ? (
          <img src={mediaUrl(cover)} alt={item.title} loading="lazy" />
        ) : (
          <div className="item-card-placeholder">No image</div>
        )}
        <span className={`availability-badge ${available ? 'is-open' : ''}`}>
          {available ? 'Available' : item.status}
        </span>
      </Link>
      <div className="item-card-body">
        <p className="item-meta">
          {item.category} · {item.size}
        </p>
        <h3>
          <Link to={`/items/${item.id}`}>{item.title}</Link>
        </h3>
        <p className="item-points">{item.pointsCost} points to redeem</p>
      </div>
    </article>
  );
}
