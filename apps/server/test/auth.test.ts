import { describe, expect, it } from 'vitest';

import { createUser } from './helpers/utilities';

describe('Auth', () => {
  it('should create a user', async () => {
    const userInfo = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };
    const { session, user } = await createUser(userInfo);

    expect(session).toBeDefined();
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
});
