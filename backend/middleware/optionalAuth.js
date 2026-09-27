const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

module.exports = { optionalAuth };
