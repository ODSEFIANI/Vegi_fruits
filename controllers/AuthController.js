const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const userUtils = require('../utils/user');
const UsersController = require('../controllers/UsersController');

const dbClient = require('../utils/db'); // Import dbClient

class AuthController {
  // Middleware for protecting routes
  static protected(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // Verify token validity
    redisClient.get(`auth_${token}`, (err, userId) => {
      if (err || !userId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      req.userId = userId;
      next();
    });
  }


  // Middleware for restricting access based on user roles
  static restricted() {
    return async (req, res, next) => {
      try {
        const user = await UsersController.getMe(req, res);

        if (!user) {
          return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        // Check if user has the role of "farmer"
        console.log("debuging this line to test wheter the object is retrievced ",user, "debuging this line to test wheter the object is retrievced");
        console.log(user.userType);
        if (user.userType !== 'farmer') {
          return res.status(403).json({ error: `Forbidden: Insufficient permissions. You are ${user.userType}` });
        }

        next();
      } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({ error: 'Error retrieving user' });
      }
    };
  }
    // Middleware for protecting routes
    static auth(req, res, next) {
      userUtils.getUserIdAndKey(req)
        .then(({ userId }) => {
          if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
          }
          req.userId = userId;
          console.log("authenticated");
          next();
        })
        .catch(error => {
          console.error('Error retrieving user:', error);
          return res.status(500).json({ error: 'Error retrieving user' });
        });
    }


  // Sign-in the user by generating a new authentication token
  static async signIn(request, response) {
    const authorizationHeader = request.header('Authorization') || '';

    const credentials = authorizationHeader.split(' ')[1];

    if (!credentials) {
      return response.status(401).send({ error: 'Unauthorized: Missing credentials' });
    }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return response.status(401).send({ error: 'Unauthorized: Invalid credentials format' });
    }

    const sha1Password = sha1(password);

    const user = await userUtils.getUser({
      email,
      password: sha1Password,
    });

    if (!user) {
      return response.status(401).send({ error: 'Unauthorized: Invalid email or password' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    const hoursForExpiration = 120;

    await redisClient.set(key, user._id.toString(), 'EX', hoursForExpiration * 3600);

    return response.status(200).send({ token });
  }

  // Sign-out the user based on the token
  static async signOut(request, response) {
    const token = request.headers.authorization.split(' ')[1];
    const key = `auth_${token}`;

    const userId = await redisClient.get(key);

    if (!userId) {
      return response.status(401).send({ error: 'Unauthorized: Invalid token' });
    }

    await redisClient.del(key);

    return response.status(204).send();
  }

  static async getConnect(request, response) {
    const authData = request.header('Authorization');
  
    if (!authData) {
      response.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
      return;
    }
  
    const token = authData.split(' ')[1];
    const buff = Buffer.from(token, 'base64');
    const userEmail = buff.toString('ascii');
    const data = userEmail.split(':'); // contains email and password
  
    if (data.length !== 2) {
      response.status(401).json({ error: 'Unauthorized: Invalid token format' });
      return;
    }
  
    const hashedPassword = sha1(data[1]);
    const users = dbClient.db.collection('users');
  
    users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        response.status(200).json({ token });
      } else {
        response.status(401).json({ error: 'Unauthorized: Invalid email or password' });
      }
    });
  }


  static async getDisconnect(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      response.status(204).json({});
    } else {
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
  
}
module.exports = AuthController;
