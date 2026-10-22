import { updateMyProfileService } from '#src/modules/users/features/update-my-profile/update-my-profile.service.js';

export async function updateMyProfileController(request, reply) {
  const user = await updateMyProfileService({
    userId: request.user._id,
    name: request.body.name,
  });

  return reply.success({ data: { user }, message: 'Profile saved' });
}
