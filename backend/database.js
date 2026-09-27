const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'db.json');

const empty = () => ({
  users: [],
  items: [],
  itemImages: [],
  swaps: [],
  seq: { users: 0, items: 0, itemImages: 0, swaps: 0 },
});

function load() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    const initial = empty();
    fs.writeFileSync(dataFile, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

let cache = load();

function persist() {
  fs.writeFileSync(dataFile, JSON.stringify(cache, null, 2));
}

function nextId(key) {
  cache.seq[key] += 1;
  return cache.seq[key];
}

function mapItem(row, images, uploader) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type,
    size: row.size,
    condition: row.condition,
    tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    pointsCost: row.points_cost,
    status: row.status,
    createdAt: row.created_at,
    images: images || [],
    uploader: uploader || null,
  };
}

function getItemImages(itemId) {
  return cache.itemImages
    .filter((i) => i.item_id === itemId)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .map((i) => i.path);
}

function getUploader(userId) {
  const u = cache.users.find((x) => x.id === userId);
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, points: u.points };
}

function getItemRow(id) {
  return cache.items.find((i) => i.id === Number(id)) || null;
}

function getItemById(id, includePendingForAdmin = false) {
  const row = getItemRow(id);
  if (!row) return null;
  if (
    !includePendingForAdmin &&
    !['approved', 'available', 'swapped', 'redeemed'].includes(row.status)
  ) {
    return null;
  }
  return mapItem(row, getItemImages(row.id), getUploader(row.user_id));
}

const db = {
  getState: () => cache,
  reload: () => {
    cache = load();
  },
  persist,
  nextId,
  mapItem,
  getItemImages,
  getUploader,
  getItemRow,
  getItemById,
};

module.exports = { db, mapItem, getItemImages, getUploader, getItemById, persist, nextId };
