import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AI_CAPABILITIES,
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import { GenerationModel } from '#src/database/models.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function localDate(date, timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function tokyoMidnightToday() {
  const today = localDate(new Date(), 'Asia/Tokyo');

  return new Date(Date.parse(`${today}T00:00:00+09:00`) + 60 * 1000);
}

describe('usage API', () => {
  let testApp;
  let catalog;
  let user;
  let night;
  let empty;

  async function run({ userId, capability, held, charged, units, fail }) {
    const pricedModel = await resolvePricedModelService({ capability });
    const generation = await startGenerationService({
      userId,
      pricedModel,
      units: units ?? 0,
      creditsHeld: held,
      input: {},
    });

    if (fail) {
      await failGenerationService({
        generationId: generation._id,
        errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
      });
    } else if (charged !== undefined) {
      await completeGenerationService({
        generationId: generation._id,
        creditsCharged: charged,
        units,
      });
    }

    return generation;
  }

  async function insertCompleted({ userId, capability, charged, createdAt }) {
    const generation = await GenerationModel.create({
      userId,
      capability,
      status: 'completed',
      modelId: catalog.realtimeModel._id,
      providerModelId: catalog.realtimeModel.providerModelId,
      creditsPerUnit: 1,
      units: charged * 100,
      creditsHeld: charged,
      creditsCharged: charged,
      completedAt: createdAt,
    });

    await GenerationModel.collection.updateOne(
      { _id: generation._id },
      { $set: { createdAt } },
    );
  }

  function getUsage(query, accessToken = user.accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: `/api/usage${query}`,
      accessToken,
    });
  }

  before(async () => {
    testApp = await buildTestApp();
    catalog = await testApp.seedCatalog();
    user = await testApp.createLoggedInUser({ balance: 100 });
    night = await testApp.createLoggedInUser({ balance: 0 });
    empty = await testApp.createLoggedInUser({ balance: 12 });
    const userId = user.user._id;

    await run({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 5,
      charged: 3,
      units: 250,
    });
    await run({
      userId,
      capability: AI_CAPABILITY.SPEECH_TO_TEXT,
      held: 4,
      fail: true,
    });
    await run({
      userId,
      capability: AI_CAPABILITY.REALTIME,
      held: 6,
      charged: 6,
      units: 120,
    });
    await run({
      userId,
      capability: AI_CAPABILITY.VOICE_AGENT,
      held: 3,
      charged: 3,
      units: 60,
    });
    await run({
      userId,
      capability: AI_CAPABILITY.AGENT_CHAT,
      held: 2,
      charged: 2,
      units: 2,
    });
    await run({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 1,
      units: 50,
    });
    await insertCompleted({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      charged: 4,
      createdAt: new Date(Date.now() - 10 * DAY_MS),
    });
    await insertCompleted({
      userId,
      capability: AI_CAPABILITY.SPEECH_TO_TEXT,
      charged: 9,
      createdAt: new Date(Date.now() - 120 * DAY_MS),
    });
    await insertCompleted({
      userId: night.user._id,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      charged: 7,
      createdAt: tokyoMidnightToday(),
    });
  });

  after(async () => {
    await testApp.close();
  });

  it('requires a login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/usage',
    });

    assert.equal(response.statusCode, 401);
  });

  it('sums the last 7 days from completed generations and the ledger', async () => {
    const response = await getUsage('?days=7&timezone=UTC');

    assert.equal(response.statusCode, 200);

    const usage = response.body.data;

    assert.equal(usage.balance, 85);
    assert.equal(usage.timezone, 'UTC');
    assert.equal(usage.days, 7);
    assert.deepEqual(usage.totals, {
      creditsUsed: 14,
      creditsRefunded: 6,
      runs: 4,
      failedRuns: 1,
    });
    assert.deepEqual(usage.counts, {
      speechGenerated: 1,
      transcriptions: 0,
      realtimeMinutes: 3,
      agentMessages: 2,
    });
  });

  it('breaks usage down by capability', async () => {
    const response = await getUsage('?days=7');
    const byCapability = Object.fromEntries(
      response.body.data.byCapability.map((row) => [row.capability, row]),
    );

    assert.equal(
      response.body.data.byCapability.length,
      AI_CAPABILITIES.length,
    );
    assert.deepEqual(byCapability[AI_CAPABILITY.TEXT_TO_SPEECH], {
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      label: 'Text to Speech',
      credits: 3,
      runs: 1,
    });
    assert.equal(byCapability[AI_CAPABILITY.SPEECH_TO_TEXT].credits, 0);
    assert.equal(byCapability[AI_CAPABILITY.REALTIME].credits, 6);
    assert.equal(byCapability[AI_CAPABILITY.VOICE_AGENT].credits, 3);
    assert.equal(byCapability[AI_CAPABILITY.AGENT_CHAT].runs, 1);
  });

  it('widens the window for 30 and 90 days', async () => {
    const thirty = await getUsage('?days=30');
    const ninety = await getUsage('?days=90');

    assert.equal(thirty.body.data.totals.creditsUsed, 18);
    assert.equal(thirty.body.data.totals.runs, 5);
    assert.equal(thirty.body.data.counts.speechGenerated, 2);
    assert.equal(thirty.body.data.daily.length, 30);
    assert.equal(ninety.body.data.totals.creditsUsed, 18);
    assert.equal(ninety.body.data.daily.length, 90);
  });

  it('defaults to 30 days and rejects other ranges', async () => {
    const fallback = await getUsage('');
    const invalid = await getUsage('?days=14');

    assert.equal(fallback.body.data.days, 30);
    assert.equal(fallback.body.data.daily.length, 30);
    assert.equal(invalid.statusCode, 400);
  });

  it('lists every day in the range including empty ones', async () => {
    const response = await getUsage('?days=7&timezone=UTC');
    const { daily } = response.body.data;
    const today = new Date().toISOString().slice(0, 10);

    assert.equal(daily.length, 7);
    assert.equal(daily.at(-1).date, today);
    assert.equal(
      daily[0].date,
      new Date(Date.parse(`${today}T00:00:00Z`) - 6 * DAY_MS)
        .toISOString()
        .slice(0, 10),
    );

    for (let index = 1; index < daily.length; index += 1) {
      assert.equal(
        Date.parse(`${daily[index].date}T00:00:00Z`) -
          Date.parse(`${daily[index - 1].date}T00:00:00Z`),
        DAY_MS,
      );
    }

    assert.equal(
      daily.reduce((sum, day) => sum + day.credits, 0),
      response.body.data.totals.creditsUsed,
    );
    assert.ok(daily.some((day) => day.credits === 0));
  });

  it('buckets days in the viewer timezone', async () => {
    const createdAt = tokyoMidnightToday();

    for (const timezone of ['Asia/Tokyo', 'UTC', 'America/Los_Angeles']) {
      const response = await getUsage(
        `?days=7&timezone=${encodeURIComponent(timezone)}`,
        night.accessToken,
      );
      const { daily } = response.body.data;
      const expectedDay = localDate(createdAt, timezone);

      assert.equal(response.body.data.timezone, timezone);
      assert.equal(daily.at(-1).date, localDate(new Date(), timezone));
      assert.equal(
        daily.find((day) => day.date === expectedDay)?.credits,
        7,
        timezone,
      );
      assert.equal(daily.filter((day) => day.credits > 0).length, 1, timezone);
    }

    assert.notEqual(
      localDate(createdAt, 'Asia/Tokyo'),
      localDate(createdAt, 'UTC'),
    );
  });

  it('falls back to UTC for an unknown timezone', async () => {
    const response = await getUsage('?days=7&timezone=Mars%2FPhobos');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.timezone, 'UTC');
    assert.equal(response.body.data.totals.creditsUsed, 14);
  });

  it('only counts the caller own usage', async () => {
    const response = await getUsage('?days=90', empty.accessToken);
    const usage = response.body.data;

    assert.equal(usage.balance, 12);
    assert.deepEqual(usage.totals, {
      creditsUsed: 0,
      creditsRefunded: 0,
      runs: 0,
      failedRuns: 0,
    });
    assert.ok(usage.daily.every((day) => day.credits === 0));
    assert.ok(usage.byCapability.every((row) => row.credits === 0));
  });
});
