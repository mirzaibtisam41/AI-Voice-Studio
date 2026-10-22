import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AuditLogModel,
  AuthSessionModel,
  UserModel,
} from '#src/database/models.js';

const UNKNOWN_ID = '000000000000000000000000';

describe('admin user status and role', () => {
  let testApp;
  let admin;

  before(async () => {
    testApp = await buildTestApp();
    admin = await testApp.registerAndLoginAsAdmin();
  });

  after(async () => {
    await testApp.close();
  });

  function send(url, payload, accessToken = admin.accessToken) {
    return testApp.sendRequest({ method: 'PATCH', url, payload, accessToken });
  }

  function changeStatus(userId, status) {
    return send(`/api/admin/users/${userId}/status`, { status });
  }

  function changeRole(userId, role) {
    return send(`/api/admin/users/${userId}/role`, { role });
  }

  describe('PATCH /api/admin/users/:userId/status', () => {
    it('suspends a user, ends all their sessions and records an audit log', async () => {
      const user = await testApp.registerAndLogin();
      const secondLogin = await testApp.loginUser({ email: user.email });

      const response = await changeStatus(user.user.id, 'suspended');

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.user.status, 'suspended');
      assert.equal(response.body.message, 'User status changed to suspended');

      const active = await AuthSessionModel.countDocuments({
        userId: user.user.id,
        revokedAt: null,
      });
      assert.equal(active, 0);

      const me = await testApp.sendRequest({
        method: 'GET',
        url: '/api/auth/me',
        accessToken: secondLogin.accessToken,
      });
      assert.equal(me.statusCode, 401);

      const auditLog = await AuditLogModel.findOne({
        action: 'user.status_changed',
        targetId: user.user.id,
      });
      assert.equal(auditLog.actorEmail, admin.email);
      assert.equal(String(auditLog.actorId), admin.user.id);
      assert.equal(auditLog.targetType, 'user');
      assert.equal(auditLog.targetLabel, user.email);
      assert.deepEqual(auditLog.details, {
        before: { status: 'active' },
        after: { status: 'suspended' },
      });
    });

    it('does not bring old sessions back after unsuspending', async () => {
      const user = await testApp.registerAndLogin();
      await changeStatus(user.user.id, 'suspended');

      const response = await changeStatus(user.user.id, 'active');
      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.user.status, 'active');

      const refresh = await testApp.sendRequest({
        method: 'POST',
        url: '/api/auth/refresh',
        refreshToken: user.refreshToken,
      });
      assert.equal(refresh.statusCode, 401);

      const login = await testApp.loginUser({ email: user.email });
      assert.ok(login.accessToken);
    });

    it('succeeds when the status is already the same', async () => {
      const user = await testApp.registerAndLogin();

      const response = await changeStatus(user.user.id, 'active');

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.user.status, 'active');
    });

    it('does not let an admin change their own status', async () => {
      const response = await changeStatus(admin.user.id, 'suspended');
      const stored = await UserModel.findById(admin.user.id);

      assert.equal(response.statusCode, 400);
      assert.equal(
        response.body.message,
        'You cannot change the status of your own account',
      );
      assert.equal(stored.status, 'active');
    });

    it('returns 404 for an unknown user and writes no audit log', async () => {
      const logsBefore = await AuditLogModel.countDocuments();

      const response = await changeStatus(UNKNOWN_ID, 'suspended');

      assert.equal(response.statusCode, 404);
      assert.equal(response.body.message, 'User not found');
      assert.equal(await AuditLogModel.countDocuments(), logsBefore);
    });

    it('rejects an unknown status and deactivated', async () => {
      const user = await testApp.registerAndLogin();

      const unknown = await changeStatus(user.user.id, 'deleted');
      const deactivated = await changeStatus(user.user.id, 'deactivated');

      assert.equal(unknown.statusCode, 400);
      assert.equal(deactivated.statusCode, 400);
    });

    it('is only for admins', async () => {
      const user = await testApp.registerAndLogin();
      const other = await testApp.registerAndLogin();

      const response = await send(
        `/api/admin/users/${other.user.id}/status`,
        { status: 'suspended' },
        user.accessToken,
      );

      assert.equal(response.statusCode, 403);
    });
  });

  describe('PATCH /api/admin/users/:userId/role', () => {
    it('makes a user an admin and back with audit logs', async () => {
      const user = await testApp.registerAndLogin();

      const promoted = await changeRole(user.user.id, 'admin');
      assert.equal(promoted.statusCode, 200);
      assert.equal(promoted.body.data.user.role, 'admin');
      assert.equal(promoted.body.message, 'User role changed to admin');

      const adminPage = await testApp.sendRequest({
        method: 'GET',
        url: '/api/admin/users',
        accessToken: user.accessToken,
      });
      assert.equal(adminPage.statusCode, 200);

      const demoted = await changeRole(user.user.id, 'user');
      assert.equal(demoted.body.data.user.role, 'user');

      const blocked = await testApp.sendRequest({
        method: 'GET',
        url: '/api/admin/users',
        accessToken: user.accessToken,
      });
      assert.equal(blocked.statusCode, 403);

      const auditLogs = await AuditLogModel.find({
        action: 'user.role_changed',
        targetId: user.user.id,
      }).sort({ createdAt: 1, _id: 1 });
      assert.deepEqual(
        auditLogs.map((auditLog) => auditLog.details),
        [
          { before: { role: 'user' }, after: { role: 'admin' } },
          { before: { role: 'admin' }, after: { role: 'user' } },
        ],
      );
    });

    it('does not let an admin change their own role', async () => {
      const response = await changeRole(admin.user.id, 'user');

      assert.equal(response.statusCode, 400);
      assert.equal(
        response.body.message,
        'You cannot change the role of your own account',
      );
    });

    it('returns 404 for an unknown user', async () => {
      const response = await changeRole(UNKNOWN_ID, 'admin');

      assert.equal(response.statusCode, 404);
    });

    it('rejects an unknown role and a bad id', async () => {
      const user = await testApp.registerAndLogin();

      const role = await changeRole(user.user.id, 'owner');
      const id = await changeRole('not-an-id', 'admin');

      assert.equal(role.statusCode, 400);
      assert.equal(id.statusCode, 400);
    });
  });
});
