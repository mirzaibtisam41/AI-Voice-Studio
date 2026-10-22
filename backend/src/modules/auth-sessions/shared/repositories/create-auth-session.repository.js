import { AuthSessionModel } from '#src/modules/auth-sessions/auth-session.model.js';

export async function createAuthSessionRepository({ session, data }) {
  const [authSession] = await AuthSessionModel.create([data], { session });

  return authSession;
}
