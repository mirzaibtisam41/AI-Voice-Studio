import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTestApp } from '../helpers/test-app.js';
import { AgentModel } from '#src/database/models.js';
import { AGENTS_PER_USER_MAX } from '#src/modules/agents/agent.constants.js';

const VALID_AGENT = {
  name: 'Booking Assistant',
  description: 'Books demos with the sales team.',
  voiceCode: 'marin',
  instructions:
    'You help visitors book a demo. Ask for their name, email and time.',
  responseStyle: 'concise',
  tools: ['book_meeting', 'help_center'],
  knowledge: 'Demos run Monday to Friday, 9am to 5pm.',
};

describe('agents', () => {
  let testApp;

  before(async () => {
    testApp = await buildTestApp();
    await testApp.seedCatalog();
  });

  after(async () => {
    await testApp.close();
  });

  function createAgent({ accessToken, payload = VALID_AGENT }) {
    return testApp.sendRequest({
      method: 'POST',
      url: '/api/agents',
      accessToken,
      payload,
    });
  }

  it('requires a login', async () => {
    const response = await testApp.sendRequest({
      method: 'GET',
      url: '/api/agents',
    });

    assert.equal(response.statusCode, 401);
  });

  it('creates an agent with a default greeting', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    const response = await createAgent({ accessToken });

    assert.equal(response.statusCode, 201);

    const { agent } = response.body.data;

    assert.ok(agent.id);
    assert.equal(agent._id, undefined);
    assert.equal(agent.userId, user.id);
    assert.equal(agent.name, 'Booking Assistant');
    assert.equal(
      agent.greeting,
      "Hi! I'm Booking Assistant. How can I help today?",
    );
    assert.equal(agent.status, 'draft');
    assert.equal(agent.responseStyle, 'concise');
    assert.deepEqual(agent.tools, ['book_meeting', 'help_center']);
  });

  it('trims fields, keeps a custom greeting and stores empty text as null', async () => {
    const { accessToken } = await testApp.createLoggedInUser();

    const response = await createAgent({
      accessToken,
      payload: {
        name: '  Guide  ',
        voiceCode: 'CEDAR',
        instructions: `  ${'Walk new users through their first project.'}  `,
        greeting: '  Welcome aboard!  ',
        description: '   ',
        status: 'live',
      },
    });

    assert.equal(response.statusCode, 201);

    const { agent } = response.body.data;

    assert.equal(agent.name, 'Guide');
    assert.equal(agent.voiceCode, 'cedar');
    assert.equal(agent.greeting, 'Welcome aboard!');
    assert.equal(agent.description, null);
    assert.equal(agent.knowledge, null);
    assert.equal(agent.status, 'live');
    assert.equal(agent.responseStyle, 'balanced');
  });

  it('validates the agent fields', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    for (const payload of [
      { ...VALID_AGENT, name: undefined },
      { ...VALID_AGENT, name: '   ' },
      { ...VALID_AGENT, name: 'x'.repeat(81) },
      { ...VALID_AGENT, instructions: 'Too short' },
      { ...VALID_AGENT, instructions: `   short words ${' '.repeat(10)}` },
      { ...VALID_AGENT, voiceCode: 'alloy' },
      { ...VALID_AGENT, voiceCode: 'ghost' },
      { ...VALID_AGENT, voiceCode: 'has space' },
      { ...VALID_AGENT, responseStyle: 'chatty' },
      { ...VALID_AGENT, tools: ['launch_rocket'] },
      { ...VALID_AGENT, tools: ['help_center', 'help_center'] },
      { ...VALID_AGENT, status: 'archived' },
      { ...VALID_AGENT, knowledge: 'x'.repeat(8001) },
    ]) {
      const response = await createAgent({ accessToken, payload });

      assert.equal(
        response.statusCode,
        400,
        JSON.stringify(payload).slice(0, 80),
      );
    }

    assert.equal(await AgentModel.countDocuments({ userId: user._id }), 0);
  });

  it('limits the number of agents per user', async () => {
    const { user, accessToken } = await testApp.createLoggedInUser();

    await AgentModel.insertMany(
      Array.from({ length: AGENTS_PER_USER_MAX }, (_value, index) => ({
        userId: user._id,
        name: `Agent ${index}`,
        voiceCode: 'marin',
        instructions: VALID_AGENT.instructions,
      })),
    );

    const response = await createAgent({ accessToken });

    assert.equal(response.statusCode, 409);

    const [first] = await AgentModel.find({ userId: user._id }).limit(1);
    const duplicate = await testApp.sendRequest({
      method: 'POST',
      url: `/api/agents/${first.id}/duplicate`,
      accessToken,
    });

    assert.equal(duplicate.statusCode, 409);
  });

  describe('managing an agent', () => {
    let owner;
    let other;
    let agent;

    before(async () => {
      owner = await testApp.createLoggedInUser();
      other = await testApp.createLoggedInUser();
      agent = (await createAgent({ accessToken: owner.accessToken })).body.data
        .agent;
      await createAgent({
        accessToken: owner.accessToken,
        payload: { ...VALID_AGENT, name: 'Second', status: 'live' },
      });
      await createAgent({ accessToken: other.accessToken });
    });

    it('lists only your agents, newest first, with a status filter', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: '/api/agents',
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.deepEqual(
        response.body.data.agents.map((item) => item.name),
        ['Second', 'Booking Assistant'],
      );
      assert.equal(response.body.meta.total, 2);

      const live = await testApp.sendRequest({
        method: 'GET',
        url: '/api/agents?status=live',
        accessToken: owner.accessToken,
      });

      assert.deepEqual(
        live.body.data.agents.map((item) => item.name),
        ['Second'],
      );
    });

    it('returns one agent', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: `/api/agents/${agent.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.agent.id, agent.id);
    });

    it('updates fields and resets an empty greeting', async () => {
      const response = await testApp.sendRequest({
        method: 'PATCH',
        url: `/api/agents/${agent.id}`,
        accessToken: owner.accessToken,
        payload: {
          name: 'Demo Booker',
          voiceCode: 'cedar',
          greeting: '',
          tools: [],
        },
      });

      assert.equal(response.statusCode, 200);

      const updated = response.body.data.agent;

      assert.equal(updated.name, 'Demo Booker');
      assert.equal(updated.voiceCode, 'cedar');
      assert.equal(
        updated.greeting,
        "Hi! I'm Demo Booker. How can I help today?",
      );
      assert.deepEqual(updated.tools, []);
      assert.equal(updated.instructions, VALID_AGENT.instructions);
    });

    it('rejects invalid updates', async () => {
      for (const payload of [
        {},
        { voiceCode: 'alloy' },
        { instructions: 'short' },
        { name: '' },
      ]) {
        const response = await testApp.sendRequest({
          method: 'PATCH',
          url: `/api/agents/${agent.id}`,
          accessToken: owner.accessToken,
          payload,
        });

        assert.equal(response.statusCode, 400, JSON.stringify(payload));
      }
    });

    it('changes the status', async () => {
      const response = await testApp.sendRequest({
        method: 'PATCH',
        url: `/api/agents/${agent.id}/status`,
        accessToken: owner.accessToken,
        payload: { status: 'paused' },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.body.data.agent.status, 'paused');

      const invalid = await testApp.sendRequest({
        method: 'PATCH',
        url: `/api/agents/${agent.id}/status`,
        accessToken: owner.accessToken,
        payload: { status: 'deleted' },
      });

      assert.equal(invalid.statusCode, 400);
    });

    it('duplicates an agent as a draft copy', async () => {
      const response = await testApp.sendRequest({
        method: 'POST',
        url: `/api/agents/${agent.id}/duplicate`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 201);

      const copy = response.body.data.agent;

      assert.notEqual(copy.id, agent.id);
      assert.equal(copy.name, 'Demo Booker (copy)');
      assert.equal(copy.status, 'draft');
      assert.equal(copy.voiceCode, 'cedar');
      assert.equal(copy.instructions, VALID_AGENT.instructions);
      assert.equal(copy.knowledge, VALID_AGENT.knowledge);
    });

    it('keeps a long name within the limit when duplicating', async () => {
      const long = await AgentModel.create({
        userId: owner.user._id,
        name: 'L'.repeat(80),
        voiceCode: 'marin',
        instructions: VALID_AGENT.instructions,
      });

      const response = await testApp.sendRequest({
        method: 'POST',
        url: `/api/agents/${long.id}/duplicate`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 201);
      assert.equal(response.body.data.agent.name.length, 80);
      assert.ok(response.body.data.agent.name.endsWith(' (copy)'));
    });

    it('hides agents of other users', async () => {
      for (const [method, url, payload] of [
        ['GET', `/api/agents/${agent.id}`],
        ['PATCH', `/api/agents/${agent.id}`, { name: 'Mine now' }],
        ['PATCH', `/api/agents/${agent.id}/status`, { status: 'live' }],
        ['POST', `/api/agents/${agent.id}/duplicate`],
        ['DELETE', `/api/agents/${agent.id}`],
      ]) {
        const response = await testApp.sendRequest({
          method,
          url,
          payload,
          accessToken: other.accessToken,
        });

        assert.equal(response.statusCode, 404, `${method} ${url}`);
      }

      const stillThere = await AgentModel.findById(agent.id);

      assert.equal(stillThere.name, 'Demo Booker');
    });

    it('rejects an invalid id', async () => {
      const response = await testApp.sendRequest({
        method: 'GET',
        url: '/api/agents/not-an-id',
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 400);
    });

    it('deletes an agent', async () => {
      const response = await testApp.sendRequest({
        method: 'DELETE',
        url: `/api/agents/${agent.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(response.statusCode, 200);

      const again = await testApp.sendRequest({
        method: 'GET',
        url: `/api/agents/${agent.id}`,
        accessToken: owner.accessToken,
      });

      assert.equal(again.statusCode, 404);
    });
  });
});
