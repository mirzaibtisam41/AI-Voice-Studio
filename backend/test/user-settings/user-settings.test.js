import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { UserSettingsModel } from '#src/database/models.js';

describe('user settings API', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  function send(method, accessToken, payload) {
    return testApp.sendRequest({
      method,
      url: '/api/me/settings',
      accessToken,
      payload,
    });
  }

  it('requires login', async () => {
    const read = await send('GET');
    const write = await send('PATCH', undefined, { defaultFormat: 'wav' });

    assert.equal(read.statusCode, 401);
    assert.equal(write.statusCode, 401);
  });

  it('returns the defaults created at sign up', async () => {
    const user = await testApp.registerAndLogin();

    const response = await send('GET', user.accessToken);
    const { settings } = response.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(settings.userId, user.user.id);
    assert.equal(settings.defaultVoiceCode, null);
    assert.equal(settings.defaultFormat, 'mp3');
    assert.equal(settings.defaultLanguage, 'en');
    assert.deepEqual(settings.notifications, {
      generationFinished: true,
      lowCredits: true,
      lowCreditsThreshold: 10,
      weeklySummary: false,
      productUpdates: false,
    });
  });

  it('creates the settings when they are missing', async () => {
    const user = await testApp.createLoggedInUser();

    const read = await send('GET', user.accessToken);
    const other = await testApp.createLoggedInUser();
    const write = await send('PATCH', other.accessToken, {
      notifications: { weeklySummary: true },
    });

    assert.equal(read.statusCode, 200);
    assert.equal(read.body.data.settings.defaultFormat, 'mp3');
    assert.equal(write.statusCode, 200);
    assert.equal(write.body.data.settings.notifications.weeklySummary, true);
    assert.equal(write.body.data.settings.notifications.lowCredits, true);
    assert.equal(
      await UserSettingsModel.countDocuments({ userId: other.user._id }),
      1,
    );
  });

  it('saves only the fields that were sent', async () => {
    const user = await testApp.registerAndLogin();

    await send('PATCH', user.accessToken, {
      defaultFormat: 'wav',
      defaultLanguage: 'de',
    });
    const response = await send('PATCH', user.accessToken, {
      notifications: { lowCredits: false, lowCreditsThreshold: 50 },
    });
    const saved = await send('GET', user.accessToken);
    const { settings } = saved.body.data;

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.message, 'Settings saved');
    assert.equal(settings.defaultFormat, 'wav');
    assert.equal(settings.defaultLanguage, 'de');
    assert.equal(settings.notifications.lowCredits, false);
    assert.equal(settings.notifications.lowCreditsThreshold, 50);
    assert.equal(settings.notifications.generationFinished, true);
    assert.equal(settings.notifications.weeklySummary, false);
  });

  it('accepts an enabled voice, clears it with null and rejects others', async () => {
    const user = await testApp.registerAndLogin();

    const saved = await send('PATCH', user.accessToken, {
      defaultVoiceCode: 'Marin',
    });
    const cleared = await send('PATCH', user.accessToken, {
      defaultVoiceCode: null,
    });
    const disabled = await send('PATCH', user.accessToken, {
      defaultVoiceCode: 'alloy',
    });
    const unknown = await send('PATCH', user.accessToken, {
      defaultVoiceCode: 'nobody',
    });

    assert.equal(saved.statusCode, 200);
    assert.equal(saved.body.data.settings.defaultVoiceCode, 'marin');
    assert.equal(cleared.statusCode, 200);
    assert.equal(cleared.body.data.settings.defaultVoiceCode, null);
    assert.equal(disabled.statusCode, 400);
    assert.equal(
      disabled.body.message,
      'Choose a voice that is available right now',
    );
    assert.equal(unknown.statusCode, 400);
  });

  it('rejects invalid values and an empty body', async () => {
    const user = await testApp.registerAndLogin();

    const responses = await Promise.all(
      [
        { defaultFormat: 'ogg' },
        { defaultLanguage: 'e' },
        { defaultLanguage: 'abcdefghijk' },
        { notifications: { lowCreditsThreshold: -1 } },
        { notifications: { lowCreditsThreshold: 10001 } },
        { notifications: { lowCreditsThreshold: 2.5 } },
        { notifications: { unknownSwitch: true } },
        { notifications: {} },
        {},
      ].map((payload) => send('PATCH', user.accessToken, payload)),
    );

    for (const response of responses) {
      assert.equal(response.statusCode, 400);
    }
  });

  it('accepts the edges of the allowed ranges', async () => {
    const user = await testApp.registerAndLogin();

    const low = await send('PATCH', user.accessToken, {
      defaultLanguage: 'pt-BR',
      notifications: { lowCreditsThreshold: 0 },
    });
    const high = await send('PATCH', user.accessToken, {
      notifications: { lowCreditsThreshold: 10000 },
    });

    assert.equal(low.statusCode, 200);
    assert.equal(low.body.data.settings.defaultLanguage, 'pt-br');
    assert.equal(high.statusCode, 200);
    assert.equal(
      high.body.data.settings.notifications.lowCreditsThreshold,
      10000,
    );
  });

  it('keeps settings per user', async () => {
    const first = await testApp.registerAndLogin();
    const second = await testApp.registerAndLogin();

    await send('PATCH', first.accessToken, { defaultFormat: 'flac' });
    const response = await send('GET', second.accessToken);

    assert.equal(response.body.data.settings.defaultFormat, 'mp3');
  });
});
