export interface iTestUser {
  email: string;
  username: string;
  name: string;
  password: string;
}

export const TEST_USERS = {
  default: {
    email: 'e2e-default@example.com',
    username: 'e2edefault',
    name: 'E2E Default User',
    password: 'password123',
  },
} as const satisfies Record<'default', iTestUser>;

export function createTestUser(prefix = 'e2e'): iTestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `${prefix}-${suffix}@example.com`,
    username: `${prefix}${suffix}`.replace(/[^a-z0-9]/gi, '').slice(0, 20),
    name: `E2E ${prefix} ${suffix}`,
    password: 'password123',
  };
}
