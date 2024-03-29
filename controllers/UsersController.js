const { ObjectId } = require('mongodb');
const sha1 = require('sha1');
const Queue = require('bull');
const dbClient = require('../utils/db');
const userUtils = require('../utils/user');
const User = require('../models/UserModel');
const userQueue = new Queue('userQueue');

class UsersController {
  /**
   * Creates a user using email and password
   * Specify an email and a password
   * If email is missing, return error: Missing email /status code 400
   * If password is missing, return error: Missing password /status code 400
   * If email already exists in DB, return error: Already exists /status code 400
   * Password must be stored after being hashed in SHA1
   * The endpoint is returning the new user with only the email and the id
   * (auto generated by MongoDB) with a status code 201
   * The new user must be saved in the collection users
   */
  static async postNew(request, response) {
    const { email, password, attributes } = request.body;
    console.log(request.body)

    if (!email) {
        return response.status(400).send({ error: 'Missing email' });
    }

    if (!password) {
        return response.status(400).send({ error: 'Missing password' });
    }

    const emailExists = await dbClient.usersCollection.findOne({ email });

    if (emailExists) {
        return response.status(400).send({ error: 'Email already exists' });
    }

    const sha1Password = sha1(password);

    try {
        const userData = {
            email,
            password: sha1Password,
            ...attributes  // Spread the optional attributes
        };

        const result = await User.create(userData);

        const user = {
            id: result.insertedId,
            email,
            ...attributes  // Spread the optional attributes
        };

        return response.status(201).send(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return response.status(500).send({ error: 'Error creating user' });
    }
}


  // Retrieve the user based on the token used
  static async getMe(request, response) {
    try {
      const { userId } = await userUtils.getUserIdAndKey(request);
  
      const user = await userUtils.getUser({
        _id: userId,
      });
  
      if (!user) {
        return response.status(401).send({ error: 'Unauthorized' });
      }
  
      // Convert Mongoose document to plain JavaScript object
      const plainUser = user.toObject();
  
      // Remove the password field from the user object
      delete plainUser.password;
  
      console.log(plainUser);
      return (plainUser);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return response.status(500).send({ error: 'Error retrieving user' });
    }
  }

  /**
   * Update user information
   * Specify an id, email and a password
   * Password must be stored after being hashed in SHA1
   * If email is missing, return error: Missing email /status code 400
   * If password is missing, return error: Missing password /status code 400
   * If email already exists in DB, return error: Already exists /status code 400
   * If user does not exist, return error: Not found /status code 404
   * If id is not valid, return error: Not found /status code 404
   */
  static async updateUser(request, response) {
    const { id } = request.params;
    const { email, password } = request.body;

    try {
      if (!ObjectId.isValid(id)) {
        return response.status(404).send({ error: 'Not found' });
      }

      if (!email) {
        return response.status(400).send({ error: 'Missing email' });
      }

      if (!password) {
        return response.status(400).send({ error: 'Missing password' });
      }

      const user = await dbClient.usersCollection.findOne({ _id: ObjectId(id) });

      if (!user) {
        return response.status(404).send({ error: 'Not found' });
      }

      const emailExists = await dbClient.usersCollection.findOne({ email });

      if (emailExists && emailExists._id.toString() !== id) {
        return response.status(400).send({ error: 'Email already exists' });
      }

      const sha1Password = sha1(password);

      await dbClient.usersCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: { email, password: sha1Password } }
      );

      return response.status(200).send({ id, email });
    } catch (error) {
      console.error('Error updating user:', error);
      return response.status(500).send({ error: 'Error updating user' });
    }
  }

  /**
   * Delete a user based on the id
   * Specify an id
   * If id is not valid, return error: Not found /status code 404
   * If user does not exist, return error: Not found /status code 404
   */
  static async deleteUser(request, response) {
    const { id } = request.params;

    try {
      if (!ObjectId.isValid(id)) {
        return response.status(404).send({ error: 'Not found' });
      }

      const user = await dbClient.usersCollection.findOne({ _id: ObjectId(id) });

      if (!user) {
        return response.status(404).send({ error: 'Not found' });
      }

      await dbClient.usersCollection.deleteOne({ _id: ObjectId(id) });

      return response.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      return response.status(500).send({ error: 'Error deleting user' });
    }
  }
}

module.exports = UsersController;
