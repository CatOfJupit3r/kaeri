import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const testMongoServerKey = Symbol.for('kaeri.test.mongo.server');
const testMongoReadyKey = Symbol.for('kaeri.test.mongo.ready');

type ITestMongoGlobals = typeof globalThis & {
  [testMongoServerKey]?: MongoMemoryServer;
  [testMongoReadyKey]?: Promise<void>;
};

const testGlobals = globalThis as ITestMongoGlobals;

async function createTestMongoServer() {
  console.log('Setting up in-memory MongoDB server for tests...');

  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 5,
  });

  testGlobals[testMongoServerKey] = mongo;

  console.log('In-memory MongoDB server is ready.');
}

export async function initializeTestMongo() {
  if (testGlobals[testMongoServerKey] && mongoose.connection.readyState === 1) {
    return;
  }

  testGlobals[testMongoReadyKey] ??= createTestMongoServer();
  await testGlobals[testMongoReadyKey];
}

export async function clearTestMongoCollections() {
  const collections = mongoose.connection.collections;

  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

export async function shutdownTestMongo() {
  const mongo = testGlobals[testMongoServerKey];

  if (!mongo) {
    return;
  }

  console.log('Tearing down in-memory MongoDB server...');

  try {
    await mongoose.disconnect();
    await mongo.stop({ doCleanup: true, force: true });
  } catch (error) {
    console.error('Error during teardown of in-memory MongoDB server:', error);
  } finally {
    delete testGlobals[testMongoServerKey];
    delete testGlobals[testMongoReadyKey];
  }

  console.log('In-memory MongoDB server has been stopped.');
}
