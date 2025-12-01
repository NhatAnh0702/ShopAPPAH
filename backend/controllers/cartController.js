const User = require('../models/userModel');
const Product = require('../models/productModel');

// POST /api/cart/add  (requires auth)
const addToCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });

    const qty = parseInt(quantity) || 1;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    // check if already in cart
    const existing = user.cart.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity = Math.max(1, existing.quantity + qty);
    } else {
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();
    return res.json({ message: 'Đã thêm vào giỏ hàng', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/cart  (requires auth)
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    return res.json({ cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/cart/:productId  (requires auth)
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = req.user;
    user.cart = user.cart.filter(i => i.product.toString() !== productId);
    await user.save();
    res.json({ message: 'Đã xóa khỏi giỏ hàng', cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { addToCart, getCart, removeFromCart };
