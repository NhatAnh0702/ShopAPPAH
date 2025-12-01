// backend/models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "Chưa có mô tả",
    },
    price: {
      type: Number,
      required: [true, "Giá sản phẩm là bắt buộc"],
      min: [0, "Giá không thể âm"],
    },
    image: {
      type: String,
      required: [true, "Ảnh sản phẩm là bắt buộc"],
      default: "default.jpg",
    },
    category: {
      type: String,
      default: "Khác",
    },
    stock: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
