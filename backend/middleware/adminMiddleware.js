// middleware/adminMiddleware.js
module.exports = (req, res, next) => {
  // assumes authMiddleware already set req.user
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  next();
};
