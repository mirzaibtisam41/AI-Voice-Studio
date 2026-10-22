import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AiModelModel, AuditLogModel } from '#src/database/models.js';

describe('platform settings', () => {
  let testApp;
  let admin;
  let catalog;

  before(async () => {
    testApp = await buildTestApp();
    catalog = await testApp.seedCatalog();
    admin = await testApp.createLoggedInUser({ role: 'admin' });
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method, url, accessToken, payload });
  }

  it('serves public settings and admin-set rates without logging in', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/platform',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.settings, {
      signupCredits: 50,
      ttsMaxCharacters: 5000,
      uploadMaxMegabytes: 25,
      realtimeMaxMinutes: 10,
      agentChatMaxMessages: 20,
      maintenanceMode: false,
      maintenanceMessage: '',
      requireEmailVerification: false,
    });
    assert.deepEqual(response.body.data.rates, [
      {
        capability: 'text_to_speech',
        label: 'Text to Speech',
        unit: 'per_100_characters',
        creditsPerUnit: 1,
        modelName: 'GPT Realtime Mini',
      },
      {
        capability: 'speech_to_text',
        label: 'Speech to Text',
        unit: 'per_minute',
        creditsPerUnit: 1,
        modelName: 'GPT Transcribe',
      },
      {
        capability: 'realtime',
        label: 'Real-time conversation',
        unit: 'per_minute',
        creditsPerUnit: 3,
        modelName: 'GPT Realtime Mini',
      },
      {
        capability: 'voice_agent',
        label: 'Voice agent session',
        unit: 'per_minute',
        creditsPerUnit: 3,
        modelName: 'GPT Realtime Mini',
      },
      {
        capability: 'agent_chat',
        label: 'Agent test chat',
        unit: 'per_message',
        creditsPerUnit: 1,
        modelName: 'GPT-5 Nano',
      },
    ]);
  });

  it('shows the new rate as soon as the admin changes the price', async () => {
    const response = await send(
      'PUT',
      `/api/admin/models/${catalog.realtimeModel._id}/capabilities/text_to_speech`,
      { enabled: true, creditsPerUnit: 2 },
    );

    assert.equal(response.statusCode, 200);

    const platform = await testApp.sendRequest({
      method: 'GET',
      url: '/api/platform',
    });
    const tts = platform.body.data.rates.find(
      (rate) => rate.capability === 'text_to_speech',
    );

    assert.equal(tts.creditsPerUnit, 2);
  });

  it('leaves out a capability that has no priced model', async () => {
    await AiModelModel.updateOne(
      { _id: catalog.chatModel._id },
      { status: 'disabled' },
    );

    const platform = await testApp.sendRequest({
      method: 'GET',
      url: '/api/platform',
    });

    assert.ok(
      !platform.body.data.rates.some(
        (rate) => rate.capability === 'agent_chat',
      ),
    );

    await AiModelModel.updateOne(
      { _id: catalog.chatModel._id },
      { status: 'active' },
    );
  });

  it('only lets admins read and change the settings', async () => {
    const user = await testApp.createLoggedInUser();

    const read = await send(
      'GET',
      '/api/admin/settings',
      undefined,
      user.accessToken,
    );
    const write = await send(
      'PATCH',
      '/api/admin/settings',
      { signupCredits: 1 },
      user.accessToken,
    );
    const anonymous = await testApp.sendRequest({
      method: 'GET',
      url: '/api/admin/settings',
    });

    assert.equal(read.statusCode, 403);
    assert.equal(write.statusCode, 403);
    assert.equal(anonymous.statusCode, 401);
  });

  it('returns the full settings to admins', async () => {
    const response = await send('GET', '/api/admin/settings');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.settings.signupCredits, 50);
    assert.equal(response.body.data.settings.maintenanceMode, false);
  });

  it('saves settings and audits only the changed fields', async () => {
    const response = await send('PATCH', '/api/admin/settings', {
      signupCredits: 100,
      ttsMaxCharacters: 5000,
      maintenanceMode: true,
      maintenanceMessage: '  Back soon  ',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.settings.signupCredits, 100);
    assert.equal(response.body.data.settings.maintenanceMessage, 'Back soon');

    const log = await AuditLogModel.findOne({ action: 'settings.updated' });

    assert.equal(log.targetLabel, 'Platform settings');
    assert.equal(log.actorEmail, admin.email);
    assert.deepEqual(log.details, {
      before: {
        signupCredits: 50,
        maintenanceMode: false,
        maintenanceMessage: '',
      },
      after: {
        signupCredits: 100,
        maintenanceMode: true,
        maintenanceMessage: 'Back soon',
      },
    });

    const platform = await testApp.sendRequest({
      method: 'GET',
      url: '/api/platform',
    });

    assert.equal(platform.body.data.settings.maintenanceMode, true);
    assert.equal(platform.body.data.settings.signupCredits, 100);
  });

  it('ignores unknown fields', async () => {
    const response = await send('PATCH', '/api/admin/settings', {
      platformName: 'Other',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.settings.platformName, undefined);
  });

  it('does not write an audit log when nothing changes', async () => {
    const before = await AuditLogModel.countDocuments({
      action: 'settings.updated',
    });

    const response = await send('PATCH', '/api/admin/settings', {
      signupCredits: 100,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      await AuditLogModel.countDocuments({ action: 'settings.updated' }),
      before,
    );
  });

  it('validates the limits', async () => {
    const cases = [
      {},
      { signupCredits: -1 },
      { signupCredits: 100001 },
      { ttsMaxCharacters: 99 },
      { ttsMaxCharacters: 20001 },
      { uploadMaxMegabytes: 26 },
      { realtimeMaxMinutes: 0 },
      { realtimeMaxMinutes: 61 },
      { agentChatMaxMessages: 101 },
      { maintenanceMessage: 'x'.repeat(301) },
      { maintenanceMode: 'yes please' },
    ];

    for (const payload of cases) {
      const response = await send('PATCH', '/api/admin/settings', payload);

      assert.equal(response.statusCode, 400, JSON.stringify(payload));
    }
  });
});
