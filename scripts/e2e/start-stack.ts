#!/usr/bin/env tsx

import { spawn } from 'node:child_process';

import { MongoClient } from 'mongodb';

const WEB_BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3030';
const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:5050';
const WEB_READY_URL = `${WEB_BASE_URL}/@vite/client`;
const API_READY_URL = `${API_BASE_URL}/auth/get-session`;
const MONGO_ADMIN_URI = process.env.MONGO_ADMIN_URI ?? 'mongodb://root:verysecretpassword@localhost:6061/admin?authSource=admin';
const MONGO_DATABASE_NAME = process.env.MONGO_DATABASE_NAME ?? 'kaeri';

async function waitForMongo(maxAttempts = 30) {
  console.log('[e2e-stack] Waiting for MongoDB to be ready...');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let client: MongoClient | null = null;

    try {
      client = new MongoClient(MONGO_ADMIN_URI, { serverSelectionTimeoutMS: 2_000 });
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      console.log('[e2e-stack] ✓ MongoDB is ready');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error('[e2e-stack] ❌ MongoDB failed to become ready after', maxAttempts, 'attempts');
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1_000));
    } finally {
      await client?.close().catch(() => null);
    }
  }
}

async function resetDatabase() {
  console.log('[e2e-stack] Resetting MongoDB database...');

  const client = new MongoClient(MONGO_ADMIN_URI, { serverSelectionTimeoutMS: 2_000 });

  try {
    await client.connect();
    await client.db(MONGO_DATABASE_NAME).dropDatabase();
    console.log('[e2e-stack] ✓ MongoDB database reset');
  } finally {
    await client.close();
  }
}

async function waitForService(url: string, name: string, maxAttempts = 60) {
  console.log(`[e2e-stack] Waiting for ${name} at ${url}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok || response.status < 500) {
        console.log(`[e2e-stack] ✓ ${name} is ready`);
        return;
      }
    } catch {
      // Service not ready yet.
    }

    if (attempt === maxAttempts) {
      console.error(`[e2e-stack] ❌ ${name} failed to become ready after ${maxAttempts} attempts`);
      throw new Error(`${name} did not start`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
}

function runCommand(command: string, args: string[], options: { shell?: boolean } = {}) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: options.shell ?? false,
      env: process.env,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

function spawnBackground(command: string, args: string[], options: { shell?: boolean } = {}) {
  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: options.shell ?? false,
    detached: false,
    env: process.env,
  });

  proc.on('error', (error) => {
    console.error('[e2e-stack] ❌ Background process error:', error);
  });

  const cleanup = () => {
    console.log('[e2e-stack] Stopping background processes...');
    proc.kill();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

async function startStack() {
  try {
    console.log('[e2e-stack] Starting Docker services...');
    await runCommand('docker', ['compose', '-f', 'docker-compose.e2e.yml', 'up', '-d']);
    console.log('[e2e-stack] ✓ Docker services started');

    await waitForMongo();
    await resetDatabase();

    console.log('[e2e-stack] Building shared workspace dependencies...');
    await runCommand('pnpm', ['run', 'build:deps'], { shell: true });
    console.log('[e2e-stack] ✓ Shared dependencies built');

    console.log('[e2e-stack] Building server...');
    await runCommand('pnpm', ['--filter=server', 'run', 'build'], { shell: true });
    console.log('[e2e-stack] ✓ Server build complete');

    console.log('[e2e-stack] Starting app servers...');
    console.log('[e2e-stack] Running: pnpm --parallel --filter=server --filter=web run start');
    spawnBackground('pnpm', ['--parallel', '--filter=server', '--filter=web', 'run', 'start'], {
      shell: true,
    });

    await waitForService(WEB_READY_URL, 'Web Server');
    await waitForService(API_READY_URL, 'API Server');

    console.log('[e2e-stack] ✓ All services ready');
    console.log('[e2e-stack] ✓ Stack startup complete');

    await new Promise(() => {});
  } catch (error) {
    console.error('[e2e-stack] ❌ Stack startup failed:', error);
    process.exit(1);
  }
}

void startStack();