import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import OpenAI from 'openai';
import {
  mapRealtimeErrorIntegration,
  synthesizeRealtimeSpeechIntegration,
  synthesizeSpeechIntegration,
} from '#src/integrations/index.js';
import { ProviderError } from '#src/utils/index.js';

function apiError(status, code) {
  return OpenAI.APIError.generate(
    status,
    { error: { code, message: 'provider message', type: 'test' } },
    'provider message',
    new Headers(),
  );
}

function createFakeConnection({ onSend = () => {} } = {}) {
  const connection = new EventEmitter();

  connection.socket = new EventEmitter();
  connection.sent = [];
  connection.closed = false;
  connection.send = (event) => {
    connection.sent.push(event);
    onSend({ connection, event });
  };
  connection.close = () => {
    connection.closed = true;
  };

  return connection;
}

function respondWithAudio({ chunks, status = 'completed', statusDetails }) {
  return ({ connection, event }) => {
    if (event.type !== 'response.create') return;

    setImmediate(() => {
      for (const chunk of chunks) {
        connection.emit('response.output_audio.delta', {
          type: 'response.output_audio.delta',
          delta: Buffer.from(chunk).toString('base64'),
        });
      }

      connection.emit('response.done', {
        type: 'response.done',
        response: { status, status_details: statusDetails },
      });
    });
  };
}

function runRealtime({ connection, timeoutMs, instructions = 'Sound calm.' }) {
  const promise = synthesizeRealtimeSpeechIntegration({
    client: {},
    model: 'gpt-realtime-2.1-mini',
    voice: 'marin',
    text: 'Hello there. What time is it?',
    instructions,
    timeoutMs,
    openConnection: () => connection,
  });

  setImmediate(() => connection.socket.emit('open'));

  return promise;
}

async function assertProviderError(promise, category) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof ProviderError);
    assert.equal(error.category, category);

    return true;
  });
}

