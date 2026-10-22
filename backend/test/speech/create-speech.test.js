import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AudioFileModel,
  CreditTransactionModel,
  CreditWalletModel,
  GenerationModel,
  PlatformSettingsModel,
  UserSettingsModel,
} from '#src/database/models.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

const TEXT_250 = `${'Hello world, this is a test sentence. '.repeat(7)}`.slice(
  0,
  250,
);

describe('text to speech', () => {
  let testApp;
  let catalog;

  before(async () => {
    testApp = await buildTestApp();
    catalog = await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  beforeEach(() => {
    testApp.ai.calls.synthesizeSpeech.length = 0;
  });

  async function balanceOf(user) {
    return (await CreditWalletModel.findOne({ userId: user._id })).balance;
  }

  function createSpeech({ accessToken, payload }) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/speech',
      accessToken,
      payload,
    });
  }

  describe('GET /api/speech/options', () => {
    it('requires a logged-in user', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: '/api/speech/options',
      });

      assert.equal(response.statusCode, 401);
    });

    it('lists priced models, enabled voices and limits', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      const response = await testApp.sendRequest({
        method: 'GET',
        url: '/api/speech/options',
        accessToken,
      });

      assert.equal(response.statusCode, 200);

      const options = response.body.data;

      assert.deepEqual(options.models, [
        {
          id: catalog.realtimeModel._id.toString(),
          name: 'GPT Realtime Mini',
          providerModelId: 'gpt-realtime-2.1-mini',
          creditsPerUnit: 1,
          unit: 'per_100_characters',
          isDefault: true,
        },
      ]);
      assert.deepEqual(
        options.voices.map((voice) => voice.code),
        ['marin', 'cedar'],
      );
      assert.equal(options.voices[0].previewStorageKey, undefined);
      assert.deepEqual(options.formats, ['mp3', 'wav', 'opus', 'aac', 'flac']);
      assert.deepEqual(options.styles, [
        'neutral',
        'cheerful',
        'calm',
        'serious',
        'whisper',
      ]);
      assert.equal(options.maxCharacters, 5000);
      assert.deepEqual(options.speeds, { min: 0.5, max: 2 });
    });
  });

  describe('POST /api/speech', () => {
    it('generates speech, stores the file and charges exactly', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser({
        balance: 50,
      });

      const response = await createSpeech({
        accessToken,
        payload: {
          text: `  ${TEXT_250}  `,
          voiceCode: 'marin',
          style: 'whisper',
          speed: 1.5,
          direction: 'Pause after each sentence.',
        },
      });

      assert.equal(response.statusCode, 201);

      const { generation, audioFile, balance } = response.body.data;

      assert.equal(balance, 47);
      assert.equal(await balanceOf(user), 47);
      assert.equal(generation.status, 'completed');
      assert.equal(generation.capability, 'text_to_speech');
      assert.equal(generation.units, 250);
      assert.equal(generation.creditsHeld, 3);
      assert.equal(generation.creditsCharged, 3);
      assert.equal(generation.creditsRefunded, 0);
      assert.equal(generation.input.text, TEXT_250);
      assert.equal(generation.input.voiceCode, 'marin');
      assert.equal(generation.input.format, 'mp3');
      assert.equal(generation.input.style, 'whisper');
      assert.equal(generation.input.speed, 1.5);
      assert.equal(generation.output.audioFileId, audioFile.id);
      assert.equal(
        generation.output.durationSeconds,
        audioFile.durationSeconds,
      );

      const storageKey = `users/${user._id}/generated/${audioFile.id}.mp3`;

      assert.equal(audioFile.kind, 'generated');
      assert.equal(audioFile.title, TEXT_250.slice(0, 60).trim());
      assert.equal(audioFile.voiceCode, 'marin');
      assert.equal(audioFile.format, 'mp3');
      assert.equal(audioFile.generationId, generation.id);
      assert.equal(audioFile.storageKey, undefined);
      assert.ok(audioFile.durationSeconds > 0);
      assert.ok(audioFile.url.includes(storageKey));
      assert.ok(testApp.storage.files.has(storageKey));
      assert.equal(
        testApp.storage.files.get(storageKey).contentType,
        'audio/mpeg',
      );

      const [call] = testApp.ai.calls.synthesizeSpeech;

      assert.equal(call.model, 'gpt-realtime-2.1-mini');
      assert.equal(call.voice, 'marin');
      assert.equal(call.text, TEXT_250);
      assert.match(call.instructions, /Whisper/);
      assert.match(call.instructions, /faster/);
      assert.match(call.instructions, /1\.5/);
      assert.match(call.instructions, /Pause after each sentence\./);

      const transactions = await CreditTransactionModel.find({
        userId: user._id,
        generationId: generation.id,
      });

      assert.deepEqual(
        transactions.map((item) => [item.type, item.amount]),
        [['usage_hold', -3]],
      );
    });

    it('uses the given title and format', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      const response = await createSpeech({
        accessToken,
        payload: {
          text: 'Short line.',
          voiceCode: 'CEDAR',
          format: 'opus',
          title: '  My intro  ',
          modelId: catalog.realtimeModel._id.toString(),
        },
      });

      assert.equal(response.statusCode, 201);

      const { audioFile } = response.body.data;

      assert.equal(audioFile.title, 'My intro');
      assert.equal(audioFile.format, 'opus');
      assert.equal(audioFile.voiceCode, 'cedar');
      assert.ok(
        testApp.storage.files.has(
          `users/${user._id}/generated/${audioFile.id}.ogg`,
        ),
      );
      assert.equal(await balanceOf(user), 49);
    });

    it("falls back to the user's default format", async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      await UserSettingsModel.create({
        userId: user._id,
        defaultFormat: 'wav',
      });

      const response = await createSpeech({
        accessToken,
        payload: { text: 'Default format please.', voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.body.data.audioFile.format, 'wav');
      assert.equal(response.body.data.generation.input.format, 'wav');
    });

    it('refunds every credit when the provider fails', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser({
        balance: 20,
      });
      const filesBefore = testApp.storage.files.size;

      testApp.ai.failNext('rate_limited');

      const response = await createSpeech({
        accessToken,
        payload: { text: TEXT_250, voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 503);
      assert.match(response.body.message, /3 credits were refunded/);
      assert.equal(await balanceOf(user), 20);
      assert.equal(testApp.storage.files.size, filesBefore);
      assert.equal(
        await AudioFileModel.countDocuments({ userId: user._id }),
        0,
      );

      const generation = await GenerationModel.findOne({ userId: user._id });

      assert.equal(generation.status, 'failed');
      assert.equal(generation.errorCategory, 'rate_limited');
      assert.equal(generation.creditsRefunded, 3);

      const transactions = await CreditTransactionModel.find({
        generationId: generation._id,
      }).sort({ createdAt: 1 });

      assert.deepEqual(
        transactions.map((item) => [item.type, item.amount]),
        [
          ['usage_hold', -3],
          ['usage_refund', 3],
        ],
      );
    });

    it('turns a safety rejection into a 400', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      testApp.ai.failNext('safety_rejected');

      const response = await createSpeech({
        accessToken,
        payload: { text: 'Something blocked.', voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 400);
      assert.match(response.body.message, /safety filter/);
      assert.equal(await balanceOf(user), 50);
    });

    it('refunds and fails with unknown when encoding breaks', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const original = testApp.audio.encodePcm;

      testApp.audio.encodePcm = async () => {
        throw new Error('ffmpeg crashed');
      };

      try {
        const response = await createSpeech({
          accessToken,
          payload: { text: 'Encoding will fail.', voiceCode: 'marin' },
        });

        assert.equal(response.statusCode, 500);
        assert.equal(response.body.message, 'Something went wrong');
      } finally {
        testApp.audio.encodePcm = original;
      }

      assert.equal(await balanceOf(user), 50);

      const generation = await GenerationModel.findOne({ userId: user._id });

      assert.equal(generation.status, 'failed');
      assert.equal(generation.errorCategory, 'unknown');
    });

    it('removes the stored file when saving the record fails', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const original = testApp.storage.uploadFile;
      const uploadedKeys = [];

      testApp.storage.uploadFile = async (file) => {
        uploadedKeys.push(file.key);
        await original(file);
      };

      const originalCreate = AudioFileModel.create;

      AudioFileModel.create = async () => {
        throw new Error('database down');
      };

      try {
        const response = await createSpeech({
          accessToken,
          payload: { text: 'Saving will fail.', voiceCode: 'marin' },
        });

        assert.equal(response.statusCode, 500);
      } finally {
        AudioFileModel.create = originalCreate;
        testApp.storage.uploadFile = original;
      }

      assert.equal(uploadedKeys.length, 1);
      assert.equal(testApp.storage.files.has(uploadedKeys[0]), false);
      assert.equal(await balanceOf(user), 50);
    });

    it('returns 402 when the balance is too low', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser({
        balance: 2,
      });

      const response = await createSpeech({
        accessToken,
        payload: { text: TEXT_250, voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 402);
      assert.equal(response.body.code, 'INSUFFICIENT_CREDITS');
      assert.equal(await balanceOf(user), 2);
      assert.equal(
        await GenerationModel.countDocuments({ userId: user._id }),
        0,
      );
      assert.equal(testApp.ai.calls.synthesizeSpeech.length, 0);
    });

    it('rejects a disabled or unknown voice', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      for (const voiceCode of ['alloy', 'nobody']) {
        const response = await createSpeech({
          accessToken,
          payload: { text: 'Hello', voiceCode },
        });

        assert.equal(response.statusCode, 400);
        assert.equal(response.body.message, 'This voice is not available');
      }

      assert.equal(testApp.ai.calls.synthesizeSpeech.length, 0);
    });

    it('rejects a model that cannot speak', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      const response = await createSpeech({
        accessToken,
        payload: {
          text: 'Hello',
          voiceCode: 'marin',
          modelId: catalog.chatModel._id.toString(),
        },
      });

      assert.equal(response.statusCode, 400);
    });

    it('validates the request body', async () => {
      const { accessToken } = await testApp.createLoggedInUser();
      const invalidPayloads = [
        {},
        { voiceCode: 'marin' },
        { text: '', voiceCode: 'marin' },
        { text: '    ', voiceCode: 'marin' },
        { text: 'Hi', voiceCode: 'marin', speed: 3 },
        { text: 'Hi', voiceCode: 'marin', speed: 0.2 },
        { text: 'Hi', voiceCode: 'marin', style: 'angry' },
        { text: 'Hi', voiceCode: 'marin', format: 'm4a' },
        { text: 'Hi', voiceCode: 'marin', direction: 'x'.repeat(301) },
        { text: 'Hi', voiceCode: 'marin', title: 'x'.repeat(151) },
        { text: 'Hi', voiceCode: 'marin', modelId: 'not-an-id' },
      ];

      for (const payload of invalidPayloads) {
        const response = await createSpeech({ accessToken, payload });

        assert.equal(response.statusCode, 400, JSON.stringify(payload));
      }
    });

    it('enforces the platform character limit', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      await getPlatformSettingsService();
      await PlatformSettingsModel.updateOne({}, { ttsMaxCharacters: 100 });

      try {
        const tooLong = await createSpeech({
          accessToken,
          payload: { text: 'a'.repeat(101), voiceCode: 'marin' },
        });

        assert.equal(tooLong.statusCode, 400);
        assert.match(tooLong.body.message, /100 characters/);

        const fits = await createSpeech({
          accessToken,
          payload: { text: `  ${'a'.repeat(100)}  `, voiceCode: 'marin' },
        });

        assert.equal(fits.statusCode, 201);
      } finally {
        await PlatformSettingsModel.updateOne({}, { ttsMaxCharacters: 5000 });
      }
    });

    it('requires a logged-in user', async () => {
      const response = await createSpeech({
        payload: { text: 'Hello', voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 401);
    });
  });
});
