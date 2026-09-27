import { useState } from 'react';
import { mediaUrl } from '../api/client';

export default function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  if (!images?.length) {
    return <div className="gallery-empty">No photos available</div>;
  }

  const main = images[active] || images[0];

  return (
    <div className="image-gallery">
      <div className="gallery-main">
        <img src={mediaUrl(main)} alt={`${title} (${active + 1} of ${images.length})`} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={i === active ? 'thumb active' : 'thumb'}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={mediaUrl(src)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
