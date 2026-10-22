import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import '#src/database/models.js';

async function registerDatabase(fastify) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(fastify.config.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  const hello = await mongoose.connection.db.admin().command({ hello: 1 });

  if (!hello.setName) {
    throw new Error(
      'MongoDB must run as a replica set so credit changes can use transactions',
    );
  }

  await mongoose.connection.syncIndexes();
  fastify.log.info('Database connected');

  fastify.decorate('mongoose', mongoose);

  fastify.addHook('onClose', async () => {
    await mongoose.disconnect();
  });
}

export const databasePlugin = fp(registerDatabase);
