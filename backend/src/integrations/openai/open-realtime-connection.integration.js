import { OpenAIRealtimeWS } from 'openai/realtime/ws';

export function openRealtimeConnectionIntegration({ client, model }) {
  return new OpenAIRealtimeWS({ model }, client);
}
