// backend/controllers/productController.js
const Product = require('../models/productModel');
const path = require('path');
const fs = require('fs');

function buildImagePath(filename) {
  if (!filename) return '';
  return `/uploads/${filename}`;
}

// Lấy tất cả sản phẩm (hỗ trợ lọc theo category qua query ?category=)
const getProducts = async (req, res) => {
  try {
    const { category } = req.query || {};
    const filter = {};
    if (category && String(category).trim()) {
      filter.category = String(category).trim();
    }
    const products = await Product.find(filter).lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// GET sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mới sản phẩm
const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category } = req.body || {};
    let imagePath = image || '';
    if (req.file && req.file.filename) {
      imagePath = buildImagePath(req.file.filename);
    }

    const product = new Product({ name, price, description, image: imagePath, category: category || 'Khác' });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // attempt to remove file if exists
    if (product.image) {
      const filename = product.image.replace(/^\/uploads\//, '');
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      fs.unlink(filePath, (err) => {});
    }

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, description, image, category } = req.body || {};

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // Determine image path
    let imagePath = product.image || '';
    if (req.file && req.file.filename) {
      // new file uploaded -> set new path and delete old file
      const newPath = buildImagePath(req.file.filename);
      // delete old file if exists
      if (product.image) {
        const oldFilename = product.image.replace(/^\/uploads\//, '');
        const oldFilePath = path.join(__dirname, '..', 'uploads', oldFilename);
        fs.unlink(oldFilePath, (err) => {});
      }
      imagePath = newPath;
    } else if (image) {
      // No new file, but frontend sent an image URL (old one) -> keep it
      imagePath = image;
    }

    product.name = name !== undefined ? name : product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description !== undefined ? description : product.description;
    product.image = imagePath;
    product.category = category !== undefined ? category : product.category;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
    getProducts, 
    getProductById, 
    createProduct, 
    deleteProduct, 
    updateProduct 
};