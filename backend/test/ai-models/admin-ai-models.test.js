import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AiModelModel, AuditLogModel } from '#src/database/models.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';

const UNKNOWN_ID = '0123456789abcdef01234567';

describe('admin AI models', () => {
  let testApp;
  let admin;
  let provider;
  let slugCounter = 0;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.createLoggedInUser({ role: 'admin' });

    const response = await send('POST', '/api/admin/providers', {
      code: 'openai',
      name: 'OpenAI',
    });

    provider = response.body.data.provider;
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  function makeSlug() {
    slugCounter += 1;

    return `model-${slugCounter}`;
  }

  async function createModel(overrides = {}) {
    const slug = makeSlug();
    const response = await send('POST', '/api/admin/models', {
      providerId: provider.id,
      name: `Model ${slug}`,
      slug,
      providerModelId: slug,
      ...overrides,
    });

    assert.equal(response.statusCode, 201);

    return response.body.data.model;
  }

  function saveCapability(modelId, code, payload) {
    return send(
      'PUT',
      `/api/admin/models/${modelId}/capabilities/${code}`,
      payload,
    );
  }

  function setStatus(modelId, status) {
    return send('PATCH', `/api/admin/models/${modelId}/status`, { status });
  }

  function makeDefault(modelId, code) {
    return send(
      'PATCH',
      `/api/admin/models/${modelId}/capabilities/${code}/default`,
    );
  }

  async function createActiveModel({ code, creditsPerUnit = 2 }) {
    const model = await createModel();

    await saveCapability(model.id, code, { enabled: true, creditsPerUnit });
    await setStatus(model.id, 'active');

    return model;
  }

  function capabilityOf(model, code) {
    return model.capabilities.find((item) => item.code === code);
  }

  it('only lets admins in', async () => {
    const user = await testApp.createLoggedInUser();

    const response = await send(
      'GET',
      '/api/admin/models',
      undefined,
      user.accessToken,
    );

    assert.equal(response.statusCode, 403);
  });

  it('lists the capabilities with label and unit', async () => {
    const response = await send('GET', '/api/admin/models/capabilities');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.capabilities[0], {
      code: 'text_to_speech',
      label: 'Text to Speech',
      unit: 'per_100_characters',
    });
    assert.equal(response.body.data.capabilities.length, 5);
  });

  it('creates a draft model with no configured capabilities', async () => {
    const response = await send('POST', '/api/admin/models', {
      providerId: provider.id,
      name: '  GPT Test  ',
      slug: 'GPT-Test',
      providerModelId: 'gpt-test-1.0',
      description: 'A test model',
    });
    const model = response.body.data.model;

    assert.equal(response.statusCode, 201);
    assert.equal(model.status, 'draft');
    assert.equal(model.slug, 'gpt-test');
    assert.equal(model.name, 'GPT Test');
    assert.equal(model.provider.code, 'openai');
    assert.equal(model.capabilities.length, 5);
    assert.ok(model.capabilities.every((item) => item.configured === false));
    assert.deepEqual(capabilityOf(model, 'speech_to_text'), {
      code: 'speech_to_text',
      label: 'Speech to Text',
      unit: 'per_minute',
      enabled: false,
      creditsPerUnit: null,
      isDefault: false,
      configured: false,
    });

    const log = await AuditLogModel.findOne({
      action: 'model.created',
      targetId: model.id,
    });

    assert.equal(log.details.after.slug, 'gpt-test');
  });

  it('rejects a duplicate slug, an unknown provider and bad input', async () => {
    const model = await createModel();

    const duplicate = await send('POST', '/api/admin/models', {
      providerId: provider.id,
      name: 'Again',
      slug: model.slug,
      providerModelId: 'other',
    });
    const unknownProvider = await send('POST', '/api/admin/models', {
      providerId: UNKNOWN_ID,
      name: 'Nope',
      slug: 'nope',
      providerModelId: 'nope',
    });
    const badSlug = await send('POST', '/api/admin/models', {
      providerId: provider.id,
      name: 'Bad',
      slug: 'bad slug',
      providerModelId: 'bad',
    });

    assert.equal(duplicate.statusCode, 409);
    assert.equal(
      duplicate.body.message,
      'A model with this slug already exists',
    );
    assert.equal(unknownProvider.statusCode, 400);
    assert.equal(badSlug.statusCode, 400);
  });

  it('gets one model and 404s an unknown id', async () => {
    const model = await createModel();

    const found = await send('GET', `/api/admin/models/${model.id}`);
    const missing = await send('GET', `/api/admin/models/${UNKNOWN_ID}`);

    assert.equal(found.statusCode, 200);
    assert.equal(found.body.data.model.id, model.id);
    assert.equal(found.body.data.model.provider.name, 'OpenAI');
    assert.equal(missing.statusCode, 404);
  });

  it('updates name and description only', async () => {
    const model = await createModel();

    const response = await send('PATCH', `/api/admin/models/${model.id}`, {
      name: 'Renamed',
      description: null,
      slug: 'changed-slug',
      providerModelId: 'changed',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.model.name, 'Renamed');
    assert.equal(response.body.data.model.description, null);
    assert.equal(response.body.data.model.slug, model.slug);
    assert.equal(
      response.body.data.model.providerModelId,
      model.providerModelId,
    );

    const log = await AuditLogModel.findOne({
      action: 'model.updated',
      targetId: model.id,
    });

    assert.equal(log.details.after.name, 'Renamed');
  });

  it('saves capability prices set by the admin', async () => {
    const model = await createModel();

    const response = await saveCapability(model.id, 'text_to_speech', {
      enabled: true,
      creditsPerUnit: 4,
    });
    const tts = capabilityOf(response.body.data.model, 'text_to_speech');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(tts, {
      code: 'text_to_speech',
      label: 'Text to Speech',
      unit: 'per_100_characters',
      enabled: true,
      creditsPerUnit: 4,
      isDefault: false,
      configured: true,
    });

    const priceOnly = await saveCapability(model.id, 'text_to_speech', {
      enabled: false,
    });

    assert.equal(
      capabilityOf(priceOnly.body.data.model, 'text_to_speech').creditsPerUnit,
      4,
    );

    const log = await AuditLogModel.findOne({
      action: 'model.capability_updated',
      targetId: model.id,
    }).sort({ createdAt: 1 });

    assert.equal(log.details.capability, 'text_to_speech');
    assert.deepEqual(log.details.before, {
      enabled: false,
      creditsPerUnit: null,
    });
    assert.deepEqual(log.details.after, { enabled: true, creditsPerUnit: 4 });
  });

  it('refuses to enable a capability without a price', async () => {
    const model = await createModel();

    const noPrice = await saveCapability(model.id, 'realtime', {
      enabled: true,
    });
    const zero = await saveCapability(model.id, 'realtime', {
      enabled: true,
      creditsPerUnit: 0,
    });
    const fraction = await saveCapability(model.id, 'realtime', {
      enabled: true,
      creditsPerUnit: 1.5,
    });
    const unknownCode = await saveCapability(model.id, 'image', {
      enabled: true,
      creditsPerUnit: 1,
    });
    const missing = await saveCapability(UNKNOWN_ID, 'realtime', {
      enabled: true,
      creditsPerUnit: 1,
    });

    assert.equal(noPrice.statusCode, 400);
    assert.equal(zero.statusCode, 400);
    assert.equal(fraction.statusCode, 400);
    assert.equal(unknownCode.statusCode, 400);
    assert.equal(missing.statusCode, 404);
  });

  it('activates only a model with an enabled, priced capability', async () => {
    const model = await createModel();

    const refused = await setStatus(model.id, 'active');

    assert.equal(refused.statusCode, 400);

    await saveCapability(model.id, 'agent_chat', {
      enabled: true,
      creditsPerUnit: 2,
    });

    const activated = await setStatus(model.id, 'active');

    assert.equal(activated.statusCode, 200);
    assert.equal(activated.body.data.model.status, 'active');

    const log = await AuditLogModel.findOne({
      action: 'model.status_changed',
      targetId: model.id,
    });

    assert.deepEqual(log.details, {
      before: { status: 'draft' },
      after: { status: 'active' },
    });
  });

  it('keeps an active model with at least one capability turned on', async () => {
    const model = await createActiveModel({ code: 'agent_chat' });

    const response = await saveCapability(model.id, 'agent_chat', {
      enabled: false,
    });

    assert.equal(response.statusCode, 400);
  });

  it('makes one model the single default for a capability', async () => {
    const first = await createActiveModel({
      code: 'speech_to_text',
      creditsPerUnit: 1,
    });
    const second = await createActiveModel({
      code: 'speech_to_text',
      creditsPerUnit: 2,
    });

    const firstDefault = await makeDefault(first.id, 'speech_to_text');

    assert.equal(firstDefault.statusCode, 200);
    assert.equal(
      capabilityOf(firstDefault.body.data.model, 'speech_to_text').isDefault,
      true,
    );

    const secondDefault = await makeDefault(second.id, 'speech_to_text');

    assert.equal(secondDefault.statusCode, 200);

    const defaults = await AiModelModel.find({
      capabilities: { $elemMatch: { code: 'speech_to_text', isDefault: true } },
    });

    assert.deepEqual(
      defaults.map((model) => model._id.toString()),
      [second.id],
    );

    const resolved = await resolvePricedModelService({
      capability: 'speech_to_text',
    });

    assert.equal(resolved.model._id.toString(), second.id);
    assert.equal(resolved.creditsPerUnit, 2);

    const log = await AuditLogModel.findOne({
      action: 'model.default_changed',
      targetId: second.id,
    });

    assert.equal(log.details.capability, 'speech_to_text');
    assert.equal(log.details.before.modelId, first.id);
    assert.equal(log.details.after.modelId, second.id);
  });

  it('refuses a default on a model that is not active or not priced', async () => {
    const draft = await createModel();

    await saveCapability(draft.id, 'voice_agent', {
      enabled: true,
      creditsPerUnit: 3,
    });

    const notActive = await makeDefault(draft.id, 'voice_agent');
    const active = await createActiveModel({ code: 'voice_agent' });
    const notEnabled = await makeDefault(active.id, 'realtime');

    assert.equal(notActive.statusCode, 400);
    assert.equal(notEnabled.statusCode, 400);
  });

  it('refuses a default when the provider is disabled', async () => {
    const otherProvider = await send('POST', '/api/admin/providers', {
      code: 'disabled-provider',
      name: 'Disabled provider',
    });
    const model = await createModel({
      providerId: otherProvider.body.data.provider.id,
    });

    await saveCapability(model.id, 'realtime', {
      enabled: true,
      creditsPerUnit: 3,
    });
    await setStatus(model.id, 'active');
    await send(
      'PATCH',
      `/api/admin/providers/${otherProvider.body.data.provider.id}/status`,
      { status: 'disabled' },
    );

    const response = await makeDefault(model.id, 'realtime');

    assert.equal(response.statusCode, 400);
  });

  it('refuses to disable a default model while another can take over', async () => {
    const current = await createActiveModel({
      code: 'realtime',
      creditsPerUnit: 3,
    });
    const other = await createActiveModel({
      code: 'realtime',
      creditsPerUnit: 5,
    });

    await makeDefault(current.id, 'realtime');

    const refused = await setStatus(current.id, 'disabled');

    assert.equal(refused.statusCode, 409);
    assert.match(refused.body.message, /Choose another default model first/);

    const refusedCapability = await saveCapability(current.id, 'realtime', {
      enabled: false,
    });

    assert.equal(refusedCapability.statusCode, 409);

    await makeDefault(other.id, 'realtime');

    const allowed = await setStatus(current.id, 'disabled');

    assert.equal(allowed.statusCode, 200);
    assert.equal(allowed.body.data.model.status, 'disabled');
  });

  it('allows disabling the only default model and clears the default', async () => {
    const only = await createActiveModel({
      code: 'text_to_speech',
      creditsPerUnit: 1,
    });

    await AiModelModel.updateMany(
      { _id: { $ne: only.id } },
      { status: 'disabled' },
    );
    await makeDefault(only.id, 'text_to_speech');

    const response = await setStatus(only.id, 'deprecated');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.model.status, 'deprecated');
    assert.equal(
      capabilityOf(response.body.data.model, 'text_to_speech').isDefault,
      false,
    );
  });

  it('lists models with filters and pagination', async () => {
    const filtered = await createModel({ name: 'Searchable Whisper' });

    await saveCapability(filtered.id, 'speech_to_text', {
      enabled: true,
      creditsPerUnit: 1,
    });

    const all = await send('GET', '/api/admin/models?page=1&limit=2');
    const search = await send('GET', '/api/admin/models?search=whisper');
    const byCapability = await send(
      'GET',
      '/api/admin/models?capability=speech_to_text&status=draft',
    );
    const byProvider = await send(
      'GET',
      `/api/admin/models?providerId=${provider.id}&limit=100`,
    );
    const invalid = await send('GET', '/api/admin/models?status=gone');

    assert.equal(all.statusCode, 200);
    assert.equal(all.body.data.models.length, 2);
    assert.equal(all.body.meta.page, 1);
    assert.equal(all.body.meta.limit, 2);
    assert.ok(all.body.meta.total > 2);
    assert.deepEqual(
      search.body.data.models.map((model) => model.id),
      [filtered.id],
    );
    assert.deepEqual(
      byCapability.body.data.models.map((model) => model.id),
      [filtered.id],
    );
    assert.ok(
      byProvider.body.data.models.every(
        (model) => model.provider.id === provider.id,
      ),
    );
    assert.equal(invalid.statusCode, 400);
  });
});
