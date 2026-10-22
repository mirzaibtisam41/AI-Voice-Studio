import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import OpenAI, { APIConnectionTimeoutError } from 'openai';
import {
  createRealtimeClientSecretIntegration,
  generateChatReplyIntegration,
  transcribeAudioIntegration,
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

function assertProviderError(category, cause) {
  return (error) => {
    assert.ok(error instanceof ProviderError);
    assert.equal(error.category, category);
    if (cause) assert.equal(error.cause, cause);
    assert.equal(error.message.includes('provider message'), false);

    return true;
  };
}

function transcriptionClient(respond) {
  const sent = [];

  return {
    sent,
    audio: {
      transcriptions: {
        create: async (request) => {
          sent.push(request);

          return respond(request);
        },
      },
    },
  };
}

describe('OpenAI voice integrations', () => {
  describe('transcribeAudioIntegration', () => {
    it('sends languages and keywords to gpt-transcribe and returns language codes', async () => {
      const client = transcriptionClient(async () => ({
        text: '  Hello there  ',
        languages: [{ code: 'en' }, { code: 'fr' }],
      }));

      const result = await transcribeAudioIntegration({
        client,
        model: 'gpt-transcribe',
        audio: Buffer.from('audio-bytes'),
        fileName: 'clip.mp3',
        contentType: 'audio/mpeg',
        languages: ['en', 'fr'],
        keywords: ['Fraunces', 'LUFS'],
      });

      const [request] = client.sent;

      assert.equal(request.model, 'gpt-transcribe');
      assert.deepEqual(request.languages, ['en', 'fr']);
      assert.deepEqual(request.keywords, ['Fraunces', 'LUFS']);
      assert.equal(request.language, undefined);
      assert.equal(request.prompt, undefined);
      assert.equal(request.file.name, 'clip.mp3');
      assert.equal(request.file.type, 'audio/mpeg');
      assert.equal(
        Buffer.from(await request.file.arrayBuffer()).toString(),
        'audio-bytes',
      );
      assert.deepEqual(result, {
        text: 'Hello there',
        languages: ['en', 'fr'],
      });
    });

    it('folds keywords into the prompt for models without keyword support', async () => {
      const client = transcriptionClient(async () => ({ text: 'Hi' }));

      const result = await transcribeAudioIntegration({
        client,
        model: 'whisper-1',
        audio: Buffer.from('x'),
        fileName: 'clip.wav',
        contentType: 'audio/wav',
        languages: ['de'],
        keywords: ['Fraunces'],
        prompt: 'A podcast intro.',
      });

      const [request] = client.sent;

      assert.equal(request.language, 'de');
      assert.equal(request.languages, undefined);
      assert.equal(request.keywords, undefined);
      assert.equal(
        request.prompt,
        'A podcast intro. Words you may hear: Fraunces.',
      );
      assert.deepEqual(result, { text: 'Hi', languages: [] });
    });

    it('leaves optional fields out when they are empty', async () => {
      const client = transcriptionClient(async () => ({ text: 'Hi' }));

      await transcribeAudioIntegration({
        client,
        model: 'gpt-transcribe',
        audio: Buffer.from('x'),
        fileName: 'clip.mp3',
        contentType: 'audio/mpeg',
      });

      assert.deepEqual(Object.keys(client.sent[0]).sort(), ['file', 'model']);
    });

    it('turns provider errors into a ProviderError', async () => {
      const providerError = apiError(429, 'insufficient_quota');
      const client = transcriptionClient(async () => {
        throw providerError;
      });

      await assert.rejects(
        transcribeAudioIntegration({
          client,
          model: 'gpt-transcribe',
          audio: Buffer.from('x'),
          fileName: 'clip.mp3',
          contentType: 'audio/mpeg',
        }),
        assertProviderError('quota_exceeded', providerError),
      );
    });

    it('fails with unknown when the provider returns no text', async () => {
      const client = transcriptionClient(async () => ({}));

      await assert.rejects(
        transcribeAudioIntegration({
          client,
          model: 'gpt-transcribe',
          audio: Buffer.from('x'),
          fileName: 'clip.mp3',
          contentType: 'audio/mpeg',
        }),
        assertProviderError('unknown'),
      );
    });
  });

  describe('createRealtimeClientSecretIntegration', () => {
    function secretClient(respond) {
      const sent = [];

      return {
        sent,
        realtime: {
          clientSecrets: {
            create: async (request) => {
              sent.push(request);

              return respond(request);
            },
          },
        },
      };
    }

    it('creates a realtime session secret with the voice and instructions', async () => {
      const expiresAt = Math.floor(Date.now() / 1000) + 600;
      const client = secretClient(async () => ({
        value: 'ek_123',
        expires_at: expiresAt,
        session: {},
      }));

      const result = await createRealtimeClientSecretIntegration({
        client,
        model: 'gpt-realtime-2.1-mini',
        voice: 'marin',
        instructions: 'Be kind.',
      });

      assert.deepEqual(client.sent[0], {
        expires_after: { anchor: 'created_at', seconds: 600 },
        session: {
          type: 'realtime',
          model: 'gpt-realtime-2.1-mini',
          instructions: 'Be kind.',
          audio: {
            input: { transcription: { model: 'gpt-transcribe' } },
            output: { voice: 'marin' },
          },
        },
      });
      assert.equal(result.value, 'ek_123');
      assert.equal(result.expiresAt.getTime(), expiresAt * 1000);
    });

    it('maps a timeout to a ProviderError', async () => {
      const client = secretClient(async () => {
        throw new APIConnectionTimeoutError();
      });

      await assert.rejects(
        createRealtimeClientSecretIntegration({
          client,
          model: 'gpt-realtime-2.1-mini',
          voice: 'marin',
          instructions: 'x',
        }),
        assertProviderError('timeout'),
      );
    });

    it('fails with unknown when no secret comes back', async () => {
      const client = secretClient(async () => ({ expires_at: 1 }));

      await assert.rejects(
        createRealtimeClientSecretIntegration({
          client,
          model: 'gpt-realtime-2.1-mini',
          voice: 'marin',
          instructions: 'x',
        }),
        assertProviderError('unknown'),
      );
    });
  });

  describe('generateChatReplyIntegration', () => {
    function chatClient(respond) {
      const sent = [];

      return {
        sent,
        responses: {
          create: async (request) => {
            sent.push(request);

            return respond(request);
          },
        },
      };
    }

    const messages = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'What are your hours?' },
    ];

    it('sends the conversation to the Responses API with a short limit', async () => {
      const client = chatClient(async () => ({
        output_text: ' We open at 9. ',
      }));

      const result = await generateChatReplyIntegration({
        client,
        model: 'gpt-5-nano',
        instructions: 'You are a helper.',
        messages,
      });

      assert.deepEqual(client.sent[0], {
        model: 'gpt-5-nano',
        instructions: 'You are a helper.',
        input: messages,
        max_output_tokens: 400,
        store: false,
        reasoning: { effort: 'minimal' },
      });
      assert.deepEqual(result, { reply: 'We open at 9.' });
    });

    it('does not send reasoning settings to non-reasoning models', async () => {
      const client = chatClient(async () => ({ output_text: 'Hi' }));

      await generateChatReplyIntegration({
        client,
        model: 'gpt-4.1-nano',
        instructions: 'x',
        messages,
      });

      assert.equal(client.sent[0].reasoning, undefined);
      assert.equal(client.sent[0].max_output_tokens, 400);
    });

    it('fails with unknown when the reply is empty', async () => {
      const client = chatClient(async () => ({ output_text: '' }));

      await assert.rejects(
        generateChatReplyIntegration({
          client,
          model: 'gpt-5-nano',
          instructions: 'x',
          messages,
        }),
        assertProviderError('unknown'),
      );
    });

    it('maps a safety block to a ProviderError', async () => {
      const providerError = apiError(400, 'moderation_blocked');
      const client = chatClient(async () => {
        throw providerError;
      });

      await assert.rejects(
        generateChatReplyIntegration({
          client,
          model: 'gpt-5-nano',
          instructions: 'x',
          messages,
        }),
        assertProviderError('safety_rejected', providerError),
      );
    });
  });
});
