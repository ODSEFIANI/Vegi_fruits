const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');


class AppController {
  // check if Redis is alive and if the DB is alive too
  static getStatus(request, response) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    response.status(200).send(status);
  }

  // the number of users and files in DB
  static async getStats(request, response) {
    const stats = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    response.status(200).send(stats);
  }
}

module.exports = AppController;
