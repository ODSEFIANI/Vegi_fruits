const Order = require('../models/orderModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/userModel');

class OrderController {
  static async viewOrderHistory(req, res, next) {
    try {
      const orders = await Order.find({ owner: req.user._id });

      res.status(200).json({
        status: 'success',
        data: {
          orders,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findOneAndUpdate(
        { _id: orderId, owner: req.user._id },
        { status },
        { new: true }
      );

      if (!order) {
        return next(new AppError('Order not found or you do not have permission to update', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleReturns(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await Order.findOneAndUpdate(
        { _id: orderId, owner: req.user._id },
        { returned: true },
        { new: true }
      );

      if (!order) {
        return next(new AppError('Order not found or you do not have permission to update', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          order,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addOrder(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user || user.userType !== 'buyer') {
        return next(new AppError('You are not authorized to the wanted process, Only registered buyers can place an order', 401));
      }
      const { product, quantity, totalPrice } = req.body;
      console.log(req.body);
      const newOrder = new Order({
        product,
        quantity,
        totalPrice,
        owner: req.user._id,
      });
      const savedOrder = await newOrder.save();
      res.status(201).json({
        status: 'success',
        data: {
          order: savedOrder,
        },
      });
    } catch (error) {
      next(new AppError('Failed to add the order. Please try again later.', 500));
    }
  }
}

module.exports = OrderController;