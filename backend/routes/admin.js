const express = require('express');
const fs = require('fs');
const path = require('path');
const { db, mapItem, getItemImages, getUploader, persist } = require('../database');
const { authRequired, adminRequired } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminRequired);

router.get('/items/pending', (_req, res) => {
  const rows = db
    .getState()
    .items.filter((i) => i.status === 'pending')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json(
    rows.map((row) =>
      mapItem(row, getItemImages(row.id), getUploader(row.user_id))
    )
  );
});

router.get('/items', (_req, res) => {
  const rows = db
    .getState()
    .items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(
    rows.map((row) =>
      mapItem(row, getItemImages(row.id), getUploader(row.user_id))
    )
  );
});

router.patch('/items/:id', (req, res) => {
  const { action } = req.body;
  const state = db.getState();
  const item = state.items.find((i) => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });

  if (action === 'approve') {
    item.status = 'available';
    const owner = state.users.find((u) => u.id === item.user_id);
    if (owner) owner.points += 15;
    persist();
    return res.json({ message: 'Item approved and listed' });
  }
  if (action === 'reject') {
    item.status = 'rejected';
    persist();
    return res.json({ message: 'Item rejected' });
  }
  return res.status(400).json({ error: 'Invalid action' });
});

router.delete('/items/:id', (req, res) => {
  const state = db.getState();
  const id = Number(req.params.id);
  const images = state.itemImages.filter((img) => img.item_id === id);
  state.items = state.items.filter((i) => i.id !== id);
  state.itemImages = state.itemImages.filter((img) => img.item_id !== id);
  state.swaps = state.swaps.filter((s) => s.item_id !== id);
  persist();
  for (const img of images) {
    if (img.path.startsWith('/uploads/')) {
      const file = path.join(__dirname, '..', img.path.slice(1));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
  res.json({ message: 'Item removed' });
});

module.exports = router;
