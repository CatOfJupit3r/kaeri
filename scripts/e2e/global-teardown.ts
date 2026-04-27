import { spawn } from 'node:child_process';

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'null'}`));
    });
  });
}

export default async function globalTeardown() {
  try {
    await run('docker', ['compose', '-f', './docker-compose.e2e.yml', 'down', '-v', '--remove-orphans']);
  } catch (error) {
    console.warn('E2E global teardown failed to clean docker compose stack', error);
  }
}