const Order = require('../models/orderModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/UserModel.js');
const dbClient = require('../utils/db.js');
const { getMe } = require('./UsersController.js');
const Product = require('../models/productModel.js');

class OrderController {
  static async viewOrderHistory(request, response) {
    try {
        const user = await getMe(request);
        if (!user || user.userType !== 'client') {
            return response.status(401).send({ error: 'Unauthorized to view order history' });
        }
        const userId = user._id.toString();
        console.log("user id",userId);
        const orders = await Order.find({ user: userId });
        console.log("orders",orders);
        if (orders.length > 0) {
            return response.status(200).json({ orders });
        } else {
            return response.status(200).json({"no orders are found": []});
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Failed to fetch order history:', error);
        return response.status(500).send({ error: 'Failed to fetch order history. Please try again later.' });
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

// ---------------------- Add Order ----------------------
  static async addOrder(request, response) {
    /**
     * Add an order to the database
     * fetch the user from the request object using the getMe function
     * check if the user is a client
     * get the product, quantity, and price from the request body
     * check if the product exists in the database
     * check if the product quantity is available
     * create new order
     * update the product quantity
     * send a success response
     */

    try {
      const user = await getMe(request)
        if (!user || user.userType !== 'client') {
            return response.status(401).send({ error: 'Unauthorized to add order' });
        }
        const userId = user._id.toString();
        
        const { product, quantity, price } = request.body.attributes;
        /*if (!product || !quantity || !price) {
            return response.status(400).send({ error: 'Missing required fields in request body' });
        }**/
      
        const productDoc = await Product.findById(product);
    if (!productDoc) {
      return response.status(400).send({ error: 'Invalid product name' });
    }

    if (productDoc.quantity < quantity) {
      return response.status(400).send({ error: 'Product quantity is not available' });
    }
        const orderData = {
            product:product,
            quantity:quantity,
            price:price,
            user: userId,
        };
        console.log("final console",orderData);
        const newOrder = await Order.create(orderData);
        response.status(201).send({ message: 'Order added successfully'});
        productDoc.quantity -= quantity;
        await productDoc.save();
    } catch (error) {
        console.error('Failed to add order:', error);
        response.status(500).send({ error: 'Failed to add order. Please try again later.' });
    }
}

}
module.exports = OrderController;