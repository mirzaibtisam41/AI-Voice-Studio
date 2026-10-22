import '#src/bootstrap/load-env.bootstrap.js';
import mongoose from 'mongoose';
import { UserModel } from '#src/modules/users/user.model.js';
import { USER_ROLE } from '#src/modules/users/user.constants.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run admin:promote -- <email>');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is missing, add it to backend/.env');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});

try {
  const user = await UserModel.findOneAndUpdate(
    { email },
    { $set: { role: USER_ROLE.ADMIN } },
    { returnDocument: 'after' },
  );

  if (user) {
    console.log(`${user.email} is now an admin`);
  } else {
    console.error(`No account uses the email ${email}`);
    process.exitCode = 1;
  }
} finally {
  await mongoose.disconnect();
}
