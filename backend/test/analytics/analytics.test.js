import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  CreditTransactionModel,
  CreditWalletModel,
  GenerationModel,
  UserModel,
} from '#src/database/models.js';

const DAY = 24 * 60 * 60 * 1000;

describe('admin analytics overview', () => {
  let testApp;
  let admin;
  let user;
  let catalog;

  before(async () => {
    testApp = await buildTestApp();
    catalog = await testApp.seedCatalog();
    admin = await testApp.createLoggedInUser({ role: 'admin' });
    user = await testApp.createLoggedInUser({ email: 'listener@example.com' });

    const now = Date.now();

    await UserModel.updateOne(
      { _id: user.user._id },
      { lastLoginAt: new Date(now - 2 * DAY) },
    );
    await UserModel.collection.insertOne({
      name: 'Old User',
      email: 'old@example.com',
      passwordHash: 'x',
      role: 'user',
      status: 'active',
      lastLoginAt: new Date(now - 90 * DAY),
      createdAt: new Date(now - 400 * DAY),
      updatedAt: new Date(now - 400 * DAY),
    });

    const base = {
      userId: user.user._id,
      modelId: catalog.realtimeModel._id,
      providerModelId: 'gpt-realtime-2.1-mini',
      creditsPerUnit: 1,
    };

    await GenerationModel.create([
      {
        ...base,
        capability: 'text_to_speech',
        status: 'completed',
        creditsHeld: 5,
        creditsCharged: 5,
      },
      {
        ...base,
        capability: 'text_to_speech',
        status: 'completed',
        creditsHeld: 3,
        creditsCharged: 3,
      },
      {
        ...base,
        capability: 'realtime',
        status: 'completed',
        creditsHeld: 9,
        creditsCharged: 6,
      },
      {
        ...base,
        capability: 'speech_to_text',
        status: 'failed',
        errorCategory: 'timeout',
        creditsHeld: 2,
        creditsRefunded: 2,
      },
    ]);
    await GenerationModel.collection.insertOne({
      ...base,
      capability: 'agent_chat',
      status: 'completed',
      creditsCharged: 50,
      createdAt: new Date(now - 40 * DAY),
      updatedAt: new Date(now - 40 * DAY),
    });

    const wallet = await CreditWalletModel.findOne({ userId: user.user._id });
    const transaction = {
      userId: user.user._id,
      walletId: wallet._id,
      balanceAfter: 10,
    };

    await CreditTransactionModel.create([
      { ...transaction, type: 'signup_grant', amount: 50 },
      { ...transaction, type: 'admin_credit', amount: 20 },
      { ...transaction, type: 'usage_hold', amount: -9 },
      { ...transaction, type: 'usage_refund', amount: 3 },
      { ...transaction, type: 'usage_hold', amount: -8 },
      { ...transaction, type: 'usage_hold', amount: -2 },
      { ...transaction, type: 'usage_refund', amount: 2 },
    ]);
    await CreditTransactionModel.collection.insertOne({
      ...transaction,
      type: 'usage_hold',
      amount: -100,
      createdAt: new Date(now - 45 * DAY),
    });
  });

  after(async () => {
    await testApp.close();
  });

  function overview(accessToken = admin.accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/analytics/overview',
      accessToken,
    });
  }

  it('only lets admins read analytics', async () => {
    const response = await overview(user.accessToken);

    assert.equal(response.statusCode, 403);
  });

  it('summarises users, generations and credits', async () => {
    const response = await overview();
    const data = response.body.data.overview;

    assert.equal(response.statusCode, 200);
    assert.deepEqual(data.users, {
      total: 3,
      activeLast30Days: 1,
      newThisMonth: 2,
    });
    assert.deepEqual(data.generations, { today: 4, last7Days: 4 });
    assert.deepEqual(data.credits, {
      usedToday: 14,
      usedLast30Days: 14,
      grantedLast30Days: 70,
    });
  });

  it('breaks usage down by capability from completed generations', async () => {
    const response = await overview();
    const usage = response.body.data.overview.usageByCapability;

    assert.equal(usage.length, 5);
    assert.deepEqual(
      usage.find((item) => item.capability === 'text_to_speech'),
      {
        capability: 'text_to_speech',
        label: 'Text to Speech',
        credits: 8,
        runs: 2,
      },
    );
    assert.deepEqual(
      usage.find((item) => item.capability === 'realtime'),
      {
        capability: 'realtime',
        label: 'Real-time conversation',
        credits: 6,
        runs: 1,
      },
    );
    assert.equal(
      usage.find((item) => item.capability === 'speech_to_text').runs,
      0,
    );
    assert.equal(
      usage.find((item) => item.capability === 'agent_chat').credits,
      0,
    );
  });

  it('counts requests for the last 8 weeks', async () => {
    const response = await overview();
    const weeks = response.body.data.overview.weeklyRequests;
    const lastWeek = weeks.at(-1);

    assert.equal(weeks.length, 8);
    assert.equal(lastWeek.count, 4);
    assert.equal(new Date(`${lastWeek.weekStart}T00:00:00Z`).getUTCDay(), 1);
    assert.equal(
      weeks.reduce((total, week) => total + week.count, 0),
      5,
    );
  });

  it('lists the latest failed jobs', async () => {
    const response = await overview();
    const failed = response.body.data.overview.failedJobs;

    assert.equal(failed.length, 1);
    assert.equal(failed[0].userEmail, 'listener@example.com');
    assert.equal(failed[0].capability, 'speech_to_text');
    assert.equal(failed[0].errorCategory, 'timeout');
    assert.equal(typeof failed[0].id, 'string');
  });
});
