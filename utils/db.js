const { MongoClient } = require('mongodb');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'fruits_shop';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.db = null;
    this.usersCollection = null;
    this.productsCollection = null;
    this.connect();
  }

  async connect() {
    try {
      const client = await MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true });
      this.db = client.db(DB_DATABASE);
      this.usersCollection = this.db.collection('users');
      this.productsCollection = this.db.collection('products');
      console.log('Connected successfully to MongoDB server');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
    }
  }

  isAlive() {
    return Boolean(this.db);
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
