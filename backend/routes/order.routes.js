const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.get('/', orderController.getAllOrders);
router.get('/user/:username', orderController.getOrdersByUser);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
