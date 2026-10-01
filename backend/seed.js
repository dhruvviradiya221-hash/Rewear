const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, persist, nextId } = require('./database');

const localCatalog = [
  ['01-teal-tie-top.jpeg', 'Teal Tie-Front Top', 'Tops', 'Blouse', 'teal, tie-front', 'https://images.unsplash.com/photo-1564257570460-3a2a4f1c0c8a?w=1200&q=85'],
  ['02-floral-dress.jpeg', 'Floral Dress', 'Dresses', 'Dress', 'floral, occasion', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85'],
  ['03-navy-evening-dress.jpeg', 'Navy Evening Dress', 'Dresses', 'Evening dress', 'navy, occasion', 'https://images.unsplash.com/photo-1515372039744-b72996277fc8?w=1200&q=85'],
  ['04-denim-sherpa-jacket.jpeg', 'Denim Sherpa Jacket', 'Outerwear', 'Jacket', 'denim, sherpa', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=85'],
  ['05-brown-sherpa-jacket.jpeg', 'Brown Sherpa Jacket', 'Outerwear', 'Jacket', 'brown, sherpa', 'https://images.unsplash.com/photo-1576995853123-5a10305d93b0?w=1200&q=85'],
  ['06-red-wide-leg-pants.jpeg', 'Red Wide-Leg Pants', 'Bottoms', 'Trousers', 'red, wide-leg', 'https://images.unsplash.com/photo-1594938298604-c8148c4dae35?w=1200&q=85'],
  ['07-olive-cargo-pants.jpeg', 'Olive Cargo Pants', 'Bottoms', 'Cargo pants', 'olive, cargo', 'https://images.unsplash.com/photo-1473966968600-fa801b869a7a?w=1200&q=85'],
  ['08-gold-sandals.jpeg', 'Gold Sandals', 'Footwear', 'Sandals', 'gold, sandals', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=85'],
  ['09-accessories-set.jpeg', 'Accessories Set', 'Accessories', 'Accessories', 'accessories', 'https://images.unsplash.com/photo-1520904224775-0f0220bcfd46?w=1200&q=85'],
  ['10-bow-flats.jpeg', 'Bow Ballet Flats', 'Footwear', 'Flats', 'bow, flats', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=85'],
  ['11-black-sneakers.jpeg', 'Black Sneakers', 'Footwear', 'Sneakers', 'black, sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=85'],
  ['12-off-shoulder-top-skirt.jpeg', 'Off-Shoulder Top and Skirt', 'Tops', 'Two-piece set', 'off-shoulder, set', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=85'],
  ['13-black-crop-top.jpeg', 'Black Crop Top', 'Tops', 'Crop top', 'black, crop top', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=85'],
];

const fallbackByFilename = Object.fromEntries(
  localCatalog.map(([filename, , , , , fallback]) => [filename, fallback])
);

function resolveImagePath(filename) {
  const localPath = path.join(__dirname, 'uploads', 'catalog', filename);
  if (fs.existsSync(localPath)) {
    return `/uploads/catalog/${filename}`;
  }
  return fallbackByFilename[filename] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=85';
}

function migrateBrokenImages(state) {
  let changed = false;
  for (const image of state.itemImages) {
    if (!image.path.startsWith('/uploads/')) continue;
    const file = path.join(__dirname, image.path.slice(1));
    if (fs.existsSync(file)) continue;
    const filename = path.basename(image.path);
    const fallback = fallbackByFilename[filename];
    if (fallback && image.path !== fallback) {
      image.path = fallback;
      changed = true;
    }
  }
  return changed;
}

function seedLocalCatalog(state) {
  const uploader =
    state.users.find((user) => user.email === 'demo@rewear.com') ||
    state.users.find((user) => user.role !== 'admin') ||
    state.users[0];
  if (!uploader) return;

  for (const [filename, title, category, type, tags] of localCatalog) {
    const imagePath = resolveImagePath(filename);
    const existingImage = state.itemImages.find((image) => {
      if (image.path === imagePath) return true;
      if (image.path.endsWith(`/${filename}`)) return true;
      return false;
    });

    if (existingImage) {
      if (existingImage.path !== imagePath && !existingImage.path.startsWith('http')) {
        existingImage.path = imagePath;
      }
      continue;
    }

    const itemId = nextId('items');
    state.items.push({
      id: itemId,
      user_id: uploader.id,
      title,
      description: 'Pre-loved item listed for exchange. Please refer to the photos for details.',
      category,
      type,
      size: 'Not specified',
      condition: 'Good',
      tags,
      points_cost: 25,
      status: 'available',
      created_at: new Date().toISOString(),
    });
    state.itemImages.push({
      id: nextId('itemImages'),
      item_id: itemId,
      path: imagePath,
      sort_order: 0,
    });
  }
}

function seed() {
  const state = db.getState();
  const migrated = migrateBrokenImages(state);

  if (state.users.length > 0) {
    const before = JSON.stringify(state.itemImages);
    seedLocalCatalog(state);
    if (migrated || JSON.stringify(state.itemImages) !== before) {
      persist();
    }
    return;
  }

  const adminId = nextId('users');
  state.users.push({
    id: adminId,
    email: 'admin@rewear.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    name: 'ReWear Admin',
    points: 1000,
    role: 'admin',
    created_at: new Date().toISOString(),
  });

  const demoId = nextId('users');
  state.users.push({
    id: demoId,
    email: 'demo@rewear.com',
    password_hash: bcrypt.hashSync('demo1234', 10),
    name: 'Alex Morgan',
    points: 120,
    role: 'user',
    created_at: new Date().toISOString(),
  });

  const featured = [
    {
      title: 'Vintage Denim Jacket',
      description:
        'Classic medium-wash denim jacket with a relaxed fit. Gently worn with authentic fading—perfect for layering year-round.',
      category: 'Outerwear',
      type: 'Jacket',
      size: 'M',
      condition: 'Good',
      tags: 'vintage,denim,streetwear',
      points: 35,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=85',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93b0?w=1200&q=85',
      ],
    },
    {
      title: 'Organic Cotton Tee',
      description:
        'Soft ivory organic cotton t-shirt, minimal branding. Breathable fabric ideal for everyday wear.',
      category: 'Tops',
      type: 'T-Shirt',
      size: 'L',
      condition: 'Like New',
      tags: 'minimal,sustainable,cotton',
      points: 20,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=85'],
    },
    {
      title: 'Merino Wool Sweater',
      description:
        'Heather grey merino blend crewneck. Lightweight warmth without bulk—office to weekend ready.',
      category: 'Tops',
      type: 'Sweater',
      size: 'S',
      condition: 'Excellent',
      tags: 'wool,layering,neutral',
      points: 40,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=85',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb088d5?w=1200&q=85',
      ],
    },
    {
      title: 'Tailored Linen Trousers',
      description:
        'Sand-colored linen blend trousers with a clean taper. Ideal for warm climates and smart-casual events.',
      category: 'Bottoms',
      type: 'Trousers',
      size: '32',
      condition: 'Good',
      tags: 'linen,summer,formal-casual',
      points: 30,
      images: ['https://images.unsplash.com/photo-1594938298604-c8148c4dae35?w=1200&q=85'],
    },
    {
      title: 'Floral Midi Dress',
      description:
        'Midi-length dress with muted botanical print. Flowy silhouette, fully lined, event-ready.',
      category: 'Dresses',
      type: 'Midi Dress',
      size: 'M',
      condition: 'Like New',
      tags: 'floral,dress,occasion',
      points: 45,
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85',
        'https://images.unsplash.com/photo-1515372039744-b72996277fc8?w=1200&q=85',
      ],
    },
    {
      title: 'Leather Chelsea Boots',
      description:
        'Brown leather Chelsea boots with subtle patina. Resoled once, sturdy and versatile.',
      category: 'Footwear',
      type: 'Boots',
      size: '9',
      condition: 'Good',
      tags: 'leather,footwear,classic',
      points: 55,
      images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&q=85'],
    },
  ];

  for (const item of featured) {
    const itemId = nextId('items');
    state.items.push({
      id: itemId,
      user_id: demoId,
      title: item.title,
      description: item.description,
      category: item.category,
      type: item.type,
      size: item.size,
      condition: item.condition,
      tags: item.tags,
      points_cost: item.points,
      status: 'available',
      created_at: new Date().toISOString(),
    });
    item.images.forEach((imagePath, sort_order) => {
      state.itemImages.push({
        id: nextId('itemImages'),
        item_id: itemId,
        path: imagePath,
        sort_order,
      });
    });
  }

  seedLocalCatalog(state);
  persist();
  console.log('Seed complete: admin@rewear.com / admin123, demo@rewear.com / demo1234');
}

module.exports = { seed };
