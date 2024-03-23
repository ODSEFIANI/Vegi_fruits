const Product = require('../models/productModel.js');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');
const dbClient = require('../utils/db');

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
    static async addProduct(req, res, next) {
        try {
            const { user, name, price, quantity, description } = req.body;
            console.log(request.body);
           // console.log(user, name, price, quantity, description);
            res.status(200).json({ message: "Data extracted successfully." });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
}
    
    module.exports = ProductController;
