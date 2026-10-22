import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AiModelModel, AuditLogModel } from '#src/database/models.js';

const UNKNOWN_ID = '0123456789abcdef01234567';

describe('admin AI providers', () => {
  let testApp;
  let admin;
  let codeCounter = 0;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.createLoggedInUser({ role: 'admin' });
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  function makeCode() {
    codeCounter += 1;

    return `provider-${codeCounter}`;
  }

  async function createProvider(overrides = {}) {
    const response = await send('POST', '/api/admin/providers', {
      code: makeCode(),
      name: 'Test Provider',
      ...overrides,
    });

    return response.body.data.provider;
  }

  it('rejects anonymous users and non-admins', async () => {
    const user = await testApp.createLoggedInUser();

    const anonymous = await testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/providers',
    });
    const regular = await send(
      'GET',
      '/api/admin/providers',
      undefined,
      user.accessToken,
    );

    assert.equal(anonymous.statusCode, 401);
    assert.equal(regular.statusCode, 403);
  });

  it('creates an active provider with a lowercase code and writes an audit log', async () => {
    const response = await send('POST', '/api/admin/providers', {
      code: 'ElevenLabs',
      name: '  ElevenLabs  ',
      description: 'Voices',
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.provider.code, 'elevenlabs');
    assert.equal(response.body.data.provider.name, 'ElevenLabs');
    assert.equal(response.body.data.provider.status, 'active');
    assert.equal(response.body.data.provider.modelsCount, 0);
    assert.equal(typeof response.body.data.provider.id, 'string');

    const log = await AuditLogModel.findOne({
      action: 'provider.created',
      targetId: response.body.data.provider.id,
    });

    assert.ok(log);
    assert.equal(log.actorEmail, admin.email);
    assert.equal(log.details.after.code, 'elevenlabs');
  });

  it('rejects a duplicate code with 409', async () => {
    const provider = await createProvider();

    const response = await send('POST', '/api/admin/providers', {
      code: provider.code.toUpperCase(),
      name: 'Again',
    });

    assert.equal(response.statusCode, 409);
    assert.equal(
      response.body.message,
      'A provider with this code already exists',
    );
  });

  it('rejects invalid input', async () => {
    const badCode = await send('POST', '/api/admin/providers', {
      code: 'Open AI!',
      name: 'x',
    });
    const missingName = await send('POST', '/api/admin/providers', {
      code: 'valid-code',
    });
    const blankName = await send('POST', '/api/admin/providers', {
      code: 'valid-code',
      name: '   ',
    });

    assert.equal(badCode.statusCode, 400);
    assert.equal(missingName.statusCode, 400);
    assert.equal(blankName.statusCode, 400);
  });

  it('lists providers with their model counts', async () => {
    const provider = await createProvider({ name: 'Counted' });

    await AiModelModel.create({
      providerId: provider.id,
      name: 'Counted model',
      slug: 'counted-model',
      providerModelId: 'counted-model',
    });

    const response = await send('GET', '/api/admin/providers');
    const listed = response.body.data.providers.find(
      (item) => item.id === provider.id,
    );

    assert.equal(response.statusCode, 200);
    assert.equal(listed.modelsCount, 1);
    assert.equal(listed.code, provider.code);
    assert.equal(listed._id, undefined);
  });

  it('returns one provider and 404 for an unknown id', async () => {
    const provider = await createProvider();

    const found = await send('GET', `/api/admin/providers/${provider.id}`);
    const missing = await send('GET', `/api/admin/providers/${UNKNOWN_ID}`);
    const invalid = await send('GET', '/api/admin/providers/not-an-id');

    assert.equal(found.statusCode, 200);
    assert.equal(found.body.data.provider.code, provider.code);
    assert.equal(found.body.data.provider.modelsCount, 0);
    assert.equal(missing.statusCode, 404);
    assert.equal(invalid.statusCode, 400);
  });

  it('updates name and description but never the code', async () => {
    const provider = await createProvider();

    const response = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {
        name: '  Renamed  ',
        description: 'New description',
        code: 'changed-code',
      },
    );

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.provider.name, 'Renamed');
    assert.equal(response.body.data.provider.description, 'New description');
    assert.equal(response.body.data.provider.code, provider.code);

    const log = await AuditLogModel.findOne({
      action: 'provider.updated',
      targetId: provider.id,
    });

    assert.equal(log.details.before.name, 'Test Provider');
    assert.equal(log.details.after.name, 'Renamed');
  });

  it('skips the audit log when nothing changes', async () => {
    const provider = await createProvider({ name: 'Same' });

    const response = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {
        name: 'Same',
        code: 'ignored-code',
      },
    );
    const logs = await AuditLogModel.countDocuments({
      action: 'provider.updated',
      targetId: provider.id,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.provider.code, provider.code);
    assert.equal(logs, 0);
  });

  it('rejects an empty update and 404s an unknown provider', async () => {
    const provider = await createProvider();

    const empty = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}`,
      {},
    );
    const missing = await send('PATCH', `/api/admin/providers/${UNKNOWN_ID}`, {
      name: 'x',
    });

    assert.equal(empty.statusCode, 400);
    assert.equal(missing.statusCode, 404);
  });

  it('changes the status and records it', async () => {
    const provider = await createProvider();

    const disabled = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}/status`,
      { status: 'disabled' },
    );
    const invalid = await send(
      'PATCH',
      `/api/admin/providers/${provider.id}/status`,
      { status: 'paused' },
    );

    assert.equal(disabled.statusCode, 200);
    assert.equal(disabled.body.data.provider.status, 'disabled');
    assert.equal(invalid.statusCode, 400);

    const log = await AuditLogModel.findOne({
      action: 'provider.status_changed',
      targetId: provider.id,
    });

    assert.deepEqual(log.details, {
      before: { status: 'active' },
      after: { status: 'disabled' },
    });
  });

  it('refuses to delete a provider that has models', async () => {
    const provider = await createProvider();

    await AiModelModel.create({
      providerId: provider.id,
      name: 'Blocking model',
      slug: 'blocking-model',
      providerModelId: 'blocking-model',
    });

    const response = await send(
      'DELETE',
      `/api/admin/providers/${provider.id}`,
    );

    assert.equal(response.statusCode, 409);
  });

  it('deletes a provider without models and records it', async () => {
    const provider = await createProvider();

    const response = await send(
      'DELETE',
      `/api/admin/providers/${provider.id}`,
    );
    const again = await send('DELETE', `/api/admin/providers/${provider.id}`);
    const log = await AuditLogModel.findOne({
      action: 'provider.deleted',
      targetId: provider.id,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(again.statusCode, 404);
    assert.equal(log.details.before.code, provider.code);
  });
});
