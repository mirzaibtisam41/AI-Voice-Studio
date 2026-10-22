import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import { CreditWalletModel, VoiceModel } from '#src/database/models.js';

describe('voice previews', () => {
  let testApp;
  let voices;

  before(async () => {
    testApp = await buildTestApp();
    ({ voices } = await testApp.seedCatalog());
  });

  after(async () => {
    await testApp.close();
  });

  function voiceByCode(code) {
    return voices.find((voice) => voice.code === code);
  }

  function getPreview({ accessToken, voiceId }) {
    return testApp.sendRequest({
      method: 'GET',
      url: `/api/speech/voices/${voiceId}/preview`,
      accessToken,
    });
  }

  it('requires a logged-in user', async () => {
    const response = await getPreview({ voiceId: voiceByCode('marin').id });

    assert.equal(response.statusCode, 401);
  });

  it('does not keep a preview when the provider fails', async () => {
    const { accessToken } = await testApp.createLoggedInUser();
    const cedar = voiceByCode('cedar');

    testApp.ai.failNext('provider_unavailable');

    const response = await getPreview({ accessToken, voiceId: cedar.id });

    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(response.body.message, /refunded/);
    assert.equal(
      (await VoiceModel.findById(cedar._id)).previewStorageKey,
      null,
    );
    assert.equal(testApp.storage.files.has('voices/previews/cedar.mp3'), false);
  });

  it('creates the preview once at no cost to the user, then reuses it', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser({
      balance: 5,
    });
    const marin = voiceByCode('marin');
    const callsBefore = testApp.ai.calls.synthesizeSpeech.length;

    const first = await getPreview({ accessToken, voiceId: marin.id });

    assert.equal(first.statusCode, 200);
    assert.match(first.body.data.url, /voices\/previews\/marin\.mp3/);
    assert.equal(testApp.ai.calls.synthesizeSpeech.length, callsBefore + 1);

    const call = testApp.ai.calls.synthesizeSpeech.at(-1);

    assert.equal(call.model, 'gpt-realtime-2.1-mini');
    assert.equal(call.voice, 'marin');
    assert.ok(call.text.length > 10);

    const stored = testApp.storage.files.get('voices/previews/marin.mp3');

    assert.equal(stored.contentType, 'audio/mpeg');
    assert.equal(
      (await VoiceModel.findById(marin._id)).previewStorageKey,
      'voices/previews/marin.mp3',
    );

    const second = await getPreview({ accessToken, voiceId: marin.id });

    assert.equal(second.statusCode, 200);
    assert.equal(second.body.data.url, first.body.data.url);
    assert.equal(testApp.ai.calls.synthesizeSpeech.length, callsBefore + 1);
    assert.equal(
      (await CreditWalletModel.findOne({ userId: user._id })).balance,
      5,
    );
  });

  it('hides disabled and unknown voices', async () => {
    const { accessToken } = await testApp.createLoggedInUser();

    const disabled = await getPreview({
      accessToken,
      voiceId: voiceByCode('alloy').id,
    });
    const unknown = await getPreview({
      accessToken,
      voiceId: new mongoose.Types.ObjectId().toString(),
    });
    const invalid = await getPreview({ accessToken, voiceId: 'nope' });

    assert.equal(disabled.statusCode, 404);
    assert.equal(unknown.statusCode, 404);
    assert.equal(invalid.statusCode, 400);
  });
});
