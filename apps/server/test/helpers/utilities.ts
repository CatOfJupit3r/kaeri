import { expect } from 'bun:test';

import { auth } from './instance';

type UserData = NonNullable<Prettify<Parameters<typeof auth.api.signUpEmail>[0]>>['body'];

export type TestUser = Awaited<ReturnType<typeof createUser>>;
export type TestCtx = TestUser['ctx'];

// ============================================================================
// User Creation Utilities
// ============================================================================

export function createRandomUser() {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    email: `userapi-${randomSuffix}@example.com`,
    name: `Test User ${randomSuffix}`,
    password: 'password123',
  } satisfies UserData;
}

export async function createUser(newUser: UserData = createRandomUser()) {
  const {
    headers,
    response: { user },
  } = await auth.api.signUpEmail({
    body: newUser,
    returnHeaders: true,
  });

  const cookie = headers.getSetCookie()[0];

  const getSession = await auth.api.getSession({
    headers: {
      cookie,
    },
  });

  if (!getSession?.session) throw new Error('Failed to create user session');
  const { session } = getSession;

  return {
    cookie,
    session,
    user,
    ctx: () => ({
      context: {
        session: {
          user,
          session,
        },
      },
    }),
  };
}

export async function expectErrorCode(fn: () => Promise<unknown>, code: string) {
  try {
    await fn();
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error.code).toBe(code);
  }
}
