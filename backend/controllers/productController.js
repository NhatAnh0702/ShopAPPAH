const Product = require("../models/productModel");

// Lấy tất cả sản phẩm
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// Tạo mới sản phẩm
exports.createProduct = async (req, res) => {
  const { name, image, price, description, category } = req.body;
  const newProduct = new Product({ name, image, price, description, category });
  const saved = await newProduct.save();
  res.status(201).json(saved);
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.json({ message: "Đã xóa sản phẩm" });
};
