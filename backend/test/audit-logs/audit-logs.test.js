import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AuditLogModel } from '#src/database/models.js';

describe('admin audit logs', () => {
  let testApp;
  let admin;
  let otherAdmin;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.createLoggedInUser({
      role: 'admin',
      email: 'boss@example.com',
    });
    otherAdmin = await testApp.createLoggedInUser({
      role: 'admin',
      email: 'ops@example.com',
    });

    await AuditLogModel.create([
      {
        actorId: admin.user._id,
        actorEmail: 'boss@example.com',
        action: 'provider.created',
        targetType: 'provider',
        targetLabel: 'OpenAI',
        createdAt: new Date('2026-10-01T10:00:00Z'),
      },
      {
        actorId: otherAdmin.user._id,
        actorEmail: 'ops@example.com',
        action: 'model.status_changed',
        targetType: 'model',
        targetLabel: 'GPT Realtime',
        createdAt: new Date('2026-10-10T23:30:00Z'),
      },
      {
        actorId: admin.user._id,
        actorEmail: 'boss@example.com',
        action: 'settings.updated',
        targetType: 'settings',
        targetLabel: 'Platform settings',
        createdAt: new Date('2026-10-20T08:00:00Z'),
      },
      {
        actorEmail: 'system',
        action: 'generation.refunded',
        targetType: 'generation',
        targetLabel: 'Refund of 6 credits',
        createdAt: new Date('2026-10-21T08:00:00Z'),
      },
    ]);
  });

  after(async () => {
    await testApp.close();
  });

  function list(query = '', accessToken = admin.accessToken) {
    return testApp.sendRequest({
      method: 'GET',
      url: `/api/admin/audit-logs${query}`,
      accessToken,
    });
  }

  function labels(response) {
    return response.body.data.auditLogs.map((log) => log.targetLabel);
  }

  it('only lets admins read the audit log', async () => {
    const user = await testApp.createLoggedInUser();

    const response = await list('', user.accessToken);

    assert.equal(response.statusCode, 403);
  });

  it('lists newest first with pagination', async () => {
    const response = await list('?limit=2');

    assert.equal(response.statusCode, 200);
    assert.deepEqual(labels(response), [
      'Refund of 6 credits',
      'Platform settings',
    ]);
    assert.deepEqual(response.body.meta, {
      page: 1,
      limit: 2,
      total: 4,
      totalPages: 2,
    });

    const second = await list('?limit=2&page=2');

    assert.deepEqual(labels(second), ['GPT Realtime', 'OpenAI']);
    assert.equal(typeof second.body.data.auditLogs[0].id, 'string');
  });

  it('searches action, target label and actor email', async () => {
    assert.deepEqual(labels(await list('?search=realtime')), ['GPT Realtime']);
    assert.deepEqual(labels(await list('?search=ops%40example')), [
      'GPT Realtime',
    ]);
    assert.deepEqual(labels(await list('?search=provider.')), ['OpenAI']);
    assert.deepEqual(labels(await list('?search=.*')), []);
  });

  it('filters by action, actor and dates', async () => {
    assert.deepEqual(labels(await list('?action=settings.updated')), [
      'Platform settings',
    ]);
    assert.deepEqual(labels(await list(`?actorId=${admin.user._id}`)), [
      'Platform settings',
      'OpenAI',
    ]);
    assert.deepEqual(labels(await list('?from=2026-10-10&to=2026-10-20')), [
      'Platform settings',
      'GPT Realtime',
    ]);
    assert.deepEqual(labels(await list('?to=2026-10-09')), ['OpenAI']);
  });

  it('rejects bad filters', async () => {
    assert.equal((await list('?action=made.up')).statusCode, 400);
    assert.equal((await list('?actorId=nope')).statusCode, 400);
    assert.equal((await list('?from=yesterday')).statusCode, 400);
    assert.equal(
      (await list('?from=2026-10-20&to=2026-10-01')).statusCode,
      400,
    );
    assert.equal((await list('?limit=101')).statusCode, 400);
  });

  it('records admin actions made through the API', async () => {
    await testApp.sendRequest({
      method: 'POST',
      url: '/api/admin/providers',
      accessToken: otherAdmin.accessToken,
      payload: { code: 'audited', name: 'Audited provider' },
    });

    const response = await list('?search=Audited');

    assert.equal(response.body.data.auditLogs.length, 1);
    assert.equal(response.body.data.auditLogs[0].actorEmail, 'ops@example.com');
    assert.equal(response.body.data.auditLogs[0].action, 'provider.created');
  });
});
