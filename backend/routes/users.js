const express = require('express');
const { db, mapItem, getItemImages, getUploader, persist } = require('../database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/me/items', authRequired, (req, res) => {
  const rows = db
    .getState()
    .items.filter((i) => i.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(
    rows.map((row) =>
      mapItem(row, getItemImages(row.id), getUploader(row.user_id))
    )
  );
});

router.get('/me/swaps', authRequired, (req, res) => {
  const state = db.getState();
  const rows = state.swaps
    .filter((s) => s.requester_id === req.user.id || s.owner_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const swaps = rows.map((s) => {
    const item = state.items.find((i) => i.id === s.item_id);
    const requester = state.users.find((u) => u.id === s.requester_id);
    const owner = state.users.find((u) => u.id === s.owner_id);
    return {
      id: s.id,
      itemId: s.item_id,
      itemTitle: item?.title || 'Item',
      pointsCost: item?.points_cost,
      kind: s.kind,
      status: s.status,
      createdAt: s.created_at,
      requesterId: s.requester_id,
      ownerId: s.owner_id,
      requesterName: requester?.name,
      ownerName: owner?.name,
      role: s.requester_id === req.user.id ? 'requester' : 'owner',
    };
  });

  res.json({
    ongoing: swaps.filter((s) => ['pending', 'accepted'].includes(s.status)),
    completed: swaps.filter((s) =>
      ['completed', 'rejected', 'cancelled'].includes(s.status)
    ),
    all: swaps,
  });
});

router.patch('/me/swaps/:id', authRequired, (req, res) => {
  const { action } = req.body;
  const state = db.getState();
  const swap = state.swaps.find((s) => s.id === Number(req.params.id));
  if (!swap) return res.status(404).json({ error: 'Swap not found' });
  if (swap.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the item owner can respond' });
  }
  if (action === 'accept') {
    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Swap is no longer pending' });
    }
    swap.status = 'accepted';
    persist();
    return res.json({ message: 'Swap accepted' });
  }
  if (action === 'reject') {
    if (swap.status !== 'pending') {
      return res.status(400).json({ error: 'Swap is no longer pending' });
    }
    swap.status = 'rejected';
    persist();
    return res.json({ message: 'Swap rejected' });
  }
  if (action === 'complete') {
    if (swap.status !== 'accepted') {
      return res.status(400).json({ error: 'Swap must be accepted first' });
    }
    swap.status = 'completed';
    const item = state.items.find((i) => i.id === swap.item_id);
    if (item) item.status = 'swapped';
    persist();
    return res.json({ message: 'Swap marked complete' });
  }
  return res.status(400).json({ error: 'Invalid action' });
});

module.exports = router;
