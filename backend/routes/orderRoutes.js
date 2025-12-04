// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
    getMyOrders,
    getAllOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware'); 

// Các route
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);  
router.post('/', protect, createOrder);
router.put('/:id', protect, admin, updateOrderStatus);
router.get('/:id', protect, getOrderById);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;