const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { seed } = require('./seed');
const { attachEventsRoute } = require('./realtime');
const { getVersion } = require('./database');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

seed();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'rewear-api', version: getVersion() });
});

app.get('/api/sync', (_req, res) => {
  res.json({ version: getVersion(), at: new Date().toISOString() });
});

attachEventsRoute(app);

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.includes('image')) {
    return res.status(400).json({ error: err.message || 'Upload error' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ReWear API running on http://localhost:${PORT}`);
});
