import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AuditLogModel } from '#src/database/models.js';

const UNKNOWN_ID = '0123456789abcdef01234567';

describe('voices', () => {
  let testApp;
  let admin;
  let user;
  let voices;

  before(async () => {
    testApp = await buildTestApp();
    ({ voices } = await testApp.seedCatalog());
    admin = await testApp.createLoggedInUser({ role: 'admin' });
    user = await testApp.createLoggedInUser();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  function findVoice(code) {
    return voices.find((voice) => voice.code === code);
  }

  it('requires a logged-in user for the voice list', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/voices',
    });

    assert.equal(response.statusCode, 401);
  });

  it('lists only enabled voices in sort order with public fields', async () => {
    const response = await send(
      'GET',
      '/api/voices',
      undefined,
      user.accessToken,
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.body.data.voices.map((voice) => voice.code),
      ['marin', 'cedar'],
    );
    assert.deepEqual(Object.keys(response.body.data.voices[0]).sort(), [
      'accent',
      'code',
      'description',
      'gender',
      'id',
      'name',
      'tags',
    ]);
  });

  it('only lets admins use the admin voice routes', async () => {
    const list = await send(
      'GET',
      '/api/admin/voices',
      undefined,
      user.accessToken,
    );
    const update = await send(
      'PATCH',
      `/api/admin/voices/${findVoice('marin').id}`,
      { name: 'Hacked' },
      user.accessToken,
    );

    assert.equal(list.statusCode, 403);
    assert.equal(update.statusCode, 403);
  });

  it('lists every voice for admins', async () => {
    const response = await send('GET', '/api/admin/voices');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.body.data.voices.map((voice) => voice.code),
      ['marin', 'cedar', 'alloy'],
    );
    assert.equal(response.body.data.voices[2].enabled, false);
  });

  it('updates a voice and records only the changed fields', async () => {
    const voice = findVoice('alloy');

    const response = await send('PATCH', `/api/admin/voices/${voice.id}`, {
      name: ' Alloy Prime ',
      accent: 'British',
      gender: 'female',
      tags: [' Balanced ', 'Assistant', 'balanced'],
      description: 'An even voice',
      enabled: true,
      sortOrder: 0,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.voice.name, 'Alloy Prime');
    assert.deepEqual(response.body.data.voice.tags, ['Balanced', 'Assistant']);
    assert.equal(response.body.data.voice.enabled, true);

    const list = await send('GET', '/api/voices', undefined, user.accessToken);

    assert.equal(list.body.data.voices[0].code, 'alloy');

    const log = await AuditLogModel.findOne({
      action: 'voice.updated',
      targetId: voice.id,
    });

    assert.equal(log.targetLabel, 'Alloy Prime');
    assert.equal(log.details.before.enabled, false);
    assert.equal(log.details.after.enabled, true);
    assert.deepEqual(log.details.after.tags, ['Balanced', 'Assistant']);
  });

  it('validates the voice update', async () => {
    const voice = findVoice('cedar');
    const url = `/api/admin/voices/${voice.id}`;

    const tooManyTags = await send('PATCH', url, {
      tags: Array.from({ length: 9 }, (_value, index) => `tag${index}`),
    });
    const longTag = await send('PATCH', url, { tags: ['x'.repeat(31)] });
    const badGender = await send('PATCH', url, { gender: 'robot' });
    const empty = await send('PATCH', url, {});
    const unknownField = await send('PATCH', url, { code: 'other' });
    const missing = await send('PATCH', `/api/admin/voices/${UNKNOWN_ID}`, {
      name: 'Ghost',
    });

    assert.equal(tooManyTags.statusCode, 400);
    assert.equal(longTag.statusCode, 400);
    assert.equal(badGender.statusCode, 400);
    assert.equal(empty.statusCode, 400);
    assert.equal(unknownField.statusCode, 200);
    assert.equal(unknownField.body.data.voice.code, 'cedar');
    assert.equal(missing.statusCode, 404);
  });

  it('hides a disabled voice from users', async () => {
    const voice = findVoice('cedar');

    await send('PATCH', `/api/admin/voices/${voice.id}`, { enabled: false });

    const list = await send('GET', '/api/voices', undefined, user.accessToken);

    assert.ok(!list.body.data.voices.some((item) => item.code === 'cedar'));
  });
});
