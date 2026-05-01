#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function isPortListening(port: number) {
  try {
    const output = execSync(`netstat -an | findstr LISTENING | findstr :${port}`, { stdio: 'pipe' }).toString();
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function check(name: string, fn: () => boolean, successMsg: string, failMsg: string) {
  console.log(`\nChecking: ${name}...`);

  try {
    const passed = fn();
    results.push({ name, passed, message: passed ? successMsg : failMsg });
    console.log(passed ? `✓ ${successMsg}` : `✗ ${failMsg}`);
  } catch (error) {
    results.push({ name, passed: false, message: failMsg });
    console.log(`✗ ${failMsg}`);

    if (error instanceof Error) {
      console.log(`  Error: ${error.message}`);
    }
  }
}

console.log('='.repeat(60));
console.log('E2E Pre-flight Check');
console.log('='.repeat(60));

check(
  'Docker Installation',
  () => {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  },
  'Docker is installed',
  'Docker is not installed or not in PATH',
);

check(
  'Docker Daemon',
  () => {
    execSync('docker ps', { stdio: 'pipe' });
    return true;
  },
  'Docker daemon is running',
  'Docker daemon is not running. Start Docker Desktop or Docker Engine.',
);

check(
  'Port 3030 (Web)',
  () => !isPortListening(3030),
  'Port 3030 is available',
  'Port 3030 is already in use. Stop any processes using this port.',
);

check(
  'Port 5050 (API)',
  () => !isPortListening(5050),
  'Port 5050 is available',
  'Port 5050 is already in use. Stop any processes using this port.',
);

check(
  'Port 6061 (MongoDB)',
  () => !isPortListening(6061),
  'Port 6061 is available',
  'Port 6061 is already in use. Stop any processes using this port.',
);

check(
  'Port 6380 (Valkey)',
  () => !isPortListening(6380),
  'Port 6380 is available',
  'Port 6380 is already in use. Stop any processes using this port.',
);

check(
  'Dependencies',
  () => existsSync('node_modules') && existsSync('apps/web/node_modules') && existsSync('apps/server/node_modules'),
  'Dependencies are installed',
  'Dependencies missing. Run: pnpm install',
);

check(
  'Playwright Browsers',
  () => {
    try {
      execSync('pnpm exec playwright --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  },
  'Playwright browsers are installed',
  'Playwright browsers missing. Run: pnpm run e2e:install',
);

console.log(`\n${'='.repeat(60)}`);
console.log('Summary');
console.log('='.repeat(60));

const passed = results.filter((result) => result.passed).length;
const failed = results.filter((result) => !result.passed).length;

console.log(`\n✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n❌ Some checks failed. Please address the issues above before running E2E tests.');
  console.log('\nCommon fixes:');
  console.log('  • Install Docker: https://docs.docker.com/get-docker/');
  console.log('  • Start Docker Desktop');
  console.log('  • Install dependencies: pnpm install');
  console.log('  • Install Playwright browsers: pnpm run e2e:install');
  console.log('  • Stop conflicting processes on ports 3030, 5050, 6061, 6380');
  process.exit(1);
}

console.log('\n✅ All checks passed! You can run: pnpm run e2e');
process.exit(0);