import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';

describe('checkUserIsAdminHook', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
  });

  after(async () => {
    await testApp.close();
  });

  function ping(accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: '/api/test-admin/ping',
      accessToken,
    });
  }

  it('lets an admin in', async () => {
    const admin = await testApp.registerAndLoginAsAdmin();

    const response = await ping(admin.accessToken);

    assert.equal(response.statusCode, 200);
  });

  it('blocks a normal user', async () => {
    const user = await testApp.registerAndLogin();

    const response = await ping(user.accessToken);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, 'Admin access required');
  });

  it('asks an anonymous visitor to log in', async () => {
    const response = await ping();

    assert.equal(response.statusCode, 401);
  });
});
