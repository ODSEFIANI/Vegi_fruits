const Order = require('../models/orderModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const User = require('../models/UserModel.js');
const dbClient = require('../utils/db.js');
const { getMe } = require('./UsersController.js');
const Product = require('../models/productModel.js');

class OrderController {
/* ---------------------- Add Order ---------------------- */
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
 /* ---------------------------------------------------------------------- */

  /* ---------------------- View Order History ---------------------- */
  static async viewOrderHistory(request, response) {
    /**
   * View order history for a client
   * fetch the user from the request object using the getMe function
   * check if the user is a client
   * get the user ID
   * query the orders collection to find orders for the user
   * send a success response with the orders
   * send an empty array if no orders are found
   * handle any errors that occur during the process
   * send an error response if an error occurs
   */
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
/* ---------------------------------------------------------------------- */

  /* ---------------------- GET ALL ORDERS  ---------------------- */
  static async getAllOrders(req, res) {
    /**
     * Retrieve all orders from the database
     * query the orders collection to find all orders
     * send a success response with the orders
     * handle any errors that occur during the process
     * send an error response if an error occurs
     * Only farmers are authorised to view all orders !!!!
     */
    try {
    const orders = await Order.find();
    return res.status(200).json(orders);
    } catch (error) {
    console.error('Error retrieving orders:', error);
    return res.status(500).json({ error: 'Error retrieving orders' });
    }
}
/* --------------------------------------------------------------------- */

/* ---------------------- GET ORDERS BY PRODUCT  ---------------------- */
static async viewProductOrders(request, response) {
  /**
   * View order history for a product
   * get the product ID from the request parameters
   * query the orders collection to find orders for the product
   * send a success response with the orders
   * send a message if no orders are found
   * handle any errors that occur during the process
   * send an error response if an error occurs
   */
  try {
      const productId = request.params.productId;
      const orders = await Order.find({ product: productId });
        if (orders.length > 0) {
          return response.status(200).json({ orders });
      } else {
          return response.status(200).json({ message: 'No orders found for the specified product' });
      }
  } catch (error) {
      console.error('Failed to fetch product order history:', error);
      return response.status(500).send({ error: 'Failed to fetch product order history. Please try again later.' });
  }
}
/* -------------------------------------------------------------- */

/* ---------------------- UPDATE ORDER STATUS ---------------------- */
static async updateOrderStatus(request, response) {
  try {
    const orderId = request.params.orderId;
    const { status } = request.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return response.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    return response.status(200).json({ message: 'Order status updated successfully', order});
  } catch (error) {
    console.error('Failed to update order status:', error);
    return response.status(500).json({ error: 'Failed to update order status. Please try again later.' });
  }
}

/* ----------------------------------------------------------------- */
}
module.exports = OrderController;