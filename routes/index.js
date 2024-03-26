const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const ProductController = require('../controllers/ProductController');
const ProController = require('../controllers/ProController');
const OrderController = require('../controllers/OrderController');

function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);

    // App ctrl

  // checks if Redis is alive and if the DB is alive
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // returns the number of users and files in DB
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  // User ctrl

  // creates a new user in DB
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  // retrieves the user base on the token used
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  // Auth ctrl

  // sign-in the user by generating a new authentication token
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  // sign-out the user based on the token
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });

  // Files ctrl

  // creates a new file in DB and in disk
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  // retrieves the file document based on the ID
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  // retrieve users file documents for a specific parentId with pagination
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  // isPublic setting to true on the file document based on the ID
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  // isPublic setting to false on the file document based on the ID
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  // return the content of the file document based on the ID
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });

  router.post('/api/addproduct', AuthController.auth,AuthController.restricted(),(req, res) => {
    ProductController.addProduct(req, res);
});

router.post('/api/Createproduct',(req, res) => {
  ProController.CreateProduct(req, res);
});

router.post('/api/addorder', (req, res) => {
  OrderController.addOrder(req, res);
});

router.get('/api/products', AuthController.auth, (req, res) => {
  ProductController.getAllProducts(req, res);

});
router.get('/api/products/:productId', (req, res) => {
  ProductController.getProductById(req, res);
});
router.get('/api/viewOrderHistory', (req, res) => {
OrderController.viewOrderHistory(req, res);
});

router.get('/api/orders', AuthController.auth, (req, res) => {
  ProductController.getAllOrders(req, res);
});

// DELETE /api/products/:productId
router.delete('/api/products/:productId', AuthController.auth, ProductController.deleteProductById);


}
module.exports = controllerRouting;
