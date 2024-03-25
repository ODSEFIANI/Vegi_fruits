const Order = require('../models/orderModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/UserModel.js');
const dbClient = require('../utils/db.js');
const { getMe } = require('./UsersController.js');

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

  static async addOrder(request, response) {
    try {
      const user = await getMe(request)
      console.log(user);
        if (!user || user.userType !== 'client') {
            return response.status(401).send({ error: 'Unauthorized to add order' });
        }
        const userId = user._id.toString();
        
        const { product, quantity, price } = request.body.attributes;
        console.log("requestbody",request.body);
        /*if (!product || !quantity || !price) {
            return response.status(400).send({ error: 'Missing required fields in request body' });
        }**/

        const orderData = {
            product:product,
            quantity:quantity,
            price:price,
            owner: userId,
        };
        console.log("final console",orderData);
        const newOrder = await Order.create(orderData);
        response.status(201).send({ message: 'Order added successfully'});
    } catch (error) {
        console.error('Failed to add order:', error);
        response.status(500).send({ error: 'Failed to add order. Please try again later.' });
    }
}

}
module.exports = OrderController;