import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AuthSessionModel, UserModel } from '#src/database/models.js';

describe('POST /api/auth/refresh', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function refresh(refreshToken) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken,
    });
  }

  function getMe(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken,
    });
  }

  it('gives a new refresh token and links the old session to the new one', async () => {
    const { user, refreshToken } = await testApp.registerAndLogin();

    const response = await refresh(refreshToken);

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.data.accessToken);
    assert.equal(response.body.data.user.id, user.id);
    assert.ok(response.refreshCookie);
    assert.notEqual(response.refreshCookie, refreshToken);

    const sessions = await AuthSessionModel.find({ userId: user.id }).sort({
      createdAt: 1,
    });

    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].familyId, sessions[1].familyId);
    assert.equal(String(sessions[0].replacedById), String(sessions[1]._id));
    assert.ok(sessions[0].revokedAt);
    assert.equal(sessions[1].revokedAt, null);
    assert.equal((await getMe(response.body.data.accessToken)).statusCode, 200);
  });

  it('rejects a request without a cookie', async () => {
    const response = await refresh();

    assert.equal(response.statusCode, 401);
  });

  it('rejects an unknown refresh token and clears the cookie', async () => {
    const response = await refresh('not-a-real-token');

    assert.equal(response.statusCode, 401);
    assert.equal(response.refreshCookie, '');
  });

  it('rejects an expired refresh token', async () => {
    const { user, refreshToken } = await testApp.registerAndLogin();
    await AuthSessionModel.updateMany(
      { userId: user.id },
      { expiresAt: new Date(Date.now() - 60 * 1000) },
    );

    const response = await refresh(refreshToken);

    assert.equal(response.statusCode, 401);
  });

  it('allows an old token again within the grace period without ending the login', async () => {
    const { refreshToken } = await testApp.registerAndLogin();
    const first = await refresh(refreshToken);

    const reused = await refresh(refreshToken);
    const next = await refresh(first.refreshCookie);

    assert.equal(reused.statusCode, 401);
    assert.equal(next.statusCode, 200);
  });

  it('ends the whole login when an old token is reused after the grace period', async () => {
    const { user, refreshToken } = await testApp.registerAndLogin();
    const first = await refresh(refreshToken);
    await AuthSessionModel.updateMany(
      { userId: user.id, replacedById: { $ne: null } },
      { revokedAt: new Date(Date.now() - 60 * 1000) },
    );

    const reused = await refresh(refreshToken);
    const newest = await refresh(first.refreshCookie);
    const me = await getMe(first.body.data.accessToken);

    assert.equal(reused.statusCode, 401);
    assert.equal(newest.statusCode, 401);
    assert.equal(me.statusCode, 401);
  });

  it('does not end other logins of the same user on reuse', async () => {
    const { email, user, refreshToken } = await testApp.registerAndLogin();
    const otherDevice = await testApp.loginUser({ email });
    await refresh(refreshToken);
    await AuthSessionModel.updateMany(
      { userId: user.id, replacedById: { $ne: null } },
      { revokedAt: new Date(Date.now() - 60 * 1000) },
    );

    await refresh(refreshToken);

    assert.equal((await getMe(otherDevice.accessToken)).statusCode, 200);
  });

  it('lets only one of two parallel refreshes win', async () => {
    const { refreshToken } = await testApp.registerAndLogin();

    const responses = await Promise.all([
      refresh(refreshToken),
      refresh(refreshToken),
    ]);
    const statusCodes = responses.map((response) => response.statusCode);
    const winner = responses.find((response) => response.statusCode === 200);

    assert.deepEqual(statusCodes.sort(), [200, 401]);
    assert.equal((await refresh(winner.refreshCookie)).statusCode, 200);
  });

  it('blocks a suspended user and ends their login', async () => {
    const { email, user, refreshToken } = await testApp.registerAndLogin();
    await UserModel.updateOne({ email }, { status: 'suspended' });

    const response = await refresh(refreshToken);
    const activeSessions = await AuthSessionModel.countDocuments({
      userId: user.id,
      revokedAt: null,
    });

    assert.equal(response.statusCode, 403);
    assert.equal(activeSessions, 0);
  });

  it('ends the login of a deactivated user', async () => {
    const { email, user, refreshToken } = await testApp.registerAndLogin();
    await UserModel.updateOne({ email }, { status: 'deactivated' });

    const response = await refresh(refreshToken);
    const activeSessions = await AuthSessionModel.countDocuments({
      userId: user.id,
      revokedAt: null,
    });

    assert.equal(response.statusCode, 401);
    assert.equal(activeSessions, 0);
  });
});
