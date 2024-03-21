const { expect } = require('chai');
const sinon = require('sinon');
const UsersController = require('../controllers/UsersController');
const dbClient = require('../utils/db');

describe('UsersController', () => {
  describe('postNew', () => {
    it('should create a new user and return status 201', async () => {
      const request = {
        body: { email: 'test@example.com', password: 'password123' }
      };
      const response = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub()
      };

      // Stub the findOne and insertOne methods of dbClient.usersCollection
      const findOneStub = sinon.stub(dbClient.usersCollection, 'findOne').resolves(null);
      const insertOneStub = sinon.stub(dbClient.usersCollection, 'insertOne').resolves({ insertedId: 'user123' });
      
      // Stub the add method of userQueue
      const userQueueAddStub = sinon.stub(userQueue, 'add').resolves();
      
      // Call the controller method
      await UsersController.postNew(request, response);

      // Verify that the response status is set to 201
      expect(response.status.calledWith(201)).to.be.true;

      // Verify that the response contains the inserted user object with the correct ID
      expect(response.send.calledOnce).to.be.true;
      expect(response.send.firstCall.args[0]).to.deep.equal({
        id: 'user123',
        email: 'test@example.com'
      });

      // Restore the stubs after the test
      findOneStub.restore();
      insertOneStub.restore();
      userQueueAddStub.restore();
    });
  });
});
