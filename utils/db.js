const mongoose = require('mongoose');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'fruits_shop';

class DBClient {
  constructor() {
    this.connect();
    this.db = mongoose.connection;
    this.usersCollection = null; // Mongoose models will handle collections
    this.productsCollection = null; // Mongoose models will handle collections
  }

  async connect() {
    try {
      await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected successfully to MongoDB server');

      // Initialize Mongoose models
      this.usersCollection = require('../models/UserModel'); // Adjust the path as per your file structure
      this.productsCollection = require('../models/productModel'); // Adjust the path as per your file structure
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
    }
  }

  isAlive() {
    return this.db.readyState === 1; // Check if Mongoose connection is open
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    return await this.usersCollection.countDocuments();
  }

  async nbProducts() {
    if (!this.isAlive()) return 0;
    return await this.productsCollection.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;

