import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AudioFileModel,
  GenerationModel,
  PlatformSettingsModel,
} from '#src/database/models.js';
import { buildAudioStorageKeyUtil } from '#src/modules/audio-files/shared/utils/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

describe('audio library', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp({ audioDurationSeconds: 42.5 });
    await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  async function createAudioFile({ userId, ...fields }) {
    const audioFileId = new mongoose.Types.ObjectId();
    const kind = fields.kind ?? 'uploaded';
    const storageKey = buildAudioStorageKeyUtil({
      userId,
      folder: kind === 'generated' ? 'generated' : 'uploads',
      audioFileId,
      extension: 'mp3',
    });

    await testApp.storage.uploadFile({
      key: storageKey,
      body: Buffer.from('audio'),
      contentType: 'audio/mpeg',
    });

    return AudioFileModel.create({
      _id: audioFileId,
      userId,
      kind,
      title: 'Untitled',
      storageKey,
      contentType: 'audio/mpeg',
      format: 'mp3',
      sizeBytes: 5,
      durationSeconds: 10,
      ...fields,
    });
  }

  function request({ method = 'GET', url, accessToken, payload }) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  describe('POST /api/audio-files', () => {
    it('uploads a file under the user folder', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      const response = await testApp.uploadAudio({
        accessToken,
        fileName: 'Team Meeting.mp3',
      });

      assert.equal(response.statusCode, 201);

      const { audioFile } = response.body.data;
      const storageKey = `users/${user._id}/uploads/${audioFile.id}.mp3`;

      assert.equal(audioFile.kind, 'uploaded');
      assert.equal(audioFile.title, 'Team Meeting');
      assert.equal(audioFile.format, 'mp3');
      assert.equal(audioFile.contentType, 'audio/mpeg');
      assert.equal(audioFile.durationSeconds, 42.5);
      assert.equal(audioFile.sizeBytes, 'ID3fake-audio-bytes'.length);
      assert.equal(audioFile.favorite, false);
      assert.equal(audioFile.hasTranscript, false);
      assert.equal(audioFile.userId, user._id.toString());
      assert.equal(audioFile.storageKey, undefined);
      assert.ok(audioFile.url.includes(storageKey));
      assert.ok(testApp.storage.files.has(storageKey));
    });

    it('uses the title field when given', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      const response = await testApp.uploadAudio({
        accessToken,
        fileName: 'voice.wav',
        contentType: 'audio/wav',
        fields: { title: 'Interview take 2' },
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.body.data.audioFile.title, 'Interview take 2');
      assert.equal(response.body.data.audioFile.format, 'wav');
      assert.equal(response.body.data.audioFile.contentType, 'audio/wav');
    });

    it('rejects a file type that is not supported', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      const response = await testApp.uploadAudio({
        accessToken,
        fileName: 'notes.txt',
        contentType: 'text/plain',
      });

      assert.equal(response.statusCode, 415);
      assert.equal(response.body.code, 'UNSUPPORTED_MEDIA_TYPE');
      assert.equal(
        await AudioFileModel.countDocuments({ userId: user._id }),
        0,
      );
    });

    it('rejects files over the platform upload limit', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();

      await getPlatformSettingsService();
      await PlatformSettingsModel.updateOne({}, { uploadMaxMegabytes: 1 });

      try {
        const response = await testApp.uploadAudio({
          accessToken,
          content: Buffer.alloc(1024 * 1024 + 10, 1),
        });

        assert.equal(response.statusCode, 413);
        assert.match(response.body.message, /1 MB/);
      } finally {
        await PlatformSettingsModel.updateOne({}, { uploadMaxMegabytes: 25 });
      }

      assert.equal(
        await AudioFileModel.countDocuments({ userId: user._id }),
        0,
      );
    });

    it('asks for a file when the request has none', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      const response = await request({
        method: 'POST',
        url: '/api/audio-files',
        accessToken,
        payload: { title: 'nothing' },
      });

      assert.equal(response.statusCode, 400);
    });

    it('requires a logged-in user', async () => {
      const response = await request({
        method: 'POST',
        url: '/api/audio-files',
      });

      assert.equal(response.statusCode, 401);
    });
  });

  describe('GET /api/audio-files', () => {
    let accessToken;
    let files;

    before(async () => {
      const owner = await testApp.createLoggedInUser();
      const other = await testApp.createLoggedInUser();
      const userId = owner.user._id;

      accessToken = owner.accessToken;
      files = {
        intro: await createAudioFile({
          userId,
          kind: 'generated',
          title: 'Podcast intro',
          durationSeconds: 30,
          createdAt: new Date('2026-01-01'),
        }),
        meeting: await createAudioFile({
          userId,
          title: 'meeting (draft)',
          durationSeconds: 300,
          hasTranscript: true,
          createdAt: new Date('2026-02-01'),
        }),
        ad: await createAudioFile({
          userId,
          kind: 'generated',
          title: 'Ad read',
          durationSeconds: 15,
          favorite: true,
          createdAt: new Date('2026-03-01'),
        }),
      };

      await createAudioFile({
        userId: other.user._id,
        title: 'Podcast intro of someone else',
      });
    });

    async function listTitles(query = '') {
      const response = await request({
        url: `/api/audio-files${query}`,
        accessToken,
      });

      assert.equal(response.statusCode, 200);

      return response.body.data.audioFiles.map((item) => item.title);
    }

    it('lists only my files, newest first, with signed urls', async () => {
      const response = await request({ url: '/api/audio-files', accessToken });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.body.data.audioFiles.map((item) => item.title),
        ['Ad read', 'meeting (draft)', 'Podcast intro'],
      );
      assert.deepEqual(response.body.meta, {
        page: 1,
        limit: 20,
        total: 3,
        totalPages: 1,
      });

      for (const item of response.body.data.audioFiles) {
        assert.match(item.url, /^https:\/\/storage\.test\/users\//);
        assert.equal(item.storageKey, undefined);
      }
    });

    it('filters by kind, transcript, favorite and search', async () => {
      assert.deepEqual(await listTitles('?kind=generated'), [
        'Ad read',
        'Podcast intro',
      ]);
      assert.deepEqual(await listTitles('?kind=uploaded'), ['meeting (draft)']);
      assert.deepEqual(await listTitles('?transcribed=true'), [
        'meeting (draft)',
      ]);
      assert.deepEqual(await listTitles('?favorite=true'), ['Ad read']);
      assert.deepEqual(await listTitles('?search=PODCAST'), ['Podcast intro']);
      assert.deepEqual(await listTitles('?search=(draft'), ['meeting (draft)']);
      assert.deepEqual(await listTitles('?search=.*'), []);
    });

    it('sorts by oldest, longest and name', async () => {
      assert.deepEqual(await listTitles('?sort=oldest'), [
        'Podcast intro',
        'meeting (draft)',
        'Ad read',
      ]);
      assert.deepEqual(await listTitles('?sort=longest'), [
        'meeting (draft)',
        'Podcast intro',
        'Ad read',
      ]);
      assert.deepEqual(await listTitles('?sort=name'), [
        'Ad read',
        'meeting (draft)',
        'Podcast intro',
      ]);
    });

    it('paginates', async () => {
      const response = await request({
        url: '/api/audio-files?page=2&limit=2',
        accessToken,
      });

      assert.deepEqual(
        response.body.data.audioFiles.map((item) => item.title),
        ['Podcast intro'],
      );
      assert.deepEqual(response.body.meta, {
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
      });
    });

    it('validates the query', async () => {
      for (const query of ['?kind=voice', '?sort=random', '?limit=500']) {
        const response = await request({
          url: `/api/audio-files${query}`,
          accessToken,
        });

        assert.equal(response.statusCode, 400, query);
      }
    });

    it('gets one of my files and hides other users files', async () => {
      const mine = await request({
        url: `/api/audio-files/${files.intro.id}`,
        accessToken,
      });

      assert.equal(mine.statusCode, 200);
      assert.equal(mine.body.data.audioFile.title, 'Podcast intro');
      assert.ok(mine.body.data.audioFile.url.includes(files.intro.storageKey));

      const stranger = await testApp.createLoggedInUser();
      const notMine = await request({
        url: `/api/audio-files/${files.intro.id}`,
        accessToken: stranger.accessToken,
      });
      const invalid = await request({
        url: '/api/audio-files/not-an-id',
        accessToken,
      });

      assert.equal(notMine.statusCode, 404);
      assert.equal(invalid.statusCode, 400);
    });
  });

  describe('PATCH /api/audio-files/:id', () => {
    it('renames and favorites my file', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const audioFile = await createAudioFile({ userId: user._id });

      const response = await request({
        method: 'PATCH',
        url: `/api/audio-files/${audioFile.id}`,
        accessToken,
        payload: { title: '  Final mix  ', favorite: true },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.audioFile.title, 'Final mix');
      assert.equal(response.body.data.audioFile.favorite, true);
      assert.ok(response.body.data.audioFile.url);

      const saved = await AudioFileModel.findById(audioFile._id);

      assert.equal(saved.title, 'Final mix');
      assert.equal(saved.favorite, true);
    });

    it('validates the body and ownership', async () => {
      const owner = await testApp.createLoggedInUser();
      const stranger = await testApp.createLoggedInUser();
      const audioFile = await createAudioFile({ userId: owner.user._id });
      const url = `/api/audio-files/${audioFile.id}`;

      for (const payload of [
        {},
        { title: '' },
        { title: '   ' },
        { title: 'x'.repeat(151) },
        { favorite: 'yes' },
      ]) {
        const response = await request({
          method: 'PATCH',
          url,
          accessToken: owner.accessToken,
          payload,
        });

        assert.equal(response.statusCode, 400, JSON.stringify(payload));
      }

      const notMine = await request({
        method: 'PATCH',
        url,
        accessToken: stranger.accessToken,
        payload: { favorite: true },
      });

      assert.equal(notMine.statusCode, 404);
      assert.equal(
        (await AudioFileModel.findById(audioFile._id)).favorite,
        false,
      );
    });
  });

  describe('GET /api/audio-files/:id/download', () => {
    it('signs a url with a download file name', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const audioFile = await createAudioFile({
        userId: user._id,
        title: 'Weekly: "update"',
      });

      const response = await request({
        url: `/api/audio-files/${audioFile.id}/download`,
        accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.ok(response.body.data.url.includes(audioFile.storageKey));
      assert.ok(
        response.body.data.url.includes(
          `download=${encodeURIComponent('Weekly update.mp3')}`,
        ),
      );

      const stranger = await testApp.createLoggedInUser();
      const notMine = await request({
        url: `/api/audio-files/${audioFile.id}/download`,
        accessToken: stranger.accessToken,
      });

      assert.equal(notMine.statusCode, 404);
    });
  });

  describe('DELETE /api/audio-files/:id', () => {
    it('deletes the stored object and the record but keeps the generation', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const created = await request({
        method: 'POST',
        url: '/api/speech',
        accessToken,
        payload: { text: 'Keep my history.', voiceCode: 'marin' },
      });

      assert.equal(created.statusCode, 201);

      const { audioFile, generation } = created.body.data;
      const storageKey = `users/${user._id}/generated/${audioFile.id}.mp3`;

      assert.ok(testApp.storage.files.has(storageKey));

      const response = await request({
        method: 'DELETE',
        url: `/api/audio-files/${audioFile.id}`,
        accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(testApp.storage.files.has(storageKey), false);
      assert.equal(await AudioFileModel.exists({ _id: audioFile.id }), null);
      assert.equal(
        (await GenerationModel.findById(generation.id)).status,
        'completed',
      );

      const again = await request({
        method: 'DELETE',
        url: `/api/audio-files/${audioFile.id}`,
        accessToken,
      });

      assert.equal(again.statusCode, 404);
    });

    it('does not delete someone else file', async () => {
      const owner = await testApp.createLoggedInUser();
      const stranger = await testApp.createLoggedInUser();
      const audioFile = await createAudioFile({ userId: owner.user._id });

      const response = await request({
        method: 'DELETE',
        url: `/api/audio-files/${audioFile.id}`,
        accessToken: stranger.accessToken,
      });

      assert.equal(response.statusCode, 404);
      assert.ok(testApp.storage.files.has(audioFile.storageKey));
      assert.ok(await AudioFileModel.exists({ _id: audioFile._id }));
    });
  });

  describe('bulk actions', () => {
    it('favorites only my files', async () => {
      const owner = await testApp.createLoggedInUser();
      const stranger = await testApp.createLoggedInUser();
      const first = await createAudioFile({ userId: owner.user._id });
      const second = await createAudioFile({ userId: owner.user._id });
      const foreign = await createAudioFile({ userId: stranger.user._id });

      const response = await request({
        method: 'POST',
        url: '/api/audio-files/bulk-favorite',
        accessToken: owner.accessToken,
        payload: { ids: [first.id, second.id, foreign.id], favorite: true },
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.body.data.updatedIds.sort(),
        [first.id, second.id].sort(),
      );
      assert.equal((await AudioFileModel.findById(first._id)).favorite, true);
      assert.equal((await AudioFileModel.findById(second._id)).favorite, true);
      assert.equal(
        (await AudioFileModel.findById(foreign._id)).favorite,
        false,
      );

      const unfavorite = await request({
        method: 'POST',
        url: '/api/audio-files/bulk-favorite',
        accessToken: owner.accessToken,
        payload: { ids: [first.id], favorite: false },
      });

      assert.deepEqual(unfavorite.body.data.updatedIds, [first.id]);
      assert.equal((await AudioFileModel.findById(first._id)).favorite, false);
    });

    it('deletes only my files and their stored objects', async () => {
      const owner = await testApp.createLoggedInUser();
      const stranger = await testApp.createLoggedInUser();
      const first = await createAudioFile({ userId: owner.user._id });
      const second = await createAudioFile({ userId: owner.user._id });
      const kept = await createAudioFile({ userId: owner.user._id });
      const foreign = await createAudioFile({ userId: stranger.user._id });

      const response = await request({
        method: 'POST',
        url: '/api/audio-files/bulk-delete',
        accessToken: owner.accessToken,
        payload: { ids: [first.id, second.id, foreign.id] },
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.body.data.deletedIds.sort(),
        [first.id, second.id].sort(),
      );
      assert.equal(testApp.storage.files.has(first.storageKey), false);
      assert.equal(testApp.storage.files.has(second.storageKey), false);
      assert.ok(testApp.storage.files.has(kept.storageKey));
      assert.ok(testApp.storage.files.has(foreign.storageKey));
      assert.equal(
        await AudioFileModel.countDocuments({ userId: owner.user._id }),
        1,
      );
      assert.ok(await AudioFileModel.exists({ _id: foreign._id }));
    });

    it('validates the id list', async () => {
      const { accessToken } = await testApp.createLoggedInUser();

      for (const [url, payload] of [
        ['/api/audio-files/bulk-delete', { ids: [] }],
        ['/api/audio-files/bulk-delete', { ids: ['bad'] }],
        [
          '/api/audio-files/bulk-favorite',
          { ids: [new mongoose.Types.ObjectId().toString()] },
        ],
      ]) {
        const response = await request({
          method: 'POST',
          url,
          accessToken,
          payload,
        });

        assert.equal(response.statusCode, 400, JSON.stringify(payload));
      }
    });
  });
});
