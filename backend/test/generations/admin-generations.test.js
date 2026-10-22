import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import {
  AuditLogModel,
  CreditTransactionModel,
  CreditWalletModel,
  GenerationModel,
} from '#src/database/models.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { AUDIT_ACTION } from '#src/modules/audit-logs/audit-log.constants.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('admin generations', () => {
  let testApp;
  let admin;
  let alice;
  let bob;
  let aliceSpeech;
  let aliceFailed;
  let bobTranscription;
  let bobProcessing;
  let oldGeneration;

  async function start({ userId, capability, held, input = {} }) {
    const pricedModel = await resolvePricedModelService({ capability });

    return startGenerationService({
      userId,
      pricedModel,
      units: 0,
      creditsHeld: held,
      input,
    });
  }

  function send({ method = 'GET', url, payload, accessToken }) {
    return testApp.sendRequest({
      method,
      url,
      payload,
      accessToken: accessToken ?? admin.accessToken,
    });
  }

  function refund(generationId, reason = 'Customer complaint') {
    return send({
      method: 'POST',
      url: `/api/admin/generations/${generationId}/refund`,
      payload: { reason },
    });
  }

  async function balanceOf(userId) {
    return (await CreditWalletModel.findOne({ userId })).balance;
  }

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
    admin = await testApp.createLoggedInUser({
      role: 'admin',
      email: 'monitor-admin@example.com',
    });
    alice = await testApp.createLoggedInUser({
      balance: 50,
      name: 'Alice Adams',
      email: 'alice@studio.test',
    });
    bob = await testApp.createLoggedInUser({
      balance: 50,
      name: 'Bob Brown',
      email: 'bob@voices.test',
    });

    aliceSpeech = await start({
      userId: alice.user._id,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 6,
      input: { text: 'Hello world', voiceCode: 'marin', format: 'mp3' },
    });
    await completeGenerationService({
      generationId: aliceSpeech._id,
      creditsCharged: 4,
    });

    aliceFailed = await start({
      userId: alice.user._id,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 3,
    });
    await failGenerationService({
      generationId: aliceFailed._id,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    bobTranscription = await start({
      userId: bob.user._id,
      capability: AI_CAPABILITY.SPEECH_TO_TEXT,
      held: 5,
    });
    await completeGenerationService({
      generationId: bobTranscription._id,
      creditsCharged: 5,
    });

    bobProcessing = await start({
      userId: bob.user._id,
      capability: AI_CAPABILITY.AGENT_CHAT,
      held: 1,
    });

    oldGeneration = await GenerationModel.create({
      userId: bob.user._id,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      status: 'completed',
      modelId: aliceSpeech.modelId,
      providerModelId: aliceSpeech.providerModelId,
      creditsPerUnit: 1,
      creditsHeld: 2,
      creditsCharged: 2,
    });
    await GenerationModel.collection.updateOne(
      { _id: oldGeneration._id },
      { $set: { createdAt: new Date(Date.now() - 3 * DAY_MS) } },
    );
  });

  after(async () => {
    await testApp.close();
  });

  it('is admin only', async () => {
    const urls = [
      '/api/admin/generations',
      '/api/admin/generations/stats',
      `/api/admin/generations/${aliceSpeech._id}`,
    ];

    for (const url of urls) {
      const response = await send({ url, accessToken: alice.accessToken });

      assert.equal(response.statusCode, 403, url);
    }

    const refundResponse = await send({
      method: 'POST',
      url: `/api/admin/generations/${aliceSpeech._id}/refund`,
      payload: { reason: 'Sneaky' },
      accessToken: alice.accessToken,
    });

    assert.equal(refundResponse.statusCode, 403);
  });

  it('lists all generations with their users', async () => {
    const response = await send({ url: '/api/admin/generations' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.meta.total, 5);

    const [latest] = response.body.data.generations;

    assert.equal(latest.id, String(bobProcessing._id));
    assert.deepEqual(latest.user, {
      id: String(bob.user._id),
      name: 'Bob Brown',
      email: 'bob@voices.test',
    });
    assert.equal(latest.userId, String(bob.user._id));
    assert.equal(
      response.body.data.generations.at(-1).id,
      String(oldGeneration._id),
    );
  });

  it('filters by status, capability and user', async () => {
    const failed = await send({ url: '/api/admin/generations?status=failed' });
    const speech = await send({
      url: `/api/admin/generations?capability=${AI_CAPABILITY.TEXT_TO_SPEECH}`,
    });
    const ofBob = await send({
      url: `/api/admin/generations?userId=${bob.user._id}`,
    });

    assert.deepEqual(
      failed.body.data.generations.map((row) => row.id),
      [String(aliceFailed._id)],
    );
    assert.equal(speech.body.meta.total, 3);
    assert.equal(ofBob.body.meta.total, 3);
    assert.ok(
      ofBob.body.data.generations.every(
        (row) => row.user.email === 'bob@voices.test',
      ),
    );
  });

  it('searches by user email', async () => {
    const response = await send({
      url: '/api/admin/generations?search=ALICE@studio&limit=1',
    });
    const none = await send({ url: '/api/admin/generations?search=a.b(c' });

    assert.equal(response.body.meta.total, 2);
    assert.equal(response.body.meta.totalPages, 2);
    assert.equal(response.body.data.generations.length, 1);
    assert.equal(response.body.data.generations[0].user.name, 'Alice Adams');
    assert.equal(none.statusCode, 200);
    assert.equal(none.body.meta.total, 0);
  });

  it('filters by date range', async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * DAY_MS).toISOString();
    const recent = await send({
      url: `/api/admin/generations?from=${encodeURIComponent(twoDaysAgo)}`,
    });
    const older = await send({
      url: `/api/admin/generations?to=${encodeURIComponent(twoDaysAgo)}`,
    });
    const byDay = new Date(Date.now() - 3 * DAY_MS).toISOString().slice(0, 10);
    const sameDay = await send({
      url: `/api/admin/generations?from=${byDay}&to=${byDay}`,
    });
    const reversed = await send({
      url: `/api/admin/generations?from=${encodeURIComponent(new Date().toISOString())}&to=${encodeURIComponent(twoDaysAgo)}`,
    });
    const invalid = await send({
      url: '/api/admin/generations?from=yesterday',
    });

    assert.equal(recent.body.meta.total, 4);
    assert.deepEqual(
      older.body.data.generations.map((row) => row.id),
      [String(oldGeneration._id)],
    );
    assert.equal(sameDay.body.meta.total, 1);
    assert.equal(reversed.statusCode, 400);
    assert.equal(invalid.statusCode, 400);
  });

  it('shows one generation with its user and model', async () => {
    const response = await send({
      url: `/api/admin/generations/${aliceSpeech._id}`,
    });
    const { generation } = response.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(generation.id, String(aliceSpeech._id));
    assert.equal(generation.userId, String(alice.user._id));
    assert.equal(generation.user.email, 'alice@studio.test');
    assert.equal(generation.user.name, 'Alice Adams');
    assert.equal(generation.user.passwordHash, undefined);
    assert.equal(generation.model.name, 'GPT Realtime Mini');
    assert.equal(generation.model.providerModelId, 'gpt-realtime-2.1-mini');
    assert.equal(generation.modelId, generation.model.id);
    assert.equal(generation.input.text, 'Hello world');
  });

  it('returns 404 for an unknown generation', async () => {
    const response = await send({
      url: `/api/admin/generations/${new mongoose.Types.ObjectId()}`,
    });
    const refundResponse = await refund(new mongoose.Types.ObjectId());

    assert.equal(response.statusCode, 404);
    assert.equal(refundResponse.statusCode, 404);
  });

  it('refunds the charged credits of a completed generation once', async () => {
    assert.equal(await balanceOf(alice.user._id), 46);

    const response = await refund(aliceSpeech._id, '  Bad audio quality  ');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.refundedCredits, 4);
    assert.equal(response.body.data.balance, 50);
    assert.equal(response.body.data.generation.creditsCharged, 0);
    assert.equal(response.body.data.generation.creditsRefunded, 6);
    assert.equal(await balanceOf(alice.user._id), 50);

    const stored = await GenerationModel.findById(aliceSpeech._id);

    assert.equal(stored.creditsCharged, 0);
    assert.equal(stored.creditsRefunded, 6);
    assert.equal(stored.status, 'completed');

    const ledger = await CreditTransactionModel.findOne({
      idempotencyKey: `generation:${aliceSpeech._id}:admin-refund`,
    });

    assert.equal(ledger.type, CREDIT_TRANSACTION_TYPE.USAGE_REFUND);
    assert.equal(ledger.amount, 4);
    assert.equal(ledger.reason, 'Bad audio quality');
    assert.equal(ledger.capability, AI_CAPABILITY.TEXT_TO_SPEECH);
    assert.equal(String(ledger.generationId), String(aliceSpeech._id));
    assert.equal(String(ledger.createdBy), String(admin.user._id));

    const log = await AuditLogModel.findOne({
      action: AUDIT_ACTION.GENERATION_REFUNDED,
      targetId: String(aliceSpeech._id),
    });

    assert.equal(log.actorEmail, 'monitor-admin@example.com');
    assert.deepEqual(log.details.before, {
      creditsCharged: 4,
      creditsRefunded: 2,
    });
    assert.deepEqual(log.details.after, {
      creditsCharged: 0,
      creditsRefunded: 6,
    });
    assert.equal(log.details.amount, 4);

    const again = await refund(aliceSpeech._id);

    assert.equal(again.statusCode, 409);
    assert.equal(again.body.message, 'Already refunded');
    assert.equal(await balanceOf(alice.user._id), 50);
    assert.equal(
      await AuditLogModel.countDocuments({
        action: AUDIT_ACTION.GENERATION_REFUNDED,
      }),
      1,
    );
  });

  it('handles two refunds racing for the same generation', async () => {
    const before = await balanceOf(bob.user._id);
    const results = await Promise.all([
      refund(bobTranscription._id),
      refund(bobTranscription._id),
    ]);
    const codes = results.map((result) => result.statusCode).sort();

    assert.deepEqual(codes, [200, 409]);
    assert.equal(await balanceOf(bob.user._id), before + 5);
  });

  it('refuses generations with nothing charged or still processing', async () => {
    const failed = await refund(aliceFailed._id);
    const running = await refund(bobProcessing._id);

    assert.equal(failed.statusCode, 400);
    assert.equal(running.statusCode, 400);
  });

  it('validates the refund reason', async () => {
    const short = await refund(oldGeneration._id, 'no');
    const blank = await refund(oldGeneration._id, '      ');
    const long = await refund(oldGeneration._id, 'x'.repeat(301));
    const missing = await send({
      method: 'POST',
      url: `/api/admin/generations/${oldGeneration._id}/refund`,
      payload: {},
    });

    assert.equal(short.statusCode, 400);
    assert.equal(blank.statusCode, 400);
    assert.equal(long.statusCode, 400);
    assert.equal(missing.statusCode, 400);
  });

  it('counts generations per status over the last 24 hours', async () => {
    const response = await send({ url: '/api/admin/generations/stats' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.hours, 24);
    assert.deepEqual(response.body.data.counts, {
      all: 4,
      processing: 1,
      completed: 2,
      failed: 1,
    });
  });
});
