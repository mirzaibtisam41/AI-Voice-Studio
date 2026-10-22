import { StatusCodes } from 'http-status-codes';
import { registerService } from '#src/modules/auth/features/register/register.service.js';

export async function registerController(request, reply) {
  const user = await registerService({
    server: request.server,
    data: request.body,
  });

  return reply.success({
    data: { user },
    message: 'Account created successfully',
    statusCode: StatusCodes.CREATED,
  });
}
