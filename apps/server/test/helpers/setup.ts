import 'reflect-metadata';
import { afterEach, beforeAll } from 'vitest';

import './matchers';
import { clearTestMongoCollections, initializeTestMongo } from './mongo-memory';

await initializeTestMongo();

afterEach(async () => {
  await clearTestMongoCollections();
});

beforeAll(async () => {
  const { resolve } = await import('@~/di/container');
  const { TOKENS } = await import('@~/di/tokens');
  resolve(TOKENS.LoggerFactory).silence();
});
