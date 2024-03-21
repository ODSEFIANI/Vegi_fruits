const Product = require('../models/productModel');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');

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
exports.createProduct = asyncWrapper(async (req, res, next) => {
  const product = await Product.create({
    owner: req.user._id,
    photo: req.file.filename,
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