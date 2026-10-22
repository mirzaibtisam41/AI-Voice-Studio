import { setTimeout as delay } from 'node:timers/promises';

const SAMPLE_RATE = 24000;

function buildTonePcm({ seconds }) {
  const samples = Math.max(1, Math.round(seconds * SAMPLE_RATE));
  const pcm = Buffer.alloc(samples * 2);

  for (let index = 0; index < samples; index += 1) {
    const time = index / SAMPLE_RATE;
    const envelope = Math.min(
      1,
      time * 8,
      (samples - index) / (SAMPLE_RATE / 8),
    );
    const value =
      Math.sin(2 * Math.PI * 220 * time) * 0.18 +
      Math.sin(2 * Math.PI * 330 * time) * 0.08;

    pcm.writeInt16LE(Math.round(value * envelope * 32767), index * 2);
  }

  return pcm;
}

export function createDevFakeAi() {
  return {
    async synthesizeSpeech({ text }) {
      await delay(600);

      return {
        pcm: buildTonePcm({
          seconds: Math.min(30, Math.max(1, text.length / 15)),
        }),
        sampleRate: SAMPLE_RATE,
      };
    },

    async transcribeAudio({ fileName }) {
      await delay(900);

      return {
        text: `This is a development transcript for ${fileName}. The real text appears once an OpenAI key is set.`,
        languages: ['en'],
      };
    },

    async createRealtimeClientSecret() {
      return {
        value: 'ek_dev_fake_secret',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    },

    async generateChatReply({ messages }) {
      await delay(500);

      const last = messages.at(-1)?.content ?? '';

      return {
        reply: `Development reply: you said "${last.slice(0, 80)}". Set an OpenAI key for real answers.`,
      };
    },
  };
}

export function createDevMemoryStorage({ baseUrl }) {
  const files = new Map();

  return {
    files,

    async uploadFile({ key, body, contentType }) {
      files.set(key, { body, contentType });
    },

    async downloadFile({ key }) {
      return files.get(key)?.body;
    },

    async deleteFile({ key }) {
      files.delete(key);
    },

    async createSignedUrl({ key, downloadFileName }) {
      const download = downloadFileName
        ? `?download=${encodeURIComponent(downloadFileName)}`
        : '';

      return `${baseUrl}/dev-storage/${key}${download}`;
    },

    close() {
      files.clear();
    },
  };
}
