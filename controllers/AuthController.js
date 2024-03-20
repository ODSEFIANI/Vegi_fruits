import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
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
    const hoursForExpiration = 24;

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
}

export default AuthController;
