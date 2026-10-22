import { setTimeout as wait } from 'node:timers/promises';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AuthSessionModel, UserModel } from '#src/database/models.js';

describe('checkUserIsLoggedInHook (GET /api/auth/me)', () => {
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

  it('returns the logged-in user for a valid token', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.user.email, email);
  });

  it('rejects a request without a token', async () => {
    const response = await getMe();

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Please log in to continue');
  });

  it('rejects a token with a changed signature', async () => {
    const { accessToken } = await testApp.registerAndLogin();
    const signatureStart = accessToken.lastIndexOf('.') + 1;
    const changedCharacter = accessToken[signatureStart] === 'A' ? 'B' : 'A';
    const changedToken =
      accessToken.slice(0, signatureStart) +
      changedCharacter +
      accessToken.slice(signatureStart + 1);

    const response = await getMe(changedToken);

    assert.equal(response.statusCode, 401);
  });

  it('rejects an expired access token', async () => {
    const { user } = await testApp.registerAndLogin();
    const session = await AuthSessionModel.findOne({ userId: user.id });
    const shortLivedToken = testApp.app.jwt.sign(
      { sub: user.id, fid: session.familyId },
      { expiresIn: '1s' },
    );

    await wait(1100);
    const response = await getMe(shortLivedToken);

    assert.equal(response.statusCode, 401);
  });

  it('rejects a token whose login was logged out', async () => {
    const { accessToken, refreshToken } = await testApp.registerAndLogin();

    await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/logout',
      refreshToken,
    });
    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 401);
  });

  it('rejects a token whose login has expired', async () => {
    const { user, accessToken } = await testApp.registerAndLogin();
    await AuthSessionModel.updateMany(
      { userId: user.id },
      { expiresAt: new Date(Date.now() - 60 * 1000) },
    );

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 401);
  });

  it('blocks a suspended user', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();
    await UserModel.updateOne({ email }, { status: 'suspended' });

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 403);
  });

  it('rejects a deactivated user', async () => {
    const { email, accessToken } = await testApp.registerAndLogin();
    await UserModel.updateOne({ email }, { status: 'deactivated' });

    const response = await getMe(accessToken);

    assert.equal(response.statusCode, 401);
  });
});
