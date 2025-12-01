const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');

router.post('/add', auth, addToCart);
router.get('/', auth, getCart);
router.delete('/:productId', auth, removeFromCart);

module.exports = router;
