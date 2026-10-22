import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import { CreditTransactionModel } from '#src/database/models.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { applyCreditChangeService } from '#src/modules/credit-wallets/shared/services/index.js';
import { CREDIT_TRANSACTION_TYPE } from '#src/modules/credit-transactions/credit-transaction.constants.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';
import { runInTransactionUtil } from '#src/utils/index.js';

describe('my wallet', () => {
  let testApp;
  let owner;
  let other;

  async function grant({ userId, amount, type, reason }) {
    await runInTransactionUtil({
      work: ({ session }) =>
        applyCreditChangeService({ session, userId, amount, type, reason }),
    });
  }

  async function runSpeech({ userId, held, charged, fail = false }) {
    const pricedModel = await resolvePricedModelService({
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
    });
    const generation = await startGenerationService({
      userId,
      pricedModel,
      units: held * 100,
      creditsHeld: held,
      input: { text: 'Hello there' },
      reason: 'Text to speech',
    });

    if (fail) {
      await failGenerationService({
        generationId: generation._id,
        errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
      });
    } else {
      await completeGenerationService({
        generationId: generation._id,
        creditsCharged: charged,
      });
    }

    return generation;
  }

  function send(url, accessToken = owner.accessToken) {
    return testApp.sendRequest({ method: 'GET', url, accessToken });
  }

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
    owner = await testApp.createLoggedInUser({ balance: 0 });
    other = await testApp.createLoggedInUser({ balance: 0 });

    await grant({
      userId: owner.user._id,
      amount: 50,
      type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
      reason: 'Signup bonus',
    });
    await grant({
      userId: owner.user._id,
      amount: 25,
      type: CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT,
      reason: '=HYPERLINK("x"), "quoted"',
    });
    await grant({
      userId: owner.user._id,
      amount: -5,
      type: CREDIT_TRANSACTION_TYPE.ADMIN_DEBIT,
      reason: 'Correction',
    });
    await runSpeech({ userId: owner.user._id, held: 4, charged: 3 });
    await runSpeech({ userId: owner.user._id, held: 2, fail: true });
    await runSpeech({ userId: owner.user._id, held: 3, charged: 3 });
    await runSpeech({ userId: owner.user._id, held: 1, charged: 1 });
    await runSpeech({ userId: owner.user._id, held: 1, charged: 1 });
    await runSpeech({ userId: owner.user._id, held: 1, charged: 1 });
    await runSpeech({ userId: owner.user._id, held: 1, charged: 1 });

    await grant({
      userId: other.user._id,
      amount: 7,
      type: CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
      reason: 'Other signup',
    });
  });

  after(async () => {
    await testApp.close();
  });

  it('requires a login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/wallet',
    });

    assert.equal(response.statusCode, 401);
  });

  it('returns the balance and the last 10 transactions', async () => {
    const response = await send('/api/wallet');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.balance, 60);

    const { transactions } = response.body.data;

    assert.equal(transactions.length, 10);
    assert.equal(transactions[0].balanceAfter, 60);
    assert.equal(transactions[0].type, CREDIT_TRANSACTION_TYPE.USAGE_HOLD);
    assert.equal(transactions[0].capability, AI_CAPABILITY.TEXT_TO_SPEECH);
    assert.ok(transactions[0].generationId);
    assert.ok(transactions[0].id);
    assert.ok(transactions[0].createdAt);
    assert.equal(transactions[0]._id, undefined);
    assert.equal(transactions[0].idempotencyKey, undefined);
    assert.equal(transactions[0].userId, undefined);
    assert.equal(transactions[0].walletId, undefined);
  });

  it('keeps the ledger consistent with the balance', async () => {
    const all = await CreditTransactionModel.find({
      userId: owner.user._id,
    });
    const sum = all.reduce((total, row) => total + row.amount, 0);

    assert.equal(sum, 60);
    assert.equal(
      await testApp.getBalance({ accessToken: owner.accessToken }),
      60,
    );
  });

  it('pages through all transactions', async () => {
    const first = await send('/api/wallet/transactions?page=1&limit=5');
    const third = await send('/api/wallet/transactions?page=3&limit=5');

    assert.equal(first.statusCode, 200);
    assert.equal(first.body.data.transactions.length, 5);
    assert.deepEqual(first.body.meta, {
      page: 1,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
    assert.equal(third.body.data.transactions.length, 2);
    assert.equal(
      third.body.data.transactions.at(-1).type,
      CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
    );
  });

  it('filters by transaction group', async () => {
    const usage = await send('/api/wallet/transactions?type=usage');
    const refunds = await send('/api/wallet/transactions?type=refunds');
    const credits = await send('/api/wallet/transactions?type=credits');
    const debits = await send('/api/wallet/transactions?type=debits');

    assert.equal(usage.body.meta.total, 7);
    assert.ok(usage.body.data.transactions.every((row) => row.amount < 0));
    assert.equal(refunds.body.meta.total, 2);
    assert.deepEqual(
      refunds.body.data.transactions.map((row) => row.amount).sort(),
      [1, 2],
    );
    assert.deepEqual(
      credits.body.data.transactions.map((row) => row.type).sort(),
      [
        CREDIT_TRANSACTION_TYPE.ADMIN_CREDIT,
        CREDIT_TRANSACTION_TYPE.SIGNUP_GRANT,
      ],
    );
    assert.equal(debits.body.meta.total, 1);
    assert.equal(debits.body.data.transactions[0].amount, -5);
  });

  it('filters by capability', async () => {
    const speech = await send(
      `/api/wallet/transactions?capability=${AI_CAPABILITY.TEXT_TO_SPEECH}`,
    );
    const transcription = await send(
      `/api/wallet/transactions?capability=${AI_CAPABILITY.SPEECH_TO_TEXT}`,
    );

    assert.equal(speech.body.meta.total, 9);
    assert.equal(transcription.body.meta.total, 0);
  });

  it('rejects unknown filters', async () => {
    const badType = await send('/api/wallet/transactions?type=bonus');
    const badCapability = await send(
      '/api/wallet/transactions?capability=video',
    );
    const badLimit = await send('/api/wallet/transactions?limit=500');

    assert.equal(badType.statusCode, 400);
    assert.equal(badCapability.statusCode, 400);
    assert.equal(badLimit.statusCode, 400);
  });

  it('only shows the caller their own transactions', async () => {
    const response = await send('/api/wallet', other.accessToken);
    const list = await send('/api/wallet/transactions', other.accessToken);

    assert.equal(response.body.data.balance, 7);
    assert.equal(response.body.data.transactions.length, 1);
    assert.equal(list.body.meta.total, 1);
  });

  it('exports the transactions as CSV', async () => {
    const response = await send('/api/wallet/transactions/export');

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /^text\/csv/);
    assert.equal(
      response.headers['content-disposition'],
      'attachment; filename="ai-voice-studio-transactions.csv"',
    );

    const lines = response.body.split('\r\n');

    assert.equal(
      lines[0],
      'Date,Type,Feature,Description,Credits,Balance after',
    );
    assert.equal(lines.length, 13);
    assert.match(
      lines[1],
      /^\d{4}-\d{2}-\d{2}T.*,Usage,Text to Speech,Text to speech,-1,60$/,
    );
    assert.ok(
      lines.some((line) =>
        line.endsWith(`,Admin credit,,"'=HYPERLINK(""x""), ""quoted""",25,75`),
      ),
    );
    assert.ok(lines.at(-1).includes(',Signup bonus,,Signup bonus,50,50'));
  });

  it('applies the filters to the export', async () => {
    const response = await send('/api/wallet/transactions/export?type=debits');
    const lines = response.body.split('\r\n');

    assert.equal(lines.length, 2);
    assert.ok(lines[1].endsWith(',Admin debit,,Correction,-5,70'));
  });

  it('exports only a header for an empty wallet', async () => {
    const fresh = await testApp.createLoggedInUser({ balance: 0 });
    const response = await send(
      '/api/wallet/transactions/export',
      fresh.accessToken,
    );

    assert.equal(
      response.body,
      'Date,Type,Feature,Description,Credits,Balance after',
    );
  });
});
