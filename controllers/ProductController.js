const Product = require('../models/productModel.js');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const dbClient = require('../utils/db');
const { getMe } = require('../controllers/UsersController');

// Instantiate UsersController



/**
 * Retrieve products of a farmer
 */
exports.retrieveFarmerProducts = asyncWrapper(async (req, res, next) => {
  const products = await Product.find({ owner: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      products,
    }
  });
});

/**
 * Create a product for the farmer
 */
exports.addProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.create({
    user: req.user._id,
    //photo: req.file.filename,
    ...req.body
  });

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * Retrieve a product
 */
exports.retrieveProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with the given ID', 404, 'fail'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    }
  });
});

/**
 * Delete a product
 */
exports.deleteProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with the given ID', 404, 'fail'));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Update a product
 */
exports.updateProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError('No product found with the given ID', 404, 'fail'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});
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
            const userId = user._id;
    
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
            const result = await dbClient.productsCollection.insertOne(productData);
    
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
    }
    
    
    module.exports = ProductController;
