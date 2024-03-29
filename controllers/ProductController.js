const Product = require('../models/productModel.js');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const dbClient = require('../utils/db');
const { getMe } = require('../controllers/UsersController');

// Instantiate UsersController


class ProductController {
    static async CreateProduct(request, response) {
        try {
            const { user, name, price, quantity, description } = request.body;

            // Create a product object
            const productData = {
                user,
                name,
                price,
                quantity,
                description 
            };

            // Insert the product data into the products collection
            const result = await dbClient.productsCollection.insertOne(productData);


            // Add a task related to the newly created product to a product queu

            return response.status(201).json({
                status: 'success',
                data: productData,
            });
        } catch (error) {
            console.error('Error adding product:', error);
            return response.status(500).json({
                status: 'error',
                message: 'Error adding product',
            });
        }
    
    }
    static async addProduct(request, res) {
        try {
            // Call getMe function to retrieve the user object
            const user = await getMe(request);
            console.log(user);
    
            // Extract user ID from the user object
            const userId = user._id.toString();
    
            // Extract product details from the request body
            const { name, price, quantity, description } = request.body;
    
            // Create a product object
            const productData = {
                user: userId, // Use userId directly without accessing _id again
                name,
                price,
                quantity,
                description 
            };
            console.log(productData);
    
            // Create the product in the database (assuming Product is a Mongoose model)
            const result = await Product.create(productData);
    
          // Return a success response with the created product
          return res.status(201).json({
            status: 'success',
            data: {
              productData
            }
          });
        } catch (error) {
          // Handle any errors that occur during product creation
          console.error('Error adding product:', error);
          return res.status(500).json({
            status: 'error',
            message: 'Error adding product'
          });
        }
      }
    
      // Retrieve all products
    static async getAllProducts(req, res) {
        try {
        const products = await Product.find();
        return res.status(200).json(products);
        } catch (error) {
        console.error('Error retrieving products:', error);
        return res.status(500).json({ error: 'Error retrieving products' });
        }
    }
    
    static async getObjectById(req, res) {
        try {
          const { model, objectId } = req.params;
          
          if (!model || !objectId) {
            return res.status(400).json({ error: 'Missing parameters' });
          }
      
          const object = await model.findById(objectId);
          
          if (!object) {
            return res.status(404).json({ error: `${model} not found` });
          }
      
          return res.status(200).json(object);
        } catch (error) {
          console.error('Error retrieving object:', error);
          return res.status(500).json({ error: 'Error retrieving object' });
        }
      }
      static async getProductById(req, res) {
        try {
          const productId = req.params.productId;
          const product = await Product.findById(productId);
          
          if (!product) {
            return res.status(404).json({ error: 'Product not found' });
          }
    
          return res.status(200).json(product);
        } catch (error) {
          console.error('Error retrieving product:', error);
          return res.status(500).json({ error: 'Error retrieving product' });
        }
      }
      static async deleteProductById(req, res) {
        try {
            const user = await getMe(req, res);
    
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found' });
            }
    
            const productId = req.params.productId;
    
            if (!productId) {
                return res.status(400).json({ error: 'Missing productId parameter' });
            }
    
            const product = await Product.findOne({ _id: productId });
    
            console.log('Retrieved product:', product); // Add this line for debugging
    
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
    
            if (product.user.toString() !== user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
    
            await Product.deleteOne({ _id: productId });
    
            return res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ error: 'Error deleting product' });
        }
    }
}  
    module.exports = ProductController;
