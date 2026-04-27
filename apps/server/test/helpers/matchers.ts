import { expect } from 'vitest';

expect.extend({
  toBeNil(received) {
    const pass = received === null || received === undefined;

    if (pass) {
      return {
        message: () => `expected ${received} not to be nil (null or undefined)`,
        pass: true,
      };
    }

    return {
      message: () => `expected ${received} to be nil (null or undefined)`,
      pass: false,
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeNil(): T;
  }

  interface AsymmetricMatchersContaining {
    toBeNil(): any;
  }
}
