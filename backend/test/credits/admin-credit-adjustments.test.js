import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AuditLogModel,
  CreditTransactionModel,
  CreditWalletModel,
} from '#src/database/models.js';
import { adminUserWalletRoutes } from '#src/modules/credit-wallets/credit-wallets.routes.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import { AUDIT_ACTION } from '#src/modules/audit-logs/audit-log.constants.js';

describe('admin credit adjustments', () => {
  let testApp;
  let admin;
  let member;
  let target;

  function adjust({ userId = target.user._id, payload, headers, accessToken }) {
    return testApp.sendRequest({
      method: 'POST',
      url: `/api/admin/users/${userId}/credit-adjustments`,
      payload,
      headers,
      accessToken: accessToken ?? admin.accessToken,
    });
  }

  async function balanceOf(userId) {
    return (await CreditWalletModel.findOne({ userId })).balance;
  }

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.createLoggedInUser({
      role: 'admin',
      name: 'Admin Person',
      email: 'admin-c@example.com',
    });
    member = await testApp.createLoggedInUser({ balance: 10 });
    target = await testApp.createLoggedInUser({
      balance: 40,
      name: 'Target User',
      email: 'target-c@example.com',
    });
  });

  after(async () => {
    await testApp.close();
  });

  it('blocks non-admins', async () => {
    const wallet = await testApp.sendRequest({
      method: 'GET',
      url: `/api/admin/users/${target.user._id}/wallet`,
      accessToken: member.accessToken,
    });
    const adjustment = await adjust({
      payload: { amount: 5, reason: 'Gift' },
      accessToken: member.accessToken,
    });
    const recent = await testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/users/credit-adjustments/recent',
      accessToken: member.accessToken,
    });

    assert.equal(wallet.statusCode, 403);
    assert.equal(adjustment.statusCode, 403);
    assert.equal(recent.statusCode, 403);
    assert.equal(await balanceOf(target.user._id), 40);
  });

  it('adds credits with a ledger row and an audit log', async () => {
    const response = await adjust({
      payload: { amount: 15, reason: '  Goodwill gesture  ' },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.message, 'Credits added');
    assert.equal(response.body.data.balance, 55);
    assert.equal(response.body.data.transaction.amount, 15);
    assert.equal(
      response.body.data.transaction.type,
      CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT,
    );
    assert.equal(response.body.data.transaction.reason, 'Goodwill gesture');
    assert.equal(await balanceOf(target.user._id), 55);

    const row = await CreditTransactionModel.findById(
      response.body.data.transaction.id,
    );

    assert.equal(String(row.createdBy), String(admin.user._id));

    const log = await AuditLogModel.findOne({
      action: AUDIT_ACTION.WALLET_ADJUSTED,
      targetId: String(target.user._id),
    });

    assert.ok(log);
    assert.equal(log.actorEmail, 'admin-c@example.com');
    assert.equal(log.targetLabel, 'target-c@example.com');
    assert.deepEqual(log.details, {
      before: 40,
      after: 55,
      amount: 15,
      reason: 'Goodwill gesture',
    });
  });

  it('deducts credits', async () => {
    const response = await adjust({
      payload: { amount: -5, reason: 'Duplicate grant' },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.message, 'Credits deducted');
    assert.equal(response.body.data.balance, 50);
    assert.equal(
      response.body.data.transaction.type,
      CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
    );
  });

  it('refuses to take the balance below zero', async () => {
    const logsBefore = await AuditLogModel.countDocuments();
    const response = await adjust({
      payload: { amount: -51, reason: 'Too much' },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, 'This would make the balance negative');
    assert.equal(await balanceOf(target.user._id), 50);
    assert.equal(await AuditLogModel.countDocuments(), logsBefore);
  });

  it('allows a debit down to exactly zero', async () => {
    const fresh = await testApp.createLoggedInUser({ balance: 8 });
    const response = await adjust({
      userId: fresh.user._id,
      payload: { amount: -8, reason: 'Close out' },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.balance, 0);
  });

  it('validates the amount and the reason', async () => {
    const cases = [
      { amount: 0, reason: 'Zero' },
      { amount: 1.5, reason: 'Fraction' },
      { amount: 100001, reason: 'Too big' },
      { amount: -100001, reason: 'Too small' },
      { amount: 5, reason: 'ab' },
      { amount: 5, reason: 'x'.repeat(301) },
      { amount: 5 },
      { reason: 'No amount' },
      { amount: 5, reason: '     ' },
    ];

    for (const payload of cases) {
      const response = await adjust({ payload });

      assert.equal(response.statusCode, 400, JSON.stringify(payload));
    }

    const padded = await adjust({ payload: { amount: 5, reason: '  a  ' } });

    assert.equal(padded.statusCode, 400);
    assert.equal(await balanceOf(target.user._id), 50);
  });

  it('accepts the maximum amount', async () => {
    const fresh = await testApp.createLoggedInUser({ balance: 0 });
    const response = await adjust({
      userId: fresh.user._id,
      payload: { amount: 100000, reason: 'Big grant' },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.balance, 100000);
  });

  it('returns 404 for an unknown user and 400 for a bad id', async () => {
    const unknown = await adjust({
      userId: new mongoose.Types.ObjectId(),
      payload: { amount: 5, reason: 'Ghost' },
    });
    const badId = await adjust({
      userId: 'not-an-id',
      payload: { amount: 5, reason: 'Ghost' },
    });

    assert.equal(unknown.statusCode, 404);
    assert.equal(badId.statusCode, 400);
  });

  it('applies an adjustment only once per idempotency key', async () => {
    const headers = { 'idempotency-key': 'adjust-once-123' };
    const logsBefore = await AuditLogModel.countDocuments({
      action: AUDIT_ACTION.WALLET_ADJUSTED,
    });

    const first = await adjust({
      payload: { amount: 7, reason: 'Promo' },
      headers,
    });
    const second = await adjust({
      payload: { amount: 7, reason: 'Promo' },
      headers,
    });

    assert.equal(first.statusCode, 201);
    assert.equal(second.statusCode, 200);
    assert.equal(second.body.message, 'This adjustment was already applied');
    assert.equal(
      second.body.data.transaction.id,
      first.body.data.transaction.id,
    );
    assert.equal(second.body.data.balance, 57);
    assert.equal(await balanceOf(target.user._id), 57);
    assert.equal(
      await AuditLogModel.countDocuments({
        action: AUDIT_ACTION.WALLET_ADJUSTED,
      }),
      logsBefore + 1,
    );

    const stored = await CreditTransactionModel.findById(
      first.body.data.transaction.id,
    );

    assert.equal(stored.idempotencyKey, 'admin-adjust:adjust-once-123');
  });

  it('replays a duplicate debit even when it would now overdraw', async () => {
    const fresh = await testApp.createLoggedInUser({ balance: 5 });
    const headers = { 'idempotency-key': 'debit-replay-1' };
    const payload = { amount: -5, reason: 'Clawback' };

    const first = await adjust({ userId: fresh.user._id, payload, headers });
    const second = await adjust({ userId: fresh.user._id, payload, headers });

    assert.equal(first.statusCode, 201);
    assert.equal(second.statusCode, 200);
    assert.equal(await balanceOf(fresh.user._id), 0);
  });

  it('refuses an idempotency key that belongs to another user', async () => {
    const fresh = await testApp.createLoggedInUser({ balance: 0 });
    const response = await adjust({
      userId: fresh.user._id,
      payload: { amount: 7, reason: 'Promo' },
      headers: { 'idempotency-key': 'adjust-once-123' },
    });

    assert.equal(response.statusCode, 409);
    assert.equal(await balanceOf(fresh.user._id), 0);
  });

  it('rejects a malformed idempotency key', async () => {
    const response = await adjust({
      payload: { amount: 1, reason: 'Promo' },
      headers: { 'idempotency-key': 'x'.repeat(151) },
    });

    assert.equal(response.statusCode, 400);
  });

  it('shows a user wallet with the last 20 transactions', async () => {
    for (let index = 0; index < 20; index += 1) {
      await adjust({ payload: { amount: 1, reason: `Bulk ${index}` } });
    }

    const response = await testApp.sendRequest({
      method: 'GET',
      url: `/api/admin/users/${target.user._id}/wallet`,
      accessToken: admin.accessToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.balance, 77);
    assert.equal(response.body.data.transactions.length, 20);
    assert.equal(response.body.data.transactions[0].reason, 'Bulk 19');
    assert.equal(response.body.data.transactions[0].balanceAfter, 77);
  });

  it('returns 404 for the wallet of an unknown user', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: `/api/admin/users/${new mongoose.Types.ObjectId()}/wallet`,
      accessToken: admin.accessToken,
    });

    assert.equal(response.statusCode, 404);
  });

  it('lists recent adjustments across users with names and emails', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/users/credit-adjustments/recent?limit=5',
      accessToken: admin.accessToken,
    });

    assert.equal(response.statusCode, 200);

    const total = await CreditTransactionModel.countDocuments({
      type: {
        $in: [
          CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT,
          CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
        ],
      },
    });

    assert.equal(response.body.meta.total, total);
    assert.equal(response.body.meta.totalPages, Math.ceil(total / 5));

    const [latest] = response.body.data.adjustments;

    assert.equal(response.body.data.adjustments.length, 5);
    assert.equal(latest.reason, 'Bulk 19');
    assert.equal(latest.amount, 1);
    assert.equal(latest.type, CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT);
    assert.deepEqual(latest.user, {
      id: String(target.user._id),
      name: 'Target User',
      email: 'target-c@example.com',
    });
    assert.equal(latest.admin.email, 'admin-c@example.com');
  });

  it('does not list signup grants or usage as adjustments', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/users/credit-adjustments/recent?limit=100',
      accessToken: admin.accessToken,
    });

    assert.ok(
      response.body.data.adjustments.every((row) =>
        [
          CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT,
          CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
        ].includes(row.type),
      ),
    );
  });
});

describe('admin wallet route matching', () => {
  let app;

  before(async () => {
    app = Fastify();
    await app.register(
      async (users) => {
        users.get('/:userId', async () => ({ owner: 'users' }));
        users.get('/:userId/:section', async () => ({ owner: 'users' }));
      },
      { prefix: '/api/admin/users' },
    );
    await app.register(adminUserWalletRoutes, { prefix: '/api/admin/users' });
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it('routes the static recent path to the wallet module', async () => {
    const recent = await app.inject({
      method: 'GET',
      url: '/api/admin/users/credit-adjustments/recent',
    });
    const other = await app.inject({
      method: 'GET',
      url: '/api/admin/users/credit-adjustments/other',
    });
    const profile = await app.inject({
      method: 'GET',
      url: '/api/admin/users/64b7f0c2a1b2c3d4e5f60718',
    });

    assert.equal(recent.statusCode, 401);
    assert.equal(other.json().owner, 'users');
    assert.equal(profile.json().owner, 'users');
  });
});
