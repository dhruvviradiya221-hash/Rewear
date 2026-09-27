const express = require('express');
const bcrypt = require('bcryptjs');
const { db, persist, nextId } = require('../database');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const state = db.getState();
  const existing = state.users.find((u) => u.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const id = nextId('users');
  const userRow = {
    id,
    email: email.toLowerCase(),
    password_hash: bcrypt.hashSync(password, 10),
    name: name.trim(),
    points: 50,
    role: 'user',
    created_at: new Date().toISOString(),
  };
  state.users.push(userRow);
  persist();
  const user = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    points: userRow.points,
    role: userRow.role,
  };
  res.status(201).json({ token: signToken(user), user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.getState().users.find((u) => u.email === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const safe = {
    id: user.id,
    email: user.email,
    name: user.name,
    points: user.points,
    role: user.role,
  };
  res.json({ token: signToken(safe), user: safe });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.getState().users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      points: user.points,
      role: user.role,
    },
  });
});

module.exports = router;
