import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';
import { AuthTokenModel } from '#src/database/models.js';

describe('email verification', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, { payload, accessToken } = {}) {
    return testApp.sendRequest({ method, url, payload, accessToken });
  }

  function verify(token) {
    return send('POST', '/api/auth/verify-email', { payload: { token } });
  }

  function makeTokensOlder(userId) {
    return AuthTokenModel.collection.updateMany(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { createdAt: new Date(Date.now() - 2 * 60 * 1000) } },
    );
  }

  it('emails a confirmation link that works for 24 hours after signing up', async () => {
    const user = await testApp.registerAndLogin();
    const email = testApp.mailer.findLastEmailTo(user.email);
    const stored = await AuthTokenModel.findOne({
      userId: user.user.id,
      type: 'email_verify',
    });
    const hoursLeft = (stored.expiresAt.getTime() - Date.now()) / 3600000;

    assert.equal(user.user.emailVerifiedAt, null);
    assert.match(email.subject, /Confirm your email/);
    assert.match(email.text, /http:\/\/localhost:3000\/verify-email\?token=/);
    assert.ok(hoursLeft > 23.9 && hoursLeft <= 24);
  });

  it('confirms the email once with the link', async () => {
    const user = await testApp.registerAndLogin();
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);

    const first = await verify(token);
    const second = await verify(token);
    const me = await send('GET', '/api/auth/me', {
      accessToken: user.accessToken,
    });

    assert.equal(first.statusCode, 200);
    assert.equal(first.body.data.email, user.email);
    assert.ok(first.body.data.emailVerifiedAt);
    assert.equal(second.statusCode, 400);
    assert.ok(me.body.data.user.emailVerifiedAt);
  });

  it('does not accept a reset token as a confirmation link', async () => {
    const user = await testApp.registerAndLogin();
    await send('POST', '/api/auth/forgot-password', {
      payload: { email: user.email },
    });
    const resetToken = testApp.mailer.readTokenFromLastEmailTo(user.email);

    const response = await verify(resetToken);

    assert.equal(response.statusCode, 400);
  });

  it('rejects an expired link', async () => {
    const user = await testApp.registerAndLogin();
    const token = testApp.mailer.readTokenFromLastEmailTo(user.email);
    await AuthTokenModel.updateMany(
      { userId: user.user.id },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    const response = await verify(token);

    assert.equal(response.statusCode, 400);
  });

  it('sends a new link on request, then waits a minute', async () => {
    const user = await testApp.registerAndLogin();
    const firstToken = testApp.mailer.readTokenFromLastEmailTo(user.email);
    await makeTokensOlder(user.user.id);

    const resent = await send('POST', '/api/auth/resend-verification', {
      accessToken: user.accessToken,
    });
    const tooSoon = await send('POST', '/api/auth/resend-verification', {
      accessToken: user.accessToken,
    });
    const newToken = testApp.mailer.readTokenFromLastEmailTo(user.email);

    assert.equal(resent.statusCode, 200);
    assert.equal(tooSoon.statusCode, 429);
    assert.notEqual(newToken, firstToken);
    assert.equal((await verify(firstToken)).statusCode, 400);
    assert.equal((await verify(newToken)).statusCode, 200);
  });

  it('refuses to resend for a confirmed email or without login', async () => {
    const user = await testApp.registerAndLogin();
    await verify(testApp.mailer.readTokenFromLastEmailTo(user.email));

    const confirmed = await send('POST', '/api/auth/resend-verification', {
      accessToken: user.accessToken,
    });
    const anonymous = await send('POST', '/api/auth/resend-verification');

    assert.equal(confirmed.statusCode, 400);
    assert.equal(anonymous.statusCode, 401);
  });

  it('still creates the account when the email cannot be sent', async () => {
    const originalSend = testApp.mailer.sendEmail;
    testApp.mailer.sendEmail = async () => {
      throw new Error('mail server down');
    };

    try {
      const email = testApp.makeEmail();
      const response = await send('POST', '/api/auth/register', {
        payload: { name: 'No Mail', email, password: TEST_PASSWORD },
      });

      assert.equal(response.statusCode, 201);
    } finally {
      testApp.mailer.sendEmail = originalSend;
    }
  });
});
