const bcrypt = require('bcryptjs');
const { db, persist, nextId } = require('./database');

const localCatalog = [
  ['01-teal-tie-top.jpeg', 'Teal Tie-Front Top', 'Tops', 'Blouse', 'teal, tie-front'],
  ['02-floral-dress.jpeg', 'Floral Dress', 'Dresses', 'Dress', 'floral, occasion'],
  ['03-navy-evening-dress.jpeg', 'Navy Evening Dress', 'Dresses', 'Evening dress', 'navy, occasion'],
  ['04-denim-sherpa-jacket.jpeg', 'Denim Sherpa Jacket', 'Outerwear', 'Jacket', 'denim, sherpa'],
  ['05-brown-sherpa-jacket.jpeg', 'Brown Sherpa Jacket', 'Outerwear', 'Jacket', 'brown, sherpa'],
  ['06-red-wide-leg-pants.jpeg', 'Red Wide-Leg Pants', 'Bottoms', 'Trousers', 'red, wide-leg'],
  ['07-olive-cargo-pants.jpeg', 'Olive Cargo Pants', 'Bottoms', 'Cargo pants', 'olive, cargo'],
  ['08-gold-sandals.jpeg', 'Gold Sandals', 'Footwear', 'Sandals', 'gold, sandals'],
  ['09-accessories-set.jpeg', 'Accessories Set', 'Accessories', 'Accessories', 'accessories'],
  ['10-bow-flats.jpeg', 'Bow Ballet Flats', 'Footwear', 'Flats', 'bow, flats'],
  ['11-black-sneakers.jpeg', 'Black Sneakers', 'Footwear', 'Sneakers', 'black, sneakers'],
  ['12-off-shoulder-top-skirt.jpeg', 'Off-Shoulder Top and Skirt', 'Tops', 'Two-piece set', 'off-shoulder, set'],
  ['13-black-crop-top.jpeg', 'Black Crop Top', 'Tops', 'Crop top', 'black, crop top'],
];

function seedLocalCatalog(state) {
  const uploader =
    state.users.find((user) => user.email === 'demo@rewear.com') ||
    state.users.find((user) => user.role !== 'admin') ||
    state.users[0];
  if (!uploader) return;

  for (const [filename, title, category, type, tags] of localCatalog) {
    const imagePath = `/uploads/catalog/${filename}`;
    if (state.itemImages.some((image) => image.path === imagePath)) continue;

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
  if (state.users.length > 0) {
    seedLocalCatalog(state);
    persist();
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
    name: 'dhruv viradiya',
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
    item.images.forEach((path, sort_order) => {
      state.itemImages.push({
        id: nextId('itemImages'),
        item_id: itemId,
        path,
        sort_order,
      });
    });
  }

  seedLocalCatalog(state);
  persist();
  console.log('Seed complete: admin@rewear.com / admin123, demo@rewear.com / demo1234,dhruvviradiya22@gmail.com/123456');
}

module.exports = { seed };
