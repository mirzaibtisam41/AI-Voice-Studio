import mongoose from 'mongoose';

export function runInTransactionUtil({ work }) {
  return mongoose.connection.transaction((session) => work({ session }));
}
