import { AuthTokenModel } from '#src/modules/auth-tokens/auth-token.model.js';

export async function createAuthTokenRepository({ session, data }) {
  const [authToken] = await AuthTokenModel.create([data], { session });

  return authToken;
}
