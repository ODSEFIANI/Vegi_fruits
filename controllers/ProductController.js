const Product = require('../models/productModel.js');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const dbClient = require('../utils/db');
const { getMe } = require('../controllers/UsersController');

// Instantiate UsersController


class ProductController {
  /* ------------------- Create a product ------------------- */
    static async CreateProduct(request, response) {
      /**
       * Create a new product
       * insert the product data into the products collection
       * Add a task related to the newly created product to a product queue
       * 
       */
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

            const result = await dbClient.productsCollection.insertOne(productData);



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
    /*------------------------------------------------------------*/

    /* ------------------- Add products ------------------- */
    static async addProduct(request, res) {
      /**
       * Add a new product
       * retrieve the user object from the request
       * extract the user ID from the user object
       * extract product details from the request body
       * create a product object
       * create the product in the database
       * return a success response with the created product
       */
        try {
            const user = await getMe(request);
            console.log(user);

            const userId = user._id.toString();
    
            const { name, price, quantity, description } = request.body;
    
            const productData = {
                user: userId, // Use userId directly without accessing _id again
                name,
                price,
                quantity,
                description 
            };
            console.log(productData);
    
            const result = await Product.create(productData);

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
    /*------------------------------------------------------------*/

    /* ------------------- get all products ------------------- */
    static async getAllProducts(req, res) {
      /**
       * retrieve all products from the products collection
       * return a success response with the products
       */
        try {
        const products = await Product.find();
        return res.status(200).json(products);
        } catch (error) {
        console.error('Error retrieving products:', error);
        return res.status(500).json({ error: 'Error retrieving products' });
        }
    }
    /*------------------------------------------------------------*/

    /* ------------------- get object byID ------------------- */
    static async getObjectById(req, res) {
      /**
       * Retrieve an object by ID
       * extract the model and objectId from the request parameters
       * retrieve the object from the database
       * return a success response with the object
       */
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
    /*------------------------------------------------------------*/

    /* ------------------- Get product by ID ------------------- */
      static async getProductById(req, res) {
        /**
         * Retrieve a product by ID
         * extract the product ID from the request parameters
         * retrieve the product from the database
         * return a success response with the product
         */
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
    /*------------------------------------------------------------*/

    /* ------------------- Delete product ------------------- */
      static async deleteProductById(req, res) {
        /**
         * Delete a product by ID
         * retrieve the user object from the request
         * extract the product ID from the request parameters
         * retrieve the product from the database
         * check if the user is the owner of the product
         * delete the product
         * return a success response
         */
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
