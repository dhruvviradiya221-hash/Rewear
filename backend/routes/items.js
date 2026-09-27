const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  db,
  mapItem,
  getItemImages,
  getUploader,
  persist,
  nextId,
} = require('../database');
const { authRequired } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

const PUBLIC_STATUSES = ['approved', 'available'];

function listPublicItems(filters = {}) {
  const state = db.getState();
  let rows = state.items.filter((i) => PUBLIC_STATUSES.includes(i.status));
  if (filters.category) rows = rows.filter((i) => i.category === filters.category);
  if (filters.size) rows = rows.filter((i) => i.size === filters.size);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.toLowerCase().includes(q)
    );
  }
  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return rows.map((row) =>
    mapItem(row, getItemImages(row.id), getUploader(row.user_id))
  );
}

router.get('/featured', (_req, res) => {
  res.json(listPublicItems().slice(0, 8));
});

router.get('/', (req, res) => {
  res.json(
    listPublicItems({
      category: req.query.category,
      size: req.query.size,
      q: req.query.q,
    })
  );
});

router.get('/:id', optionalAuth, (req, res) => {
  const row = db.getState().items.find((i) => i.id === Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Item not found' });
  const publicOk = ['approved', 'available', 'swapped', 'redeemed'].includes(row.status);
  const ownerOk = req.user && req.user.id === row.user_id;
  const adminOk = req.user?.role === 'admin';
  if (!publicOk && !ownerOk && !adminOk) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({
    item: mapItem(row, getItemImages(row.id), getUploader(row.user_id)),
  });
});

router.post('/', authRequired, upload.array('images', 8), (req, res) => {
  const {
    title,
    description,
    category,
    type,
    size,
    condition,
    tags,
    pointsCost,
  } = req.body;

  if (!title || !description || !category || !type || !size || !condition) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!req.files?.length) {
    return res.status(400).json({ error: 'At least one image is required' });
  }

  const state = db.getState();
  const itemId = nextId('items');
  const row = {
    id: itemId,
    user_id: req.user.id,
    title: title.trim(),
    description: description.trim(),
    category,
    type,
    size,
    condition,
    tags: (tags || '').trim(),
    points_cost: parseInt(pointsCost, 10) || 25,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  state.items.push(row);
  req.files.forEach((file, i) => {
    state.itemImages.push({
      id: nextId('itemImages'),
      item_id: itemId,
      path: `/uploads/${file.filename}`,
      sort_order: i,
    });
  });
  persist();

  res.status(201).json({
    item: mapItem(row, getItemImages(itemId), getUploader(row.user_id)),
    message: 'Item submitted for admin approval',
  });
});

router.post('/:id/swap-request', authRequired, (req, res) => {
  const state = db.getState();
  const item = state.items.find((i) => i.id === Number(req.params.id));
  if (!item || !PUBLIC_STATUSES.includes(item.status)) {
    return res.status(400).json({ error: 'Item is not available for swap' });
  }
  if (item.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot swap your own item' });
  }
  const existing = state.swaps.find(
    (s) =>
      s.item_id === item.id &&
      s.requester_id === req.user.id &&
      s.status === 'pending'
  );
  if (existing) {
    return res.status(409).json({ error: 'Swap request already pending' });
  }
  const swapId = nextId('swaps');
  state.swaps.push({
    id: swapId,
    item_id: item.id,
    requester_id: req.user.id,
    owner_id: item.user_id,
    kind: 'swap',
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  persist();
  res.status(201).json({ swapId, message: 'Swap request sent' });
});

router.post('/:id/redeem', authRequired, (req, res) => {
  const state = db.getState();
  const item = state.items.find((i) => i.id === Number(req.params.id));
  if (!item || !PUBLIC_STATUSES.includes(item.status)) {
    return res.status(400).json({ error: 'Item is not available' });
  }
  if (item.user_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot redeem your own item' });
  }
  const user = state.users.find((u) => u.id === req.user.id);
  if (user.points < item.points_cost) {
    return res.status(400).json({ error: 'Insufficient points' });
  }
  const owner = state.users.find((u) => u.id === item.user_id);
  user.points -= item.points_cost;
  owner.points += Math.floor(item.points_cost * 0.8);
  item.status = 'redeemed';
  const swapId = nextId('swaps');
  state.swaps.push({
    id: swapId,
    item_id: item.id,
    requester_id: req.user.id,
    owner_id: item.user_id,
    kind: 'redeem',
    status: 'completed',
    created_at: new Date().toISOString(),
  });
  persist();
  res.json({ swapId, message: 'Item redeemed successfully' });
});

module.exports = router;
