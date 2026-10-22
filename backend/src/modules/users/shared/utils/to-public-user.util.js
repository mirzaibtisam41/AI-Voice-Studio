export function toPublicUserUtil({ user }) {
  const { passwordHash: _passwordHash, ...publicUser } = user.toJSON();

  return publicUser;
}
