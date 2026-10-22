export async function checkHealthController(_request, reply) {
  return reply.success({
    data: { status: 'ok', uptime: process.uptime() },
    message: 'Server is running',
  });
}