describe('synthesizeSpeechIntegration', () => {
  describe('audio speech models', () => {
    it('asks for raw pcm and returns it as a buffer', async () => {
      const requests = [];
      const client = {
        audio: {
          speech: {
            async create(request) {
              requests.push(request);

              return {
                arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
              };
            },
          },
        },
      };

      const result = await synthesizeSpeechIntegration({
        client,
        model: 'gpt-4o-mini-tts',
        voice: 'marin',
        text: 'Hello',
        instructions: ' Sound calm. ',
      });

      assert.deepEqual(result.pcm, Buffer.from([1, 2, 3, 4]));
      assert.equal(result.sampleRate, 24000);
      assert.deepEqual(requests[0], {
        model: 'gpt-4o-mini-tts',
        voice: 'marin',
        input: 'Hello',
        instructions: 'Sound calm.',
        response_format: 'pcm',
      });
    });

    it('maps provider errors to a category', async () => {
      const client = {
        audio: {
          speech: {
            async create() {
              throw apiError(429, 'insufficient_quota');
            },
          },
        },
      };

      await assertProviderError(
        synthesizeSpeechIntegration({
          client,
          model: 'gpt-4o-mini-tts',
          voice: 'marin',
          text: 'Hello',
        }),
        'quota_exceeded',
      );
    });
  });

  describe('realtime models', () => {
    it('configures an audio only session and collects the audio', async () => {
      const connection = createFakeConnection({
        onSend: respondWithAudio({
          chunks: [
            [1, 2],
            [3, 4, 5, 6],
          ],
        }),
      });

      const result = await runRealtime({ connection });

      assert.deepEqual(result.pcm, Buffer.from([1, 2, 3, 4, 5, 6]));
      assert.equal(result.sampleRate, 24000);
      assert.equal(connection.closed, true);
      assert.deepEqual(
        connection.sent.map((event) => event.type),
        ['session.update', 'conversation.item.create', 'response.create'],
      );

      const { session } = connection.sent[0];

      assert.equal(session.type, 'realtime');
      assert.deepEqual(session.output_modalities, ['audio']);
      assert.deepEqual(session.audio.output.format, {
        type: 'audio/pcm',
        rate: 24000,
      });
      assert.equal(session.audio.output.voice, 'marin');
      assert.match(session.instructions, /word for word/);
      assert.match(session.instructions, /Sound calm\./);
      assert.deepEqual(connection.sent[1].item, {
        type: 'message',
        role: 'user',
        content: [
          { type: 'input_text', text: 'Hello there. What time is it?' },
        ],
      });
    });

    it('goes through the realtime path when the model id says so', async () => {
      const connection = createFakeConnection({
        onSend: respondWithAudio({ chunks: [[9, 9]] }),
      });
      const promise = synthesizeSpeechIntegration({
        client: {},
        model: 'gpt-realtime-2.1-mini',
        voice: 'cedar',
        text: 'Hi',
        openConnection: () => connection,
      });

      setImmediate(() => connection.socket.emit('open'));

      assert.deepEqual((await promise).pcm, Buffer.from([9, 9]));
    });

    it('maps an error event from the server', async () => {
      const connection = createFakeConnection({
        onSend: ({ event }) => {
          if (event.type !== 'response.create') return;

          setImmediate(() =>
            connection.emit('error', {
              error: { type: 'invalid_request_error', code: 'bad_voice' },
            }),
          );
        },
      });

      await assertProviderError(runRealtime({ connection }), 'invalid_request');
      assert.equal(connection.closed, true);
    });

    it('maps a failed handshake', async () => {
      const connection = createFakeConnection();
      const promise = synthesizeRealtimeSpeechIntegration({
        client: {},
        model: 'gpt-realtime-2.1-mini',
        voice: 'marin',
        text: 'Hi',
        openConnection: () => connection,
      });

      setImmediate(() =>
        connection.emit('error', new Error('Unexpected server response: 401')),
      );

      await assertProviderError(promise, 'provider_auth_failed');
    });

    it('rejects a response cut by the safety filter', async () => {
      const connection = createFakeConnection({
        onSend: respondWithAudio({
          chunks: [[1, 2]],
          status: 'incomplete',
          statusDetails: { type: 'incomplete', reason: 'content_filter' },
        }),
      });

      await assertProviderError(runRealtime({ connection }), 'safety_rejected');
    });

    it('rejects a completed response without audio', async () => {
      const connection = createFakeConnection({
        onSend: respondWithAudio({ chunks: [] }),
      });

      await assertProviderError(runRealtime({ connection }), 'invalid_request');
    });

    it('times out when the response never finishes', async () => {
      const connection = createFakeConnection();

      await assertProviderError(
        runRealtime({ connection, timeoutMs: 20 }),
        'timeout',
      );
      assert.equal(connection.closed, true);
    });

    it('fails when the socket closes early', async () => {
      const connection = createFakeConnection({
        onSend: ({ event }) => {
          if (event.type === 'response.create') {
            setImmediate(() => connection.socket.emit('close', 1006));
          }
        },
      });

      await assertProviderError(
        runRealtime({ connection }),
        'provider_unavailable',
      );
    });

    it('fails when the connection cannot be opened', async () => {
      await assertProviderError(
        synthesizeRealtimeSpeechIntegration({
          client: {},
          model: 'gpt-realtime-2.1-mini',
          voice: 'marin',
          text: 'Hi',
          openConnection: () => {
            throw new Error('boom');
          },
        }),
        'unknown',
      );
    });
  });

  describe('mapRealtimeErrorIntegration', () => {
    const cases = [
      [
        '403 handshake',
        new Error('Unexpected server response: 403'),
        'provider_auth_failed',
      ],
      [
        '429 handshake',
        new Error('Unexpected server response: 429'),
        'rate_limited',
      ],
      [
        '500 handshake',
        new Error('Unexpected server response: 502'),
        'provider_unavailable',
      ],
      [
        '400 handshake',
        new Error('Unexpected server response: 400'),
        'invalid_request',
      ],
      ['quota', { error: { code: 'insufficient_quota' } }, 'quota_exceeded'],
      [
        'rate limit',
        { error: { code: 'rate_limit_exceeded' } },
        'rate_limited',
      ],
      [
        'bad key',
        { error: { code: 'invalid_api_key' } },
        'provider_auth_failed',
      ],
      [
        'server error',
        { error: { type: 'server_error' } },
        'provider_unavailable',
      ],
      [
        'network',
        Object.assign(new Error('x'), { code: 'ECONNREFUSED' }),
        'provider_unavailable',
      ],
      ['anything else', new Error('boom'), 'unknown'],
    ];

    for (const [name, error, category] of cases) {
      it(`maps ${name} to ${category}`, () => {
        assert.equal(mapRealtimeErrorIntegration({ error }), category);
      });
    }
  });
});
