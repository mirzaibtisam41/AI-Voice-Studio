import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import {
  AgentModel,
  CreditWalletModel,
  GenerationModel,
  PlatformSettingsModel,
} from '#src/database/models.js';

describe('real-time sessions', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  beforeEach(() => {
    testApp.ai.calls.createRealtimeClientSecret.length = 0;
  });

  async function balanceOf(user) {
    return (await CreditWalletModel.findOne({ userId: user._id })).balance;
  }

  function startSession({ accessToken, payload }) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/realtime/sessions',
      accessToken,
      payload,
    });
  }

  function endSession({ accessToken, sessionId, payload = {} }) {
    return testApp.sendRequest({
      method: 'POST',
      url: `/api/realtime/sessions/${sessionId}/end`,
      accessToken,
      payload,
    });
  }

  async function moveStartBack({ sessionId, seconds }) {
    await GenerationModel.updateOne(
      { _id: sessionId },
      {
        $set: {
          'realtime.startedAt': new Date(Date.now() - seconds * 1000),
        },
      },
    );
  }

  function createAgent({ user, ...fields }) {
    return AgentModel.create({
      userId: user._id,
      name: 'Support Concierge',
      voiceCode: 'cedar',
      instructions: 'You answer questions about AI Voice Studio credits.',
      knowledge: 'Every account gets 50 free credits.',
      greeting: 'Hi! How can I help with your credits?',
      responseStyle: 'concise',
      ...fields,
    });
  }

  it('returns the playground options', async () => {
    const { accessToken } = await testApp.createLoggedInUser();

    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/realtime/options',
      accessToken,
    });

    assert.equal(response.statusCode, 200);

    const options = response.body.data;

    assert.equal(options.models[0].providerModelId, 'gpt-realtime-2.1-mini');
    assert.equal(options.models[0].creditsPerMinute, 3);
    assert.deepEqual(
      options.voices.map((voice) => voice.code),
      ['marin', 'cedar'],
    );
    assert.equal(options.maxMinutes, 10);
    assert.deepEqual(options.rates, { realtime: 3, voiceAgent: 3 });
    assert.deepEqual(options.responseStyles, [
      'concise',
      'balanced',
      'detailed',
    ]);
  });

  it('holds the full allowed time and returns a client secret', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    const response = await startSession({
      accessToken,
      payload: {
        voiceCode: 'Marin',
        instructions: 'You are a patient language tutor.',
        responseStyle: 'detailed',
      },
    });

    assert.equal(response.statusCode, 201);

    const data = response.body.data;

    assert.equal(data.clientSecret, 'ek_test_secret');
    assert.equal(data.model, 'gpt-realtime-2.1-mini');
    assert.equal(data.voice, 'marin');
    assert.equal(data.allowedMinutes, 10);
    assert.equal(data.creditsPerMinute, 3);
    assert.equal(data.balance, 20);
    assert.ok(new Date(data.expiresAt) > new Date());
    assert.equal(await balanceOf(user), 20);

    const [call] = testApp.ai.calls.createRealtimeClientSecret;

    assert.equal(call.model, 'gpt-realtime-2.1-mini');
    assert.equal(call.voice, 'marin');
    assert.match(call.instructions, /patient language tutor/);
    assert.match(call.instructions, /thorough answers/);

    const generation = await GenerationModel.findById(data.sessionId);

    assert.equal(generation.capability, 'realtime');
    assert.equal(generation.status, 'processing');
    assert.equal(generation.creditsHeld, 30);
    assert.equal(generation.realtime.allowedMinutes, 10);
    assert.equal(
      generation.realtime.expiresAt - generation.realtime.startedAt,
      12 * 60 * 1000,
    );
    assert.equal(generation.input.voiceCode, 'marin');
    assert.equal(generation.input.style, 'detailed');
  });

  it('uses default instructions and limits the time to what the balance covers', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser({
      balance: 7,
    });

    const response = await startSession({
      accessToken,
      payload: { voiceCode: 'cedar' },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.allowedMinutes, 2);
    assert.equal(response.body.data.balance, 1);
    assert.equal(await balanceOf(user), 1);
    assert.match(
      testApp.ai.calls.createRealtimeClientSecret[0].instructions,
      /friendly, helpful voice assistant/,
    );
  });

  it('follows the admin maximum minutes', async () => {
    await PlatformSettingsModel.updateMany({}, { realtimeMaxMinutes: 3 });

    try {
      const { accessToken } = await testApp.createLoggedInUser();

      const response = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });

      assert.equal(response.body.data.allowedMinutes, 3);
      assert.equal(response.body.data.balance, 41);
    } finally {
      await PlatformSettingsModel.updateMany({}, { realtimeMaxMinutes: 10 });
    }
  });

  it('returns 402 when the balance does not cover one minute', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser({
      balance: 2,
    });

    const response = await startSession({
      accessToken,
      payload: { voiceCode: 'marin' },
    });

    assert.equal(response.statusCode, 402);
    assert.equal(response.body.code, 'INSUFFICIENT_CREDITS');
    assert.equal(await balanceOf(user), 2);
    assert.equal(testApp.ai.calls.createRealtimeClientSecret.length, 0);
    assert.equal(await GenerationModel.countDocuments({ userId: user._id }), 0);
  });

  it('rejects a missing, disabled or unknown voice and invalid input', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    for (const payload of [
      {},
      { voiceCode: 'alloy' },
      { voiceCode: 'nobody' },
      { voiceCode: 'marin', responseStyle: 'chatty' },
      { voiceCode: 'marin', instructions: 'x'.repeat(2001) },
      { voiceCode: 'marin', agentId: 'abc' },
    ]) {
      const response = await startSession({ accessToken, payload });

      assert.equal(response.statusCode, 400, JSON.stringify(payload));
    }

    assert.equal(await balanceOf(user), 50);
  });

  it('refunds the hold when the provider cannot create the session', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    testApp.ai.failNext('provider_unavailable');

    const response = await startSession({
      accessToken,
      payload: { voiceCode: 'marin' },
    });

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /30 credits were refunded/);
    assert.equal(await balanceOf(user), 50);

    const generation = await GenerationModel.findOne({ userId: user._id });

    assert.equal(generation.status, 'failed');
    assert.equal(generation.creditsRefunded, 30);

    const ended = await endSession({
      accessToken,
      sessionId: generation.id,
    });

    assert.equal(ended.statusCode, 200);
    assert.equal(ended.body.data.creditsCharged, 0);
    assert.equal(ended.body.data.balance, 50);
  });

  describe('ending a session', () => {
    it('charges the started minutes and refunds the rest', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const started = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });
      const sessionId = started.body.data.sessionId;

      await moveStartBack({ sessionId, seconds: 61 });

      const response = await endSession({
        accessToken,
        sessionId,
        payload: {
          transcript: [
            { role: 'user', text: 'Hello?', at: 1 },
            { role: 'assistant', text: ' Hi there! ', at: 2.5 },
          ],
        },
      });

      assert.equal(response.statusCode, 200);

      const data = response.body.data;

      assert.equal(data.creditsCharged, 6);
      assert.equal(data.creditsRefunded, 24);
      assert.equal(data.balance, 44);
      assert.equal(await balanceOf(user), 44);
      assert.equal(data.session.status, 'completed');
      assert.ok(data.session.durationSeconds >= 61);
      assert.ok(data.session.durationSeconds <= 63);
      assert.equal(data.session.turnCount, 2);
      assert.deepEqual(data.session.transcript, [
        { role: 'user', text: 'Hello?', at: 1 },
        { role: 'assistant', text: 'Hi there!', at: 2.5 },
      ]);
      assert.ok(data.session.endedAt);
    });

    it('is idempotent', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const started = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });
      const sessionId = started.body.data.sessionId;

      await moveStartBack({ sessionId, seconds: 150 });

      const first = await endSession({ accessToken, sessionId });

      await moveStartBack({ sessionId, seconds: 500 });

      const second = await endSession({
        accessToken,
        sessionId,
        payload: { transcript: [{ role: 'user', text: 'Late line' }] },
      });

      assert.equal(first.body.data.creditsCharged, 9);
      assert.equal(second.statusCode, 200);
      assert.equal(second.body.data.creditsCharged, 9);
      assert.equal(second.body.data.creditsRefunded, 21);
      assert.equal(second.body.data.balance, 41);
      assert.equal(second.body.data.session.turnCount, 0);
      assert.equal(await balanceOf(user), 41);
    });

    it('charges at least one minute', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const started = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });

      const response = await endSession({
        accessToken,
        sessionId: started.body.data.sessionId,
      });

      assert.equal(response.body.data.creditsCharged, 3);
      assert.equal(await balanceOf(user), 47);
    });

    it('never charges more than the allowed minutes', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser({
        balance: 10,
      });
      const started = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });
      const sessionId = started.body.data.sessionId;

      assert.equal(started.body.data.allowedMinutes, 3);

      await moveStartBack({ sessionId, seconds: 30 * 60 });

      const response = await endSession({ accessToken, sessionId });

      assert.equal(response.body.data.creditsCharged, 9);
      assert.equal(response.body.data.creditsRefunded, 0);
      assert.equal(response.body.data.session.durationSeconds, 180);
      assert.equal(await balanceOf(user), 1);
    });

    it('validates the transcript', async () => {
      const { accessToken } = await testApp.createLoggedInUser();
      const started = await startSession({
        accessToken,
        payload: { voiceCode: 'marin' },
      });
      const sessionId = started.body.data.sessionId;

      for (const payload of [
        { transcript: [{ role: 'system', text: 'x' }] },
        { transcript: [{ role: 'user', text: '' }] },
        { transcript: [{ role: 'user', text: 'x'.repeat(4001) }] },
        {
          transcript: Array.from({ length: 501 }, () => ({
            role: 'user',
            text: 'x',
          })),
        },
      ]) {
        const response = await endSession({ accessToken, sessionId, payload });

        assert.equal(response.statusCode, 400);
      }

      const generation = await GenerationModel.findById(sessionId);

      assert.equal(generation.status, 'processing');
    });

    it('only ends your own sessions', async () => {
      const owner = await testApp.createLoggedInUser();
      const other = await testApp.createLoggedInUser();
      const started = await startSession({
        accessToken: owner.accessToken,
        payload: { voiceCode: 'marin' },
      });

      const response = await endSession({
        accessToken: other.accessToken,
        sessionId: started.body.data.sessionId,
      });

      assert.equal(response.statusCode, 404);

      const generation = await GenerationModel.findById(
        started.body.data.sessionId,
      );

      assert.equal(generation.status, 'processing');
    });
  });

  describe('voice agent sessions', () => {
    it('uses the agent voice and builds its instructions', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const agent = await createAgent({ user });

      const response = await startSession({
        accessToken,
        payload: { agentId: agent.id, voiceCode: 'marin' },
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.body.data.voice, 'cedar');

      const [call] = testApp.ai.calls.createRealtimeClientSecret;

      assert.equal(call.voice, 'cedar');
      assert.match(call.instructions, /Your name is Support Concierge/);
      assert.match(call.instructions, /AI Voice Studio credits/);
      assert.match(call.instructions, /50 free credits/);
      assert.match(call.instructions, /one to three sentences/);
      assert.match(
        call.instructions,
        /Start the conversation by saying: "Hi! How can I help with your credits\?"/,
      );

      const generation = await GenerationModel.findById(
        response.body.data.sessionId,
      );

      assert.equal(generation.capability, 'voice_agent');
      assert.equal(generation.input.agentId.toString(), agent.id);
    });

    it('does not start sessions for agents of other users', async () => {
      const owner = await testApp.createLoggedInUser();
      const other = await testApp.createLoggedInUser();
      const agent = await createAgent({ user: owner.user });

      const response = await startSession({
        accessToken: other.accessToken,
        payload: { agentId: agent.id },
      });

      assert.equal(response.statusCode, 404);
      assert.equal(await balanceOf(other.user), 50);
    });

    it('refuses an agent whose voice was disabled', async () => {
      const { user, accessToken } = await testApp.createLoggedInUser();
      const agent = await createAgent({ user, voiceCode: 'alloy' });

      const response = await startSession({
        accessToken,
        payload: { agentId: agent.id },
      });

      assert.equal(response.statusCode, 400);
      assert.equal(await balanceOf(user), 50);
      assert.equal(testApp.ai.calls.createRealtimeClientSecret.length, 0);
    });
  });

  describe('history', () => {
    let owner;
    let other;
    let agent;
    let playgroundId;
    let agentSessionId;

    before(async () => {
      owner = await testApp.createLoggedInUser({ balance: 200 });
      other = await testApp.createLoggedInUser();
      agent = await createAgent({ user: owner.user });

      playgroundId = (
        await startSession({
          accessToken: owner.accessToken,
          payload: { voiceCode: 'marin' },
        })
      ).body.data.sessionId;
      agentSessionId = (
        await startSession({
          accessToken: owner.accessToken,
          payload: { agentId: agent.id },
        })
      ).body.data.sessionId;

      await endSession({
        accessToken: owner.accessToken,
        sessionId: playgroundId,
        payload: { transcript: [{ role: 'user', text: 'Hi' }] },
      });
    });

    it('lists your sessions newest first and filters by agent', async () => {
      const all = await testApp.sendRequest({
        method: 'GET',
        url: '/api/realtime/sessions',
        accessToken: owner.accessToken,
      });

      assert.equal(all.statusCode, 200);
      assert.deepEqual(
        all.body.data.sessions.map((session) => session.id),
        [agentSessionId, playgroundId],
      );
      assert.equal(all.body.data.sessions[0].kind, 'agent');
      assert.equal(all.body.data.sessions[1].kind, 'playground');
      assert.equal(all.body.data.sessions[1].turnCount, 1);
      assert.equal(all.body.data.sessions[1].transcript, undefined);
      assert.equal(all.body.meta.total, 2);

      const byAgent = await testApp.sendRequest({
        method: 'GET',
        url: `/api/realtime/sessions?agentId=${agent.id}`,
        accessToken: owner.accessToken,
      });

      assert.deepEqual(
        byAgent.body.data.sessions.map((session) => session.id),
        [agentSessionId],
      );

      const otherList = await testApp.sendRequest({
        method: 'GET',
        url: '/api/realtime/sessions',
        accessToken: other.accessToken,
      });

      assert.equal(otherList.body.data.sessions.length, 0);
    });

    it('returns one session with its transcript', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: `/api/realtime/sessions/${playgroundId}`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body.data.session.transcript, [
        { role: 'user', text: 'Hi', at: null },
      ]);

      const hidden = await testApp.sendRequest({
        method: 'GET',
        url: `/api/realtime/sessions/${playgroundId}`,
        accessToken: other.accessToken,
      });

      assert.equal(hidden.statusCode, 404);
    });
  });
});
