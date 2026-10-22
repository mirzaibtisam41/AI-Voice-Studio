import {
  SPEECH_SPEED,
  SPEECH_STYLE,
  SPEECH_STYLE_INSTRUCTIONS,
} from '#src/modules/speech/speech.constants.js';

function describeSpeed(speed) {
  if (speed === SPEECH_SPEED.DEFAULT) {
    return 'Speak at a normal, comfortable pace.';
  }

  const pace = speed < SPEECH_SPEED.DEFAULT ? 'slower' : 'faster';

  return `Speak ${pace} than a normal pace, at about ${speed} times normal speed.`;
}

export function buildSpeechInstructionsUtil({
  style = SPEECH_STYLE.NEUTRAL,
  direction,
  speed = SPEECH_SPEED.DEFAULT,
}) {
  const parts = [SPEECH_STYLE_INSTRUCTIONS[style], describeSpeed(speed)];
  const extra = direction?.trim();

  if (extra) parts.push(extra);

  return parts.join(' ');
}
