// backend/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ date: -1 });
    res.json(orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .sort({ date: -1 });
    res.json(orders);
});

const createOrder = asyncHandler(async (req, res) => {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    const order = new Order({
        user: req.user._id,
        items,
        totalAmount,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    getMyOrders,
    getAllOrders,
    createOrder,
    updateOrderStatus,
    getOrderById,
};