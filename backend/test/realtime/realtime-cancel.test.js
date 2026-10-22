import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  CreditTransactionModel,
  CreditWalletModel,
  GenerationModel,
} from '#src/database/models.js';

describe('cancelling a real-time session', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  async function balanceOf(user) {
    return (await CreditWalletModel.findOne({ userId: user._id })).balance;
  }

  async function startSession({ accessToken }) {
    const response = await testApp.sendRequest({
      method: 'POST',
      url: '/api/realtime/sessions',
      accessToken,
      payload: { voiceCode: 'marin' },
    });

    return response.body.data.sessionId;
  }

  function cancelSession({ accessToken, sessionId }) {
    return testApp.sendRequest({
      method: 'POST',
      url: `/api/realtime/sessions/${sessionId}/cancel`,
      accessToken,
    });
  }

  it('refunds the full hold of a session that could not connect', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken });

    assert.equal(await balanceOf(user), 20);

    const response = await cancelSession({ accessToken, sessionId });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.refundedCredits, 30);
    assert.equal(response.body.data.balance, 50);
    assert.equal(response.body.data.session.status, 'failed');
    assert.equal(response.body.data.session.creditsCharged, 0);
    assert.equal(
      response.body.data.session.errorCategory,
      'provider_unavailable',
    );
    assert.equal(await balanceOf(user), 50);

    const refund = await CreditTransactionModel.findOne({
      userId: user._id,
      generationId: sessionId,
      type: 'usage_refund',
    });

    assert.equal(refund.reason, 'Refund for a session that could not connect');
  });

  it('is idempotent', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken });

    const first = await cancelSession({ accessToken, sessionId });
    const second = await cancelSession({ accessToken, sessionId });

    assert.equal(first.statusCode, 200);
    assert.equal(second.statusCode, 200);
    assert.equal(second.body.data.refundedCredits, 30);
    assert.equal(second.body.data.balance, 50);
    assert.equal(await balanceOf(user), 50);
    assert.equal(
      await CreditTransactionModel.countDocuments({
        userId: user._id,
        type: 'usage_refund',
      }),
      1,
    );
  });

  it('only cancels your own sessions', async () => {
    const owner = await testApp.createLoggedInUser();
    const other = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken: owner.accessToken });

    const response = await cancelSession({
      accessToken: other.accessToken,
      sessionId,
    });

    assert.equal(response.statusCode, 404);
    assert.equal(
      (await GenerationModel.findById(sessionId)).status,
      'processing',
    );
    assert.equal(await balanceOf(owner.user), 20);
  });

  it('refuses a session that started more than a minute ago', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken });

    await GenerationModel.updateOne(
      { _id: sessionId },
      { $set: { 'realtime.startedAt': new Date(Date.now() - 61 * 1000) } },
    );

    const response = await cancelSession({ accessToken, sessionId });

    assert.equal(response.statusCode, 400);
    assert.equal(
      (await GenerationModel.findById(sessionId)).status,
      'processing',
    );
    assert.equal(await balanceOf(user), 20);
  });

  it('refuses a session that already ended', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken });

    await testApp.sendRequest({
      method: 'POST',
      url: `/api/realtime/sessions/${sessionId}/end`,
      accessToken,
      payload: { transcript: [{ role: 'user', text: 'Hello' }] },
    });

    const response = await cancelSession({ accessToken, sessionId });

    assert.equal(response.statusCode, 409);
    assert.equal(await balanceOf(user), 47);
  });

  it('refuses a session that has a transcript', async () => {
    const { accessToken } = await testApp.createLoggedInUser();
    const sessionId = await startSession({ accessToken });

    await GenerationModel.updateOne(
      { _id: sessionId },
      { $set: { 'output.transcriptLines': [{ role: 'user', text: 'Hi' }] } },
    );

    const response = await cancelSession({ accessToken, sessionId });

    assert.equal(response.statusCode, 400);
  });
});
