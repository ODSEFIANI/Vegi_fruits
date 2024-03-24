const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/UploadController');
const UserController = require('../controllers/UserController');
const ProductController = require('../controllers/ProductController');
const OrderController = require('../controllers/OrderController');
const CartController = require('../controllers/CartController');
const ReviewController = require('../controllers/ReviewController');
const FavoriteController = require('../controllers/FavoriteController');

// Route for uploading images
router.post('/upload', UploadController.upload.single('image'), UploadController.uploadImage);

// User Routes
router.post('/api/users/register', UserController.registerUser);
router.post('/api/users/login', UserController.loginUser);
router.get('/api/users/:id', UserController.getUserById);
router.put('/api/users/:id', UserController.updateUser);
router.delete('/api/users/:id', UserController.deleteUser);

// Product Routes
router.post('/api/products', ProductController.addProduct);
router.get('/api/products', ProductController.getAllProducts);
router.get('/api/products/:id', ProductController.getProductById);
router.put('/api/products/:id', ProductController.updateProduct);
router.delete('/api/products/:id', ProductController.deleteProduct);

// Order Routes
router.post('/api/addorder', asyncMiddleware(OrderController.addOrder));
router.get('/api/orders', OrderController.getAllOrders);
router.get('/api/orders/:id', OrderController.getOrderById);
router.put('/api/orders/:id', OrderController.updateOrder);
router.delete('/api/orders/:id', OrderController.deleteOrder);

// Cart Routes
router.post('/api/carts', CartController.addToCart);
router.get('/api/carts/:userId', CartController.getCartByUserId);
router.put('/api/carts/:userId', CartController.updateCart);
router.delete('/api/carts/:userId/:productId', CartController.removeFromCart);

// Review Routes
router.post('/api/reviews', ReviewController.addReview);
router.get('/api/reviews/:productId', ReviewController.getReviewsByProduct);

// Favorite Routes
router.post('/api/favorites', FavoriteController.addToFavorites);
router.get('/api/favorites/:userId', FavoriteController.getFavoritesByUserId);
router.delete('/api/favorites/:userId/:productId', FavoriteController.removeFromFavorites);

module.exports = router;
