import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PASSWORD, buildTestApp } from '../helpers/test-app.js';
import {
  CreditTransactionModel,
  CreditWalletModel,
  PlatformSettingsModel,
  UserModel,
  UserSettingsModel,
} from '#src/database/models.js';

describe('POST /api/auth/register', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function register(payload) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/auth/register',
      payload,
    });
  }

  function setSignupCredits(signupCredits) {
    return PlatformSettingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: { signupCredits } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  it('creates a user with a normalized name and email', async () => {
    const email = testApp.makeEmail();

    const response = await register({
      name: '  Ali Khan  ',
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.user.name, 'Ali Khan');
    assert.equal(response.body.data.user.email, email);
    assert.equal(response.body.data.user.role, 'user');
    assert.equal(response.body.data.user.status, 'active');
    assert.equal(response.body.data.user.emailVerifiedAt, null);
    assert.ok(response.body.data.user.id);
    assert.equal('_id' in response.body.data.user, false);
    assert.equal('passwordHash' in response.body.data.user, false);
  });

  it('stores the password as an argon2id hash', async () => {
    const email = await testApp.registerUser();

    const user = await UserModel.findOne({ email }).select('+passwordHash');

    assert.match(user.passwordHash, /^\$argon2id\$/);
  });

  it('creates the wallet, grants the signup credits once and creates settings', async () => {
    await setSignupCredits(50);
    const email = await testApp.registerUser();
    const user = await UserModel.findOne({ email });

    const wallet = await CreditWalletModel.findOne({ userId: user._id });
    const transactions = await CreditTransactionModel.find({
      userId: user._id,
    });
    const settings = await UserSettingsModel.findOne({ userId: user._id });

    assert.equal(wallet.balance, 50);
    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].type, 'signup_grant');
    assert.equal(transactions[0].amount, 50);
    assert.equal(transactions[0].reason, 'Signup bonus');
    assert.equal(transactions[0].idempotencyKey, `signup:${user._id}`);
    assert.ok(settings);
    assert.equal(settings.defaultFormat, 'mp3');
  });

  it('skips the signup grant when the platform gives no credits', async () => {
    await setSignupCredits(0);

    try {
      const email = await testApp.registerUser();
      const user = await UserModel.findOne({ email });

      const wallet = await CreditWalletModel.findOne({ userId: user._id });
      const transactions = await CreditTransactionModel.countDocuments({
        userId: user._id,
      });

      assert.equal(wallet.balance, 0);
      assert.equal(transactions, 0);
    } finally {
      await setSignupCredits(50);
    }
  });

  it('rejects an email that is already registered, in any letter case', async () => {
    const email = await testApp.registerUser();
    const usersBefore = await UserModel.countDocuments();

    const response = await register({
      name: 'Someone Else',
      email: email.toUpperCase(),
      password: TEST_PASSWORD,
    });

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.code, 'CONFLICT');
    assert.equal(
      response.body.message,
      'An account with this email already exists',
    );
    assert.equal(await UserModel.countDocuments(), usersBefore);
  });

  it('rejects invalid input', async () => {
    const response = await register({
      name: '   ',
      email: 'not-an-email',
      password: 'short',
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'VALIDATION_ERROR');
  });

  it('asks for a password with at least one letter and one number', async () => {
    const lettersOnly = await register({
      name: 'Letters',
      email: testApp.makeEmail(),
      password: 'onlyletters',
    });
    const digitsOnly = await register({
      name: 'Digits',
      email: testApp.makeEmail(),
      password: '1234567890',
    });
    const tooLong = await register({
      name: 'Long',
      email: testApp.makeEmail(),
      password: `a1${'x'.repeat(127)}`,
    });

    assert.equal(lettersOnly.statusCode, 400);
    assert.equal(digitsOnly.statusCode, 400);
    assert.equal(tooLong.statusCode, 400);
  });

  it('ignores a role sent in the body', async () => {
    const response = await register({
      name: 'Sneaky',
      email: testApp.makeEmail(),
      password: TEST_PASSWORD,
      role: 'admin',
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.user.role, 'user');
  });
});
