import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AiModelModel,
  AiProviderModel,
  PlatformSettingsModel,
  VoiceModel,
} from '#src/database/models.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { seedDatabase } from '../../scripts/seed.js';

describe('seed script', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function capability(model, code) {
    return model.capabilities.find((item) => item.code === code);
  }

  it('creates settings, the OpenAI provider, models and voices', async () => {
    const summary = await seedDatabase();

    assert.deepEqual(summary, {
      provider: 'created',
      models: { created: 5, updated: 0, kept: 0 },
      voices: { created: 10, kept: 0 },
    });
    assert.equal(await PlatformSettingsModel.countDocuments(), 1);
    assert.equal(await AiProviderModel.countDocuments({ code: 'openai' }), 1);

    const mini = await AiModelModel.findOne({ slug: 'gpt-realtime-mini' });

    assert.equal(mini.providerModelId, 'gpt-realtime-2.1-mini');
    assert.equal(mini.status, 'active');
    assert.equal(capability(mini, 'text_to_speech').creditsPerUnit, 1);
    assert.equal(capability(mini, 'text_to_speech').isDefault, true);
    assert.equal(capability(mini, 'realtime').creditsPerUnit, 3);
    assert.equal(capability(mini, 'voice_agent').isDefault, true);

    const deprecated = await AiModelModel.findOne({ slug: 'gpt-4o-mini-tts' });

    assert.equal(deprecated.status, 'deprecated');
    assert.equal(deprecated.description, 'Shuts down on Jan 6, 2027');
    assert.equal(capability(deprecated, 'text_to_speech').isDefault, false);

    const full = await AiModelModel.findOne({
      providerModelId: 'gpt-realtime-2.1',
    });

    assert.equal(full.status, 'disabled');
    assert.equal(capability(full, 'realtime').creditsPerUnit, 10);

    const voices = await VoiceModel.find().sort({ sortOrder: 1 });

    assert.deepEqual(
      voices.map((voice) => voice.code),
      [
        'marin',
        'cedar',
        'coral',
        'ash',
        'shimmer',
        'sage',
        'ballad',
        'verse',
        'alloy',
        'echo',
      ],
    );
    assert.ok(voices.every((voice) => voice.enabled));
    assert.equal(voices[2].accent, 'British');
    assert.equal(voices[8].gender, 'neutral');
    assert.deepEqual(voices[0].tags, ['Warm', 'Narration']);

    for (const code of [
      'text_to_speech',
      'speech_to_text',
      'realtime',
      'voice_agent',
      'agent_chat',
    ]) {
      const priced = await listPricedModelsService({ capability: code });

      assert.equal(priced.filter((item) => item.isDefault).length, 1, code);
    }
  });

  it('does not overwrite admin changes when run again', async () => {
    await AiModelModel.updateOne(
      { slug: 'gpt-transcribe' },
      { $set: { 'capabilities.0.creditsPerUnit': 7, name: 'Edited' } },
    );
    await VoiceModel.updateOne(
      { code: 'echo' },
      { enabled: false, name: 'Echo 2' },
    );
    await AiModelModel.updateOne(
      { slug: 'gpt-5-nano' },
      { $set: { capabilities: [] } },
    );

    const summary = await seedDatabase();

    assert.deepEqual(summary, {
      provider: 'kept',
      models: { created: 0, updated: 1, kept: 4 },
      voices: { created: 0, kept: 10 },
    });

    const transcribe = await AiModelModel.findOne({ slug: 'gpt-transcribe' });
    const echo = await VoiceModel.findOne({ code: 'echo' });
    const nano = await AiModelModel.findOne({ slug: 'gpt-5-nano' });

    assert.equal(transcribe.name, 'Edited');
    assert.equal(capability(transcribe, 'speech_to_text').creditsPerUnit, 7);
    assert.equal(echo.enabled, false);
    assert.equal(echo.name, 'Echo 2');
    assert.equal(capability(nano, 'agent_chat').creditsPerUnit, 1);
    assert.equal(await AiModelModel.countDocuments(), 5);
    assert.equal(await VoiceModel.countDocuments(), 10);
  });
});
