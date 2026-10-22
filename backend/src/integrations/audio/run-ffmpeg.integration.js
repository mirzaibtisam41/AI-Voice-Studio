import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const STDERR_MAX_LENGTH = 4000;

export function runFfmpegIntegration({ args, input }) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const output = [];
    let stderr = '';

    child.stdout.on('data', (chunk) => output.push(chunk));
    child.stderr.on('data', (chunk) => {
      stderr = `${stderr}${chunk}`.slice(-STDERR_MAX_LENGTH);
    });
    child.stdin.on('error', () => {});
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(output));
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}: ${stderr.trim()}`));
    });

    child.stdin.end(input);
  });
}
