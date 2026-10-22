import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectAudioContainerIntegration,
  encodePcmAudioIntegration,
  readAudioMetadataIntegration,
  runFfmpegIntegration,
} from '#src/integrations/index.js';

const SAMPLE_RATE = 24000;

function buildTone({ seconds }) {
  const samples = Math.round(seconds * SAMPLE_RATE);
  const pcm = Buffer.alloc(samples * 2);

  for (let index = 0; index < samples; index += 1) {
    pcm.writeInt16LE(Math.round(Math.sin(index / 8) * 8000), index * 2);
  }

  return pcm;
}

async function assertUnsupported(promise) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.code, 'UNSUPPORTED_MEDIA_TYPE');
    assert.equal(error.statusCode, 415);

    return true;
  });
}

describe('audio integrations', () => {
  const pcm = buildTone({ seconds: 1 });
  const encoded = {};

  before(async () => {
    for (const format of ['wav', 'mp3', 'opus', 'aac', 'flac']) {
      encoded[format] = await encodePcmAudioIntegration({
        pcm,
        sampleRate: SAMPLE_RATE,
        format,
      });
    }
  });

  describe('encodePcmAudioIntegration', () => {
    it('builds a wav file with a 44 byte header', () => {
      const { buffer, contentType, extension, durationSeconds } = encoded.wav;

      assert.equal(buffer.length, 44 + pcm.length);
      assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
      assert.equal(buffer.toString('ascii', 8, 12), 'WAVE');
      assert.equal(buffer.readUInt32LE(24), SAMPLE_RATE);
      assert.equal(buffer.readUInt16LE(22), 1);
      assert.equal(buffer.readUInt32LE(40), pcm.length);
      assert.equal(contentType, 'audio/wav');
      assert.equal(extension, 'wav');
      assert.equal(durationSeconds, 1);
    });

    it('encodes mp3, opus, aac and flac with ffmpeg', () => {
      assert.equal(encoded.mp3.contentType, 'audio/mpeg');
      assert.equal(encoded.mp3.extension, 'mp3');
      assert.equal(detectAudioContainerIntegration(encoded.mp3), 'mp3');

      assert.equal(encoded.opus.contentType, 'audio/ogg');
      assert.equal(encoded.opus.extension, 'ogg');
      assert.equal(encoded.opus.buffer.toString('ascii', 0, 4), 'OggS');

      assert.equal(encoded.aac.contentType, 'audio/aac');
      assert.equal(encoded.aac.extension, 'aac');
      assert.equal(encoded.aac.buffer[0], 0xff);
      assert.equal(encoded.aac.buffer[1] & 0xf6, 0xf0);

      assert.equal(encoded.flac.contentType, 'audio/flac');
      assert.equal(encoded.flac.extension, 'flac');
      assert.equal(encoded.flac.buffer.toString('ascii', 0, 4), 'fLaC');

      for (const format of ['mp3', 'opus', 'aac', 'flac']) {
        assert.ok(encoded[format].buffer.length > 100, format);
        assert.equal(encoded[format].durationSeconds, 1);
      }
    });

    it('ignores a trailing half sample', async () => {
      const result = await encodePcmAudioIntegration({
        pcm: Buffer.concat([pcm, Buffer.from([7])]),
        sampleRate: SAMPLE_RATE,
        format: 'wav',
      });

      assert.equal(result.buffer.length, 44 + pcm.length);
      assert.equal(result.durationSeconds, 1);
    });
  });

  describe('readAudioMetadataIntegration', () => {
    for (const [format, expected] of [
      ['wav', 'wav'],
      ['mp3', 'mp3'],
      ['opus', 'ogg'],
      ['flac', 'flac'],
    ]) {
      it(`reads the length of a ${format} file`, async () => {
        const metadata = await readAudioMetadataIntegration({
          buffer: encoded[format].buffer,
          fileName: 'clip.bin',
          contentType: 'application/octet-stream',
        });

        assert.equal(metadata.format, expected);
        assert.ok(Math.abs(metadata.durationSeconds - 1) < 0.15);
      });
    }

    it('reads a webm recording without a duration header', async () => {
      const webm = await runFfmpegIntegration({
        args: [
          '-f',
          's16le',
          '-ar',
          String(SAMPLE_RATE),
          '-ac',
          '1',
          '-i',
          'pipe:0',
          '-c:a',
          'libopus',
          '-f',
          'webm',
          'pipe:1',
        ],
        input: pcm,
      });

      const metadata = await readAudioMetadataIntegration({ buffer: webm });

      assert.equal(metadata.format, 'webm');
      assert.ok(Math.abs(metadata.durationSeconds - 1) < 0.15);
    });

    it('rejects a file that is not audio', async () => {
      await assertUnsupported(
        readAudioMetadataIntegration({
          buffer: Buffer.from('just some plain text that is not audio'),
          fileName: 'clip.mp3',
          contentType: 'audio/mpeg',
        }),
      );
    });

    it('rejects a raw aac stream', async () => {
      await assertUnsupported(
        readAudioMetadataIntegration({ buffer: encoded.aac.buffer }),
      );
    });

    it('rejects a broken file with an audio header', async () => {
      await assertUnsupported(
        readAudioMetadataIntegration({
          buffer: encoded.wav.buffer.subarray(0, 44),
        }),
      );
    });
  });

  describe('detectAudioContainerIntegration', () => {
    const cases = [
      ['id3', Buffer.from('ID3\u0004\u0000\u0000'), 'mp3'],
      ['mpeg frame', Buffer.from([0xff, 0xfb, 0x90, 0x64]), 'mp3'],
      ['m4a', Buffer.from('\u0000\u0000\u0000 ftypM4A '), 'm4a'],
      ['webm', Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x01]), 'webm'],
      ['ogg', Buffer.from('OggS\u0000\u0002'), 'ogg'],
      ['flac', Buffer.from('fLaC\u0000\u0000'), 'flac'],
      ['aac', Buffer.from([0xff, 0xf1, 0x50, 0x80]), null],
      ['png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]), null],
      ['tiny', Buffer.from([0xff]), null],
    ];

    for (const [name, buffer, expected] of cases) {
      it(`detects ${name}`, () => {
        assert.equal(detectAudioContainerIntegration({ buffer }), expected);
      });
    }
  });
});
