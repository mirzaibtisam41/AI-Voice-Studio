import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AudioFileModel,
  CreditWalletModel,
  GenerationModel,
} from '#src/database/models.js';

describe('transcriptions', () => {
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
    testApp.ai.calls.transcribeAudio.length = 0;
  });

  async function balanceOf(user) {
    return (await CreditWalletModel.findOne({ userId: user._id })).balance;
  }

  async function createAudioFile({
    user,
    durationSeconds = 90,
    format = 'mp3',
    contentType = 'audio/mpeg',
    sizeBytes = 2048,
    title = 'Team call',
  }) {
    const id = new mongoose.Types.ObjectId();
    const storageKey = `users/${user._id}/uploads/${id}.${format}`;

    await testApp.storage.uploadFile({
      key: storageKey,
      body: Buffer.from(`audio-${id}`),
      contentType,
    });

    return AudioFileModel.create({
      _id: id,
      userId: user._id,
      kind: 'uploaded',
      title,
      storageKey,
      contentType,
      format,
      sizeBytes,
      durationSeconds,
    });
  }

  function transcribe({ accessToken, payload }) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/transcriptions',
      accessToken,
      payload,
    });
  }

  it('returns the options for the speech to text page', async () => {
    const { accessToken } = await testApp.createLoggedInUser();

    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/transcriptions/options',
      accessToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.models.length, 1);
    assert.equal(
      response.body.data.models[0].providerModelId,
      'gpt-transcribe',
    );
    assert.equal(response.body.data.models[0].creditsPerMinute, 1);
    assert.equal(response.body.data.maxMegabytes, 25);
    assert.equal(response.body.data.languages[0].code, 'auto');
    assert.ok(response.body.data.languages.length >= 20);
    assert.deepEqual(response.body.data.exportFormats, ['txt', 'srt', 'vtt']);
  });

  it('requires a login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/transcriptions',
    });

    assert.equal(response.statusCode, 401);
  });

  it('transcribes an audio file and charges per started minute', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({ user, durationSeconds: 90 });

    const response = await transcribe({
      accessToken,
      payload: {
        audioFileId: audioFile.id,
        languages: ['en', 'ur'],
        keywords: [' Fraunces ', 'LUFS', 'LUFS'],
      },
    });

    assert.equal(response.statusCode, 201);

    const { transcription, balance } = response.body.data;

    assert.equal(balance, 48);
    assert.equal(await balanceOf(user), 48);
    assert.equal(transcription.status, 'completed');
    assert.equal(transcription.audioFileId, audioFile.id);
    assert.equal(transcription.audioTitle, 'Team call');
    assert.equal(transcription.text, 'Hello from the fake transcriber.');
    assert.equal(transcription.originalText, transcription.text);
    assert.deepEqual(transcription.languages, ['en']);
    assert.deepEqual(transcription.requestedLanguages, ['en', 'ur']);
    assert.deepEqual(transcription.keywords, ['Fraunces', 'LUFS']);
    assert.equal(transcription.durationSeconds, 90);
    assert.equal(transcription.creditsCharged, 2);

    const [call] = testApp.ai.calls.transcribeAudio;

    assert.equal(call.model, 'gpt-transcribe');
    assert.equal(call.fileName, `${audioFile.id}.mp3`);
    assert.equal(call.contentType, 'audio/mpeg');
    assert.equal(call.audio.toString(), `audio-${audioFile.id}`);
    assert.deepEqual(call.languages, ['en', 'ur']);
    assert.deepEqual(call.keywords, ['Fraunces', 'LUFS']);

    const generation = await GenerationModel.findById(transcription.id);

    assert.equal(generation.capability, 'speech_to_text');
    assert.equal(generation.units, 90);
    assert.equal(generation.creditsHeld, 2);
    assert.equal(generation.creditsRefunded, 0);

    const savedFile = await AudioFileModel.findById(audioFile._id);

    assert.equal(savedFile.hasTranscript, true);
  });

  it('charges one minute for a very short clip and leaves out empty hints', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({
      user,
      durationSeconds: 2.4,
      format: 'opus',
      contentType: 'audio/ogg',
    });

    const response = await transcribe({
      accessToken,
      payload: { audioFileId: audioFile.id },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.transcription.creditsCharged, 1);
    assert.equal(await balanceOf(user), 49);

    const [call] = testApp.ai.calls.transcribeAudio;

    assert.equal(call.fileName, `${audioFile.id}.ogg`);
    assert.equal(call.languages, undefined);
    assert.equal(call.keywords, undefined);
  });

  it('validates languages and keywords', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({ user });

    const bodies = [
      { audioFileId: audioFile.id, languages: ['en', 'fr', 'de', 'es'] },
      { audioFileId: audioFile.id, languages: ['xx'] },
      { audioFileId: audioFile.id, languages: ['en', 'en'] },
      { audioFileId: audioFile.id, keywords: ['<b>'] },
      { audioFileId: audioFile.id, keywords: ['two\nlines'] },
      { audioFileId: audioFile.id, keywords: ['   '] },
      { audioFileId: audioFile.id, keywords: ['a'.repeat(41)] },
      {
        audioFileId: audioFile.id,
        keywords: Array.from({ length: 21 }, (_v, i) => `word${i}`),
      },
      { audioFileId: 'not-an-id' },
    ];

    for (const payload of bodies) {
      const response = await transcribe({ accessToken, payload });

      assert.equal(response.statusCode, 400, JSON.stringify(payload));
    }

    assert.equal(testApp.ai.calls.transcribeAudio.length, 0);
    assert.equal(await balanceOf(user), 50);
  });

  it('only transcribes your own audio files', async () => {
    const owner = await testApp.createLoggedInUser();
    const other = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({ user: owner.user });

    const response = await transcribe({
      accessToken: other.accessToken,
      payload: { audioFileId: audioFile.id },
    });

    assert.equal(response.statusCode, 404);
    assert.equal(await balanceOf(other.user), 50);
  });

  it('refuses files without a duration or in an unsupported format', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const noDuration = await createAudioFile({ user, durationSeconds: null });
    const aac = await createAudioFile({
      user,
      format: 'aac',
      contentType: 'audio/aac',
    });
    const huge = await createAudioFile({
      user,
      sizeBytes: 26 * 1024 * 1024,
    });

    const noDurationResponse = await transcribe({
      accessToken,
      payload: { audioFileId: noDuration.id },
    });
    const aacResponse = await transcribe({
      accessToken,
      payload: { audioFileId: aac.id },
    });
    const hugeResponse = await transcribe({
      accessToken,
      payload: { audioFileId: huge.id },
    });

    assert.equal(noDurationResponse.statusCode, 400);
    assert.equal(aacResponse.statusCode, 415);
    assert.equal(hugeResponse.statusCode, 413);
    assert.equal(await balanceOf(user), 50);
  });

  it('returns 402 when the balance does not cover the audio length', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser({
      balance: 2,
    });
    const audioFile = await createAudioFile({ user, durationSeconds: 150 });

    const response = await transcribe({
      accessToken,
      payload: { audioFileId: audioFile.id },
    });

    assert.equal(response.statusCode, 402);
    assert.equal(response.body.code, 'INSUFFICIENT_CREDITS');
    assert.equal(await balanceOf(user), 2);
    assert.equal(testApp.ai.calls.transcribeAudio.length, 0);
  });

  it('refunds the credits when the provider fails', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({ user, durationSeconds: 125 });

    testApp.ai.failNext('rate_limited');

    const response = await transcribe({
      accessToken,
      payload: { audioFileId: audioFile.id },
    });

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /3 credits were refunded/);
    assert.equal(await balanceOf(user), 50);

    const generation = await GenerationModel.findOne({
      userId: user._id,
      capability: 'speech_to_text',
    });

    assert.equal(generation.status, 'failed');
    assert.equal(generation.errorCategory, 'rate_limited');
    assert.equal(generation.creditsRefunded, 3);

    const savedFile = await AudioFileModel.findById(audioFile._id);

    assert.equal(savedFile.hasTranscript, false);
  });

  it('rejects an unknown model id', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();
    const audioFile = await createAudioFile({ user });

    const response = await transcribe({
      accessToken,
      payload: {
        audioFileId: audioFile.id,
        modelId: catalog.chatModel.id,
      },
    });

    assert.equal(response.statusCode, 400);
  });

  describe('library', () => {
    let owner;
    let other;
    let first;
    let second;
    let firstAudio;

    before(async () => {
      owner = await testApp.createLoggedInUser();
      other = await testApp.createLoggedInUser();
      firstAudio = await createAudioFile({
        user: owner.user,
        title: 'Weekly standup',
      });
      const secondAudio = await createAudioFile({
        user: owner.user,
        durationSeconds: 61,
        title: 'Interview',
      });

      first = (
        await transcribe({
          accessToken: owner.accessToken,
          payload: { audioFileId: firstAudio.id },
        })
      ).body.data.transcription;
      second = (
        await transcribe({
          accessToken: owner.accessToken,
          payload: { audioFileId: secondAudio.id },
        })
      ).body.data.transcription;

      await testApp.sendRequest({
        method: 'PATCH',
        url: `/api/transcriptions/${second.id}`,
        accessToken: owner.accessToken,
        payload: { text: 'Pineapple pizza was discussed.' },
      });
    });

    it('lists only your transcripts, newest first', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: '/api/transcriptions?limit=10',
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.body.data.transcriptions.map((item) => item.id),
        [second.id, first.id],
      );
      assert.equal(response.body.meta.total, 2);

      const otherResponse = await testApp.sendRequest({
        method: 'GET',
        url: '/api/transcriptions',
        accessToken: other.accessToken,
      });

      assert.equal(otherResponse.body.data.transcriptions.length, 0);
    });

    it('filters by audio file and searches the text', async () => {
      const byAudio = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions?audioFileId=${firstAudio.id}`,
        accessToken: owner.accessToken,
      });

      assert.deepEqual(
        byAudio.body.data.transcriptions.map((item) => item.id),
        [first.id],
      );

      const edited = await testApp.sendRequest({
        method: 'GET',
        url: '/api/transcriptions?search=PINEAPPLE',
        accessToken: owner.accessToken,
      });

      assert.deepEqual(
        edited.body.data.transcriptions.map((item) => item.id),
        [second.id],
      );

      const original = await testApp.sendRequest({
        method: 'GET',
        url: '/api/transcriptions?search=fake%20transcriber',
        accessToken: owner.accessToken,
      });

      assert.deepEqual(
        original.body.data.transcriptions.map((item) => item.id),
        [first.id],
      );

      const regexLike = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions?search=${encodeURIComponent('.*')}`,
        accessToken: owner.accessToken,
      });

      assert.equal(regexLike.body.data.transcriptions.length, 0);
    });

    it('shows the edited text and keeps the original', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${second.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(
        response.body.data.transcription.text,
        'Pineapple pizza was discussed.',
      );
      assert.equal(
        response.body.data.transcription.originalText,
        'Hello from the fake transcriber.',
      );
      assert.equal(response.body.data.transcription.isEdited, true);
      assert.equal(response.body.data.transcription.audioTitle, 'Interview');
    });

    it('hides transcripts of other users', async () => {
      for (const [method, url, payload] of [
        ['GET', `/api/transcriptions/${first.id}`],
        ['PATCH', `/api/transcriptions/${first.id}`, { text: 'Hacked' }],
        ['GET', `/api/transcriptions/${first.id}/export`],
        ['DELETE', `/api/transcriptions/${first.id}`],
      ]) {
        const response = await testApp.sendRequest({
          method,
          url,
          payload,
          accessToken: other.accessToken,
        });

        assert.equal(response.statusCode, 404, `${method} ${url}`);
      }
    });

    it('validates the edited text', async () => {
      const response = await testApp.sendRequest({
        method: 'PATCH',
        url: `/api/transcriptions/${first.id}`,
        accessToken: owner.accessToken,
        payload: { text: '   ' },
      });

      assert.equal(response.statusCode, 400);
    });

    it('exports plain text', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${second.id}/export?format=txt`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.match(response.headers['content-type'], /^text\/plain/);
      assert.equal(
        response.headers['content-disposition'],
        'attachment; filename="Interview.txt"',
      );
      assert.equal(response.body, 'Pineapple pizza was discussed.\n');
    });

    it('exports SRT and VTT as one cue that spans the whole audio', async () => {
      const srt = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${first.id}/export?format=srt`,
        accessToken: owner.accessToken,
      });

      assert.equal(srt.statusCode, 200);
      assert.equal(
        srt.body,
        '1\n00:00:00,000 --> 00:01:30,000\nHello from the fake transcriber.\n',
      );
      assert.match(
        srt.headers['content-disposition'],
        /filename="Weekly-standup.srt"/,
      );

      const vtt = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${first.id}/export?format=vtt`,
        accessToken: owner.accessToken,
      });

      assert.match(vtt.headers['content-type'], /^text\/vtt/);
      assert.equal(
        vtt.body,
        'WEBVTT\n\n00:00:00.000 --> 00:01:30.000\nHello from the fake transcriber.\n',
      );

      const invalid = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${first.id}/export?format=docx`,
        accessToken: owner.accessToken,
      });

      assert.equal(invalid.statusCode, 400);
    });

    it('deletes only the transcript text and keeps the charge', async () => {
      const balanceBefore = await balanceOf(owner.user);

      const response = await testApp.sendRequest({
        method: 'DELETE',
        url: `/api/transcriptions/${first.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(await balanceOf(owner.user), balanceBefore);

      const generation = await GenerationModel.findById(first.id);

      assert.equal(generation.output.transcriptText, null);
      assert.equal(generation.output.editedTranscriptText, null);
      assert.equal(generation.creditsCharged, 2);

      const audioFile = await AudioFileModel.findById(firstAudio._id);

      assert.equal(audioFile.hasTranscript, false);

      const again = await testApp.sendRequest({
        method: 'GET',
        url: `/api/transcriptions/${first.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(again.statusCode, 404);
    });

    it('keeps the transcript flag while another transcript of the file exists', async () => {
      const audioFile = await createAudioFile({ user: owner.user });
      const transcriptIds = [];

      for (let index = 0; index < 2; index += 1) {
        const response = await transcribe({
          accessToken: owner.accessToken,
          payload: { audioFileId: audioFile.id },
        });

        transcriptIds.push(response.body.data.transcription.id);
      }

      await testApp.sendRequest({
        method: 'DELETE',
        url: `/api/transcriptions/${transcriptIds[0]}`,
        accessToken: owner.accessToken,
      });

      assert.equal(
        (await AudioFileModel.findById(audioFile._id)).hasTranscript,
        true,
      );

      await testApp.sendRequest({
        method: 'DELETE',
        url: `/api/transcriptions/${transcriptIds[1]}`,
        accessToken: owner.accessToken,
      });

      assert.equal(
        (await AudioFileModel.findById(audioFile._id)).hasTranscript,
        false,
      );
    });
  });
});
