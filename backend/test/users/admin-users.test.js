import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  CreditWalletModel,
  GenerationModel,
  UserModel,
} from '#src/database/models.js';

const UNKNOWN_ID = '000000000000000000000000';

describe('admin users list and detail', () => {
  let testApp;
  let admin;
  let firstUser;
  let secondUser;
  const nameTag = `Users${randomUUID().slice(0, 8)}`;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();

    await testApp.registerUser({ name: `${nameTag} First` });
    await testApp.registerUser({ name: `${nameTag} Second` });

    [firstUser, secondUser] = await UserModel.find({
      name: new RegExp(`^${nameTag}`),
    }).sort({ name: 1 });
  });

  after(async () => {
    await testApp.close();
  });

  function send(url, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method: 'GET', url, accessToken });
  }

  describe('GET /api/admin/users', () => {
    it('lists users with balance, last login and pagination meta', async () => {
      const response = await send(`/api/admin/users?search=${nameTag}`);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.users.length, 2);
      assert.deepEqual(response.body.meta, {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });

      const [user] = response.body.data.users;
      assert.equal(typeof user.id, 'string');
      assert.equal(user._id, undefined);
      assert.equal(user.balance, 50);
      assert.ok('lastLoginAt' in user);
      assert.equal(user.passwordHash, undefined);
      assert.equal(user.wallet, undefined);
    });

    it('shows the newest users first and can show the oldest first', async () => {
      const newest = await send(`/api/admin/users?search=${nameTag}`);
      const oldest = await send(
        `/api/admin/users?search=${nameTag}&sort=oldest`,
      );

      assert.deepEqual(
        newest.body.data.users.map((user) => user.name),
        [`${nameTag} Second`, `${nameTag} First`],
      );
      assert.deepEqual(
        oldest.body.data.users.map((user) => user.name),
        [`${nameTag} First`, `${nameTag} Second`],
      );
    });

    it('sorts by balance', async () => {
      await CreditWalletModel.updateOne(
        { userId: firstUser._id },
        { balance: 900 },
      );

      try {
        const response = await send(
          `/api/admin/users?search=${nameTag}&sort=balance`,
        );

        assert.deepEqual(
          response.body.data.users.map((user) => user.balance),
          [900, 50],
        );
      } finally {
        await CreditWalletModel.updateOne(
          { userId: firstUser._id },
          { balance: 50 },
        );
      }
    });

    it('searches by email too, in any letter case', async () => {
      const response = await send(
        `/api/admin/users?search=${encodeURIComponent(firstUser.email.toUpperCase())}`,
      );

      assert.equal(response.body.data.users.length, 1);
      assert.equal(response.body.data.users[0].id, firstUser.id);
    });

    it('treats regex characters in the search as plain text', async () => {
      const dot = await send(`/api/admin/users?search=${nameTag}.`);
      const star = await send(`/api/admin/users?search=.*`);

      assert.equal(dot.statusCode, 200);
      assert.equal(dot.body.data.users.length, 0);
      assert.equal(star.body.data.users.length, 0);
    });

    it('filters by role and status', async () => {
      await UserModel.updateOne(
        { _id: secondUser._id },
        { status: 'suspended' },
      );

      try {
        const suspended = await send(
          `/api/admin/users?search=${nameTag}&status=suspended`,
        );
        const admins = await send(
          `/api/admin/users?search=${nameTag}&role=admin`,
        );

        assert.deepEqual(
          suspended.body.data.users.map((user) => user.id),
          [secondUser.id],
        );
        assert.equal(admins.body.data.users.length, 0);
      } finally {
        await UserModel.updateOne(
          { _id: secondUser._id },
          { status: 'active' },
        );
      }
    });

    it('pages through the results', async () => {
      const response = await send(
        `/api/admin/users?search=${nameTag}&page=2&limit=1`,
      );

      assert.equal(response.body.data.users.length, 1);
      assert.equal(response.body.data.users[0].id, firstUser.id);
      assert.equal(response.body.meta.totalPages, 2);
    });

    it('rejects unknown filter values', async () => {
      const role = await send('/api/admin/users?role=owner');
      const sort = await send('/api/admin/users?sort=name');
      const extra = await send('/api/admin/users?foo=bar');

      assert.equal(role.statusCode, 400);
      assert.equal(sort.statusCode, 400);
      assert.equal(extra.statusCode, 200);
    });

    it('is only for admins', async () => {
      const user = await testApp.registerAndLogin();
      const userResponse = await send('/api/admin/users', user.accessToken);
      const anonymous = await send('/api/admin/users', null);

      assert.equal(userResponse.statusCode, 403);
      assert.equal(anonymous.statusCode, 401);
    });
  });

  describe('GET /api/admin/users/:userId', () => {
    it('returns the user with balance, sessions, usage and transactions', async () => {
      await testApp.loginUser({ email: firstUser.email });
      await GenerationModel.create([
        {
          userId: firstUser._id,
          capability: 'text_to_speech',
          status: 'completed',
          modelId: firstUser._id,
          providerModelId: 'gpt-realtime-2.1-mini',
          creditsPerUnit: 1,
          creditsHeld: 4,
          creditsCharged: 4,
        },
        {
          userId: firstUser._id,
          capability: 'speech_to_text',
          status: 'failed',
          modelId: firstUser._id,
          providerModelId: 'gpt-transcribe',
          creditsPerUnit: 1,
          creditsHeld: 3,
          creditsRefunded: 3,
        },
        {
          userId: secondUser._id,
          capability: 'text_to_speech',
          status: 'completed',
          modelId: secondUser._id,
          providerModelId: 'gpt-realtime-2.1-mini',
          creditsPerUnit: 1,
          creditsCharged: 9,
        },
      ]);

      const response = await send(`/api/admin/users/${firstUser.id}`);
      const data = response.body.data;

      assert.equal(response.statusCode, 200);
      assert.equal(data.user.id, firstUser.id);
      assert.equal(data.user.email, firstUser.email);
      assert.equal(data.user.passwordHash, undefined);
      assert.equal(data.balance, 50);
      assert.equal(data.activeSessions, 1);
      assert.deepEqual(data.usage, { creditsUsed: 4, generations: 1 });
      assert.equal(data.recentTransactions.length, 1);
      assert.equal(data.recentTransactions[0].type, 'signup_grant');
      assert.equal(data.recentTransactions[0].amount, 50);
    });

    it('counts usage per user and zero for a new user', async () => {
      const response = await send(`/api/admin/users/${secondUser.id}`);

      assert.equal(response.body.data.activeSessions, 0);
      assert.deepEqual(response.body.data.usage, {
        creditsUsed: 9,
        generations: 1,
      });

      const fresh = await testApp.createLoggedInUser({ balance: 7 });
      const freshResponse = await send(`/api/admin/users/${fresh.user.id}`);

      assert.deepEqual(freshResponse.body.data.usage, {
        creditsUsed: 0,
        generations: 0,
      });
      assert.equal(freshResponse.body.data.balance, 7);
      assert.deepEqual(freshResponse.body.data.recentTransactions, []);
    });

    it('returns 404 for an unknown user', async () => {
      const response = await send(`/api/admin/users/${UNKNOWN_ID}`);

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'User not found');
    });

    it('rejects an id that is not an object id', async () => {
      const response = await send('/api/admin/users/not-an-id');

      assert.equal(response.statusCode, 400);
    });
  });
});
