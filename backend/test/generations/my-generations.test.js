import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AI_CAPABILITY,
  PROVIDER_ERROR_CATEGORY,
} from '#src/constants/index.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import {
  completeGenerationService,
  failGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';

describe('my generations', () => {
  let testApp;
  let owner;
  let other;
  let speech;
  let transcription;
  let chat;
  let failed;
  let processing;
  let foreign;

  async function start({ userId, capability, held, input }) {
    const pricedModel = await resolvePricedModelService({ capability });

    return startGenerationService({
      userId,
      pricedModel,
      units: 0,
      creditsHeld: held,
      input,
    });
  }

  function send(url, accessToken = owner.accessToken) {
    return testApp.sendRequest({ method: 'GET', url, accessToken });
  }

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
    owner = await testApp.createLoggedInUser({ balance: 100 });
    other = await testApp.createLoggedInUser({ balance: 100 });
    const userId = owner.user._id;
    const audioFileId = new mongoose.Types.ObjectId();
    const agentId = new mongoose.Types.ObjectId();

    speech = await start({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 3,
      input: {
        text: 'a'.repeat(300),
        characterCount: 300,
        voiceCode: 'marin',
        format: 'mp3',
        instructions: 'Speak calmly',
      },
    });
    await completeGenerationService({
      generationId: speech._id,
      creditsCharged: 3,
      units: 300,
      output: { audioFileId, durationSeconds: 12.5 },
    });

    transcription = await start({
      userId,
      capability: AI_CAPABILITY.SPEECH_TO_TEXT,
      held: 5,
      input: { language: 'en' },
    });
    await completeGenerationService({
      generationId: transcription._id,
      creditsCharged: 2,
      units: 90,
      output: {
        transcriptText: 'b'.repeat(500),
        languages: ['en'],
      },
    });

    chat = await start({
      userId,
      capability: AI_CAPABILITY.AGENT_CHAT,
      held: 1,
      input: { agentId, message: 'Hello agent' },
    });
    await completeGenerationService({
      generationId: chat._id,
      units: 1,
      output: { reply: 'Hi! How can I help?' },
    });

    failed = await start({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 2,
      input: { text: 'Will fail', voiceCode: 'cedar', format: 'wav' },
    });
    await failGenerationService({
      generationId: failed._id,
      errorCategory: PROVIDER_ERROR_CATEGORY.TIMEOUT,
    });

    processing = await start({
      userId,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 1,
      input: { text: 'Still going' },
    });

    foreign = await start({
      userId: other.user._id,
      capability: AI_CAPABILITY.TEXT_TO_SPEECH,
      held: 1,
      input: { text: 'Not yours' },
    });
  });

  after(async () => {
    await testApp.close();
  });

  it('requires a login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/generations',
    });

    assert.equal(response.statusCode, 401);
  });

  it('lists the caller own generations newest first with counts', async () => {
    const response = await send('/api/generations');

    assert.equal(response.statusCode, 200);

    const { generations, counts } = response.body.data;

    assert.deepEqual(
      generations.map((generation) => generation.id),
      [processing, failed, chat, transcription, speech].map((generation) =>
        String(generation._id),
      ),
    );
    assert.deepEqual(counts, {
      all: 5,
      processing: 1,
      completed: 3,
      failed: 1,
    });
    assert.deepEqual(response.body.meta, {
      page: 1,
      limit: 20,
      total: 5,
      totalPages: 1,
    });
    assert.ok(
      generations.every((generation) => generation.id !== String(foreign._id)),
    );
  });

  it('summarises input and output', async () => {
    const response = await send('/api/generations');
    const byId = Object.fromEntries(
      response.body.data.generations.map((generation) => [
        generation.id,
        generation,
      ]),
    );
    const speechItem = byId[String(speech._id)];
    const transcriptionItem = byId[String(transcription._id)];
    const chatItem = byId[String(chat._id)];
    const failedItem = byId[String(failed._id)];

    assert.equal(speechItem.capability, AI_CAPABILITY.TEXT_TO_SPEECH);
    assert.equal(speechItem.status, 'completed');
    assert.equal(speechItem.providerModelId, 'gpt-realtime-2.1-mini');
    assert.equal(speechItem.creditsHeld, 3);
    assert.equal(speechItem.creditsCharged, 3);
    assert.equal(speechItem.creditsRefunded, 0);
    assert.equal(speechItem.units, 300);
    assert.equal(speechItem.input.text, `${'a'.repeat(120)}…`);
    assert.equal(speechItem.input.voiceCode, 'marin');
    assert.equal(speechItem.input.format, 'mp3');
    assert.equal(speechItem.input.instructions, undefined);
    assert.equal(speechItem.output.durationSeconds, 12.5);
    assert.match(speechItem.output.audioFileId, /^[a-f0-9]{24}$/);
    assert.ok(speechItem.completedAt);
    assert.ok(speechItem.createdAt);

    assert.equal(transcriptionItem.creditsRefunded, 3);
    assert.equal(transcriptionItem.input.language, 'en');
    assert.equal(
      transcriptionItem.output.transcriptPreview,
      `${'b'.repeat(200)}…`,
    );

    assert.equal(chatItem.input.text, 'Hello agent');
    assert.match(chatItem.input.agentId, /^[a-f0-9]{24}$/);
    assert.equal(chatItem.output.replyPreview, 'Hi! How can I help?');

    assert.equal(failedItem.status, 'failed');
    assert.equal(failedItem.errorCategory, PROVIDER_ERROR_CATEGORY.TIMEOUT);
    assert.equal(failedItem.creditsRefunded, 2);
    assert.equal(failedItem.completedAt, null);
  });

  it('filters by status and capability while counts ignore the status', async () => {
    const completed = await send('/api/generations?status=completed');
    const speechOnly = await send(
      `/api/generations?capability=${AI_CAPABILITY.TEXT_TO_SPEECH}`,
    );
    const failedSpeech = await send(
      `/api/generations?capability=${AI_CAPABILITY.TEXT_TO_SPEECH}&status=failed`,
    );

    assert.equal(completed.body.meta.total, 3);
    assert.equal(completed.body.data.counts.all, 5);
    assert.equal(speechOnly.body.meta.total, 3);
    assert.deepEqual(speechOnly.body.data.counts, {
      all: 3,
      processing: 1,
      completed: 1,
      failed: 1,
    });
    assert.equal(failedSpeech.body.data.generations.length, 1);
    assert.equal(failedSpeech.body.data.generations[0].id, String(failed._id));
  });

  it('paginates', async () => {
    const response = await send('/api/generations?page=2&limit=2');

    assert.equal(response.body.data.generations.length, 2);
    assert.equal(response.body.data.generations[0].id, String(chat._id));
    assert.equal(response.body.meta.totalPages, 3);
  });

  it('validates the query', async () => {
    const badStatus = await send('/api/generations?status=queued');
    const badCapability = await send('/api/generations?capability=video');

    assert.equal(badStatus.statusCode, 400);
    assert.equal(badCapability.statusCode, 400);
  });

  it('returns the full document for an own generation', async () => {
    const response = await send(`/api/generations/${speech._id}`);
    const { generation } = response.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(generation.id, String(speech._id));
    assert.equal(generation.input.text, 'a'.repeat(300));
    assert.equal(generation.input.instructions, 'Speak calmly');
    assert.equal(generation.creditsPerUnit, 1);
    assert.equal(generation._id, undefined);
  });

  it('returns 404 for another user generation or an unknown id', async () => {
    const foreignResponse = await send(`/api/generations/${foreign._id}`);
    const unknown = await send(
      `/api/generations/${new mongoose.Types.ObjectId()}`,
    );
    const invalid = await send('/api/generations/not-an-id');

    assert.equal(foreignResponse.statusCode, 404);
    assert.equal(unknown.statusCode, 404);
    assert.equal(invalid.statusCode, 400);
  });

  it('shows an empty list to a new user', async () => {
    const fresh = await testApp.createLoggedInUser();
    const response = await send('/api/generations', fresh.accessToken);

    assert.deepEqual(response.body.data.generations, []);
    assert.deepEqual(response.body.data.counts, {
      all: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    });
    assert.equal(response.body.meta.total, 0);
  });
});
