import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';
import {
  AuthSessionModel,
  PlatformSettingsModel,
  UserModel,
} from '#src/database/models.js';

describe('POST /api/auth/login', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function login(payload) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/login',
      payload,
    });
  }

  it('returns an access token and sets the refresh token cookie', async () => {
    const email = await testApp.registerUser();

    const response = await login({
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });
    const setCookie = [response.headers['set-cookie']].flat().join(';');

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.data.accessToken);
    assert.ok(response.refreshCookie);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Path=\/api\/auth/);
    assert.equal(response.body.data.user.email, email);
    assert.ok(response.body.data.user.lastLoginAt);
    assert.equal('passwordHash' in response.body.data.user, false);
  });

  it('saves a session with only the hash of the refresh token', async () => {
    const email = await testApp.registerUser();
    const { refreshToken } = await testApp.loginUser({ email });
    const user = await UserModel.findOne({ email });

    const sessions = await AuthSessionModel.find({ userId: user._id }).select(
      '+refreshTokenHash',
    );

    assert.equal(sessions.length, 1);
    assert.notEqual(sessions[0].refreshTokenHash, refreshToken);
    assert.equal(sessions[0].refreshTokenHash.length, 64);
    assert.ok(sessions[0].familyId);
    assert.equal(sessions[0].revokedAt, null);
    assert.ok(user.lastLoginAt);
  });

  it('rejects a wrong password', async () => {
    const email = await testApp.registerUser();

    const response = await login({ email, password: 'wrong-password1' });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Incorrect email or password');
  });

  it('gives an unknown email the same answer as a wrong password', async () => {
    const response = await login({
      email: testApp.makeEmail(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Incorrect email or password');
  });

  it('blocks a suspended user', async () => {
    const email = await testApp.registerUser();
    await UserModel.updateOne({ email }, { status: 'suspended' });

    const response = await login({ email, password: TEST_PASSWORD });

    assert.equal(response.statusCode, 403);
    assert.equal(response.refreshCookie, undefined);
  });

  it('gives a deactivated user the generic answer', async () => {
    const email = await testApp.registerUser();
    await UserModel.updateOne({ email }, { status: 'deactivated' });

    const response = await login({ email, password: TEST_PASSWORD });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.message, 'Incorrect email or password');
  });

  it('asks for a confirmed email when the platform requires it', async () => {
    const email = await testApp.registerUser();
    await PlatformSettingsModel.updateOne(
      { key: 'global' },
      { $set: { requireEmailVerification: true } },
    );

    try {
      const blocked = await login({ email, password: TEST_PASSWORD });

      await UserModel.updateOne({ email }, { emailVerifiedAt: new Date() });
      const allowed = await login({ email, password: TEST_PASSWORD });

      assert.equal(blocked.statusCode, 403);
      assert.equal(blocked.body.message, 'Please confirm your email first');
      assert.equal(allowed.statusCode, 200);
    } finally {
      await PlatformSettingsModel.updateOne(
        { key: 'global' },
        { $set: { requireEmailVerification: false } },
      );
    }
  });

  it('rejects a body without a password', async () => {
    const response = await login({ email: testApp.makeEmail() });

    assert.equal(response.statusCode, 400);
  });
});
