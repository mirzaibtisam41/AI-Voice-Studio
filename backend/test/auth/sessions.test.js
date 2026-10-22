import { randomUUID } from 'node:crypto';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('logout and session management', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function getMe(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken,
    });
  }

  function listSessions(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/sessions',
      accessToken,
    });
  }

  function revokeSession(accessToken, familyId) {
    return testApp.sendRequest({
      method: 'DELETE',
      url: `/api/auth/sessions/${familyId}`,
      accessToken,
    });
  }

  async function loginOnThreeDevices() {
    const email = await testApp.registerUser();
    const laptop = await testApp.loginUser({ email });
    const phone = await testApp.loginUser({ email });
    const tablet = await testApp.loginUser({ email });

    return { laptop, phone, tablet };
  }

  it('returns the user with the wallet balance', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.user.email, email);
    assert.equal(response.body.data.balance, 50);
    assert.equal(response.body.data.user.passwordHash, undefined);
  });

  it('logout ends the login and clears the cookie', async () => {
    const { accessToken, refreshToken } = await testApp.registerAndLogin();

    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
    });
    const refreshAfterLogout = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.refreshCookie, '');
    assert.equal((await getMe(accessToken)).statusCode, 401);
    assert.equal(refreshAfterLogout.statusCode, 401);
  });

  it('logout works with an expired access token and twice in a row', async () => {
    const { refreshToken } = await testApp.registerAndLogin();

    const first = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
      headers: { authorization: 'Bearer expired.token.here' },
    });
    const second = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
    });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
  });

  it('logout without a cookie still succeeds', async () => {
    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
    });

    assert.equal(response.statusCode, 200);
  });

  it('lists one session per device and marks the current one', async () => {
    const { laptop } = await loginOnThreeDevices();

    const response = await listSessions(laptop.accessToken);
    const sessions = response.body.data.sessions;

    assert.equal(response.statusCode, 200);
    assert.equal(sessions.length, 3);
    assert.equal(sessions.filter((session) => session.isCurrent).length, 1);
    assert.ok(sessions[0].lastActiveAt);
    assert.ok(sessions[0].expiresAt);
    assert.equal(sessions[0].refreshTokenHash, undefined);
  });

  it('keeps one entry per device after a refresh', async () => {
    const { laptop } = await loginOnThreeDevices();
    const refreshed = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken: laptop.refreshToken,
    });

    const response = await listSessions(refreshed.body.data.accessToken);

    assert.equal(response.body.data.sessions.length, 3);
  });

  it('logs out one other device', async () => {
    const { laptop, phone } = await loginOnThreeDevices();
    const phoneFamilyId = (
      await listSessions(phone.accessToken)
    ).body.data.sessions.find((session) => session.isCurrent).familyId;

    const response = await revokeSession(laptop.accessToken, phoneFamilyId);

    assert.equal(response.statusCode, 200);
    assert.equal((await getMe(phone.accessToken)).statusCode, 401);
    assert.equal((await getMe(laptop.accessToken)).statusCode, 200);
    assert.equal(
      (await revokeSession(laptop.accessToken, phoneFamilyId)).statusCode,
      404,
    );
  });

  it('cannot log out a session of another user', async () => {
    const attacker = await testApp.registerAndLogin();
    const victim = await testApp.registerAndLogin();
    const victimFamilyId = (await listSessions(victim.accessToken)).body.data
      .sessions[0].familyId;

    const response = await revokeSession(attacker.accessToken, victimFamilyId);

    assert.equal(response.statusCode, 404);
    assert.equal((await getMe(victim.accessToken)).statusCode, 200);
  });

  it('rejects a session id that is not a uuid and an unknown one', async () => {
    const { accessToken } = await testApp.registerAndLogin();

    const invalid = await revokeSession(accessToken, 'abc');
    const unknown = await revokeSession(accessToken, randomUUID());

    assert.equal(invalid.statusCode, 400);
    assert.equal(unknown.statusCode, 404);
  });

  it('logs out every other device but keeps the current one', async () => {
    const { laptop, phone, tablet } = await loginOnThreeDevices();

    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout-others',
      accessToken: laptop.accessToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.loggedOutCount, 2);
    assert.equal((await getMe(phone.accessToken)).statusCode, 401);
    assert.equal((await getMe(tablet.accessToken)).statusCode, 401);
    assert.equal((await getMe(laptop.accessToken)).statusCode, 200);
  });

  it('requires login for session endpoints', async () => {
    const list = await listSessions();
    const others = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout-others',
    });

    assert.equal(list.statusCode, 401);
    assert.equal(others.statusCode, 401);
  });
});
