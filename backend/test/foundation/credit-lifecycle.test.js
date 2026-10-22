import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import { CreditWalletModel, UserModel } from '#src/database/models.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';
import { runInTransactionUtil } from '#src/utils/index.js';

describe('foundation', () => {
  let testApp;
  let userId;

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();

    const user = await UserModel.create({
      name: 'Wallet User',
      email: 'wallet@example.com',
      passwordHash: 'not-used',
    });

    userId = user._id;
    await CreditWalletModel.create({ userId, balance: 0 });
    await runInTransactionUtil({
      work: ({ session }) =>
        applyCreditChangeService({
          session,
          userId,
          amount: 50,
          type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
          idempotencyKey: `signup:${userId}`,
        }),
    });
  });

  after(async () => {
    await testApp.close();
  });

  async function balance() {
    return (await CreditWalletModel.findOne({ userId })).balance;
  }

  it('answers the health check', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/health',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.status, 'ok');
  });

  it('rejects admin routes without a token', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/test-admin/ping',
    });

    assert.equal(response.statusCode, 401);
  });

  it('does not grant the same idempotency key twice', async () => {
    const result = await runInTransactionUtil({
      work: ({ session }) =>
        applyCreditChangeService({
          session,
          userId,
          amount: 50,
          type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
          idempotencyKey: `signup:${userId}`,
        }),
    });

    assert.equal(result.isDuplicate, true);
    assert.equal(await balance(), 50);
  });

  it('holds, settles and refunds credits', async () => {
    const pricedModel = await resolvePricedModelService({
      capability: AI_CAPABILITY.SPEECH_TO_TEXT,
    });

    const generation = await startGenerationService({
      userId,
      pricedModel,
      units: 600,
      creditsHeld: 10,
      input: { language: 'en' },
    });

    assert.equal(await balance(), 40);

    await completeGenerationService({
      generationId: generation._id,
      creditsCharged: 4,
      units: 240,
      output: { transcriptText: 'done' },
    });

    assert.equal(await balance(), 46);

    const failing = await startGenerationService({
      userId,
      pricedModel,
      units: 60,
      creditsHeld: 6,
      input: {},
    });

    assert.equal(await balance(), 40);

    const { refundedCredits } = await failGenerationService({
      generationId: failing._id,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    assert.equal(refundedCredits, 6);
    assert.equal(await balance(), 46);

    const again = await failGenerationService({
      generationId: failing._id,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    assert.equal(again.refundedCredits, 0);
    assert.equal(await balance(), 46);
  });

  it('refuses a hold larger than the balance', async () => {
    const pricedModel = await resolvePricedModelService({
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
    });

    await assert.rejects(
      startGenerationService({
        userId,
        pricedModel,
        units: 100000,
        creditsHeld: 1000,
        input: {},
      }),
      (error) => error.code === 'INSUFFICIENT_CREDITS',
    );

    assert.equal(await balance(), 46);
  });
});
