import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';
import { AuthSessionModel, UserModel } from '#src/database/models.js';

describe('my account API', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, accessToken, payload, refreshToken) {
    return testApp.sendRequest({
      method,
      url,
      accessToken,
      payload,
      refreshToken,
    });
  }

  it('requires login', async () => {
    const profile = await send('PATCH', '/api/me/profile', undefined, {
      name: 'Nobody',
    });
    const password = await send('POST', '/api/me/password', undefined, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'another-secret1',
    });
    const deactivate = await send('POST', '/api/me/deactivate', undefined, {
      password: TEST_PASSWORD,
    });

    assert.equal(profile.statusCode, 401);
    assert.equal(password.statusCode, 401);
    assert.equal(deactivate.statusCode, 401);
  });

  describe('PATCH /api/me/profile', () => {
    it('changes the name and keeps the email', async () => {
      const user = await testApp.registerAndLogin();

      const response = await send(
        'PATCH',
        '/api/me/profile',
        user.accessToken,
        { name: '  Sara Malik  ' },
      );
      const me = await send('GET', '/api/auth/me', user.accessToken);

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.user.name, 'Sara Malik');
      assert.equal(response.body.data.user.passwordHash, undefined);
      assert.equal(me.body.data.user.name, 'Sara Malik');
      assert.equal(me.body.data.user.email, user.email);
    });

    it('rejects an empty name and never changes the email', async () => {
      const user = await testApp.registerAndLogin();

      const empty = await send('PATCH', '/api/me/profile', user.accessToken, {
        name: '   ',
      });
      const withEmail = await send(
        'PATCH',
        '/api/me/profile',
        user.accessToken,
        { name: 'Sara', email: 'new@example.com' },
      );

      assert.equal(empty.statusCode, 400);
      assert.equal(withEmail.statusCode, 200);
      assert.equal(withEmail.body.data.user.email, user.email);
    });
  });

  describe('POST /api/me/password', () => {
    it('changes the password and logs out the other devices only', async () => {
      const user = await testApp.registerAndLogin();
      const otherDevice = await testApp.loginUser({ email: user.email });

      const response = await send(
        'POST',
        '/api/me/password',
        user.accessToken,
        { currentPassword: TEST_PASSWORD, newPassword: 'brand-new-secret1' },
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.loggedOutCount, 1);
      assert.equal(
        (await send('GET', '/api/auth/me', user.accessToken)).statusCode,
        200,
      );
      assert.equal(
        (await send('GET', '/api/auth/me', otherDevice.accessToken)).statusCode,
        401,
      );

      const oldLogin = await send('POST', '/api/auth/login', undefined, {
        email: user.email,
        password: TEST_PASSWORD,
      });
      const newLogin = await send('POST', '/api/auth/login', undefined, {
        email: user.email,
        password: 'brand-new-secret1',
      });

      assert.equal(oldLogin.statusCode, 401);
      assert.equal(newLogin.statusCode, 200);
    });

    it('rejects a wrong current password, the same password and a weak one', async () => {
      const user = await testApp.registerAndLogin();

      const wrong = await send('POST', '/api/me/password', user.accessToken, {
        currentPassword: 'not-my-password1',
        newPassword: 'brand-new-secret1',
      });
      const same = await send('POST', '/api/me/password', user.accessToken, {
        currentPassword: TEST_PASSWORD,
        newPassword: TEST_PASSWORD,
      });
      const short = await send('POST', '/api/me/password', user.accessToken, {
        currentPassword: TEST_PASSWORD,
        newPassword: 'abc1',
      });
      const noNumber = await send(
        'POST',
        '/api/me/password',
        user.accessToken,
        { currentPassword: TEST_PASSWORD, newPassword: 'no-number-here' },
      );

      assert.equal(wrong.statusCode, 400);
      assert.equal(wrong.body.message, 'Your current password is not right');
      assert.equal(same.statusCode, 400);
      assert.equal(short.statusCode, 400);
      assert.equal(noNumber.statusCode, 400);
    });
  });

  describe('POST /api/me/deactivate', () => {
    it('deactivates the account, ends every login and clears the cookie', async () => {
      const user = await testApp.registerAndLogin();
      const otherDevice = await testApp.loginUser({ email: user.email });

      const response = await send(
        'POST',
        '/api/me/deactivate',
        user.accessToken,
        { password: TEST_PASSWORD },
        user.refreshToken,
      );
      const stored = await UserModel.findById(user.user.id);
      const activeSessions = await AuthSessionModel.countDocuments({
        userId: user.user.id,
        revokedAt: null,
      });
      const login = await send('POST', '/api/auth/login', undefined, {
        email: user.email,
        password: TEST_PASSWORD,
      });
      const refresh = await send(
        'POST',
        '/api/auth/refresh',
        undefined,
        undefined,
        otherDevice.refreshToken,
      );

      assert.equal(response.statusCode, 200);
      assert.equal(response.refreshCookie, '');
      assert.equal(stored.status, 'deactivated');
      assert.equal(activeSessions, 0);
      assert.equal(
        (await send('GET', '/api/auth/me', user.accessToken)).statusCode,
        401,
      );
      assert.equal(login.statusCode, 401);
      assert.equal(login.body.message, 'Incorrect email or password');
      assert.equal(refresh.statusCode, 401);
    });

    it('needs the right password', async () => {
      const user = await testApp.registerAndLogin();

      const response = await send(
        'POST',
        '/api/me/deactivate',
        user.accessToken,
        { password: 'not-my-password1' },
      );
      const stored = await UserModel.findById(user.user.id);

      assert.equal(response.statusCode, 400);
      assert.equal(stored.status, 'active');
    });
  });
});
