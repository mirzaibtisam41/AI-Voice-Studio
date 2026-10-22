import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';
import { AuthTokenModel, UserModel } from '#src/database/models.js';

const NEW_PASSWORD = 'brand-new-password1';

describe('password reset', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(url, payload, accessToken) {
    return testApp.sendRequest({ method: 'POST', url, payload, accessToken });
  }

  function forgotPassword(email) {
    return send('/api/auth/forgot-password', { email });
  }

  function resetPassword(token, password = NEW_PASSWORD) {
    return send('/api/auth/reset-password', { token, password });
  }

  it('answers the same way for known and unknown emails', async () => {
    const user = await testApp.registerAndLogin();
    const sentBefore = testApp.mailer.sentEmails.length;

    const known = await forgotPassword(user.email.toUpperCase());
    const unknown = await forgotPassword('nobody-here@example.com');

    assert.equal(known.statusCode, 200);
    assert.equal(unknown.statusCode, 200);
    assert.equal(known.body.message, unknown.body.message);
    assert.equal(testApp.mailer.sentEmails.length, sentBefore + 1);
    assert.equal(
      testApp.mailer.findLastEmailTo('nobody-here@example.com'),
      null,
    );
  });

  it('stores only a hash of the reset token that expires in 30 minutes', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    const stored = await AuthTokenModel.findOne({
      userId: user.user.id,
      type: 'password_reset',
    }).select('+tokenHash');
    const minutesLeft = (stored.expiresAt.getTime() - Date.now()) / 60000;

    assert.notEqual(stored.tokenHash, token);
    assert.equal(stored.tokenHash.length, 64);
    assert.ok(minutesLeft > 29 && minutesLeft <= 30);
  });

  it('emails a reset link that sets a new password and logs out every device', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const email = testApp.mailer.findLastEmailTo(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    assert.match(email.subject, /Reset your AI Voice Studio password/);
    assert.match(email.text, /http:\/\/localhost:3000\/reset-password\?token=/);
    assert.match(email.html, /Choose a new password/);

    const response = await resetPassword(token);
    const me = await testApp.sendRequest({
      method: 'GET',
      url: '/api/auth/me',
      accessToken: user.accessToken,
    });
    const refresh = await testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/refresh',
      refreshToken: user.refreshToken,
    });
    const oldLogin = await send('/api/auth/login', {
      email: user.email,
      password: TEST_PASSWORD,
    });
    const newLogin = await send('/api/auth/login', {
      email: user.email,
      password: NEW_PASSWORD,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(me.statusCode, 401);
    assert.equal(refresh.statusCode, 401);
    assert.equal(oldLogin.statusCode, 401);
    assert.equal(newLogin.statusCode, 200);
    assert.ok(newLogin.body.data.user.emailVerifiedAt);
  });

  it('accepts a reset link only once', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    const first = await resetPassword(token);
    const second = await resetPassword(token, 'yet-another-password2');
    const stored = await AuthTokenModel.findOne({
      userId: user.user.id,
      type: 'password_reset',
    });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 400);
    assert.ok(stored.usedAt);
  });

  it('rejects an expired or made up link and a weak password', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);
    await AuthTokenModel.updateMany(
      { userId: user.user.id },
      { expiresAt: new Date(Date.now() - 60 * 60 * 1000) },
    );

    const expired = await resetPassword(token);
    const madeUp = await resetPassword('not-a-real-token');
    const short = await resetPassword(token, 'abc1');
    const noNumber = await resetPassword(token, 'no-number-here');

    assert.equal(expired.statusCode, 400);
    assert.equal(
      expired.body.message,
      'This reset link is not valid anymore. Ask for a new one.',
    );
    assert.equal(madeUp.statusCode, 400);
    assert.equal(short.statusCode, 400);
    assert.equal(noNumber.statusCode, 400);
  });

  it('sends at most one email every two minutes and a new link replaces the old one', async () => {
    const user = await testApp.registerAndLogin();
    await forgotPassword(user.email);
    const firstToken = testApp.mailer.readTokenFromLastEmailTo(user.email);
    const countAfterFirst = testApp.mailer.sentEmails.length;

    await forgotPassword(user.email);
    assert.equal(testApp.mailer.sentEmails.length, countAfterFirst);

    await AuthTokenModel.collection.updateMany(
      { userId: new mongoose.Types.ObjectId(user.user.id) },
      { $set: { createdAt: new Date(Date.now() - 3 * 60 * 1000) } },
    );
    await forgotPassword(user.email);
    const secondToken = testApp.mailer.readTokenFromLastEmailTo(user.email);

    assert.notEqual(secondToken, firstToken);
    assert.equal((await resetPassword(firstToken)).statusCode, 400);
    assert.equal((await resetPassword(secondToken)).statusCode, 200);
  });

  it('does not send a reset email to a deactivated account', async () => {
    const email = await testApp.registerUser();
    await UserModel.updateOne({ email }, { status: 'deactivated' });
    const sentBefore = testApp.mailer.sentEmails.length;

    const response = await forgotPassword(email);

    assert.equal(response.statusCode, 200);
    assert.equal(testApp.mailer.sentEmails.length, sentBefore);
  });
});
