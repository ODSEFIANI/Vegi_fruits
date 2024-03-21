const Order = require('../models/orderModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');

exports.viewOrderHistory = asyncWrapper(async (req, res, next) => {
  const orders = await Order.find({ owner: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      orders,
    },
  });
});

exports.updateOrderStatus = asyncWrapper(async (req, res, next) => {
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
});

exports.handleReturns = asyncWrapper(async (req, res, next) => {
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
});
