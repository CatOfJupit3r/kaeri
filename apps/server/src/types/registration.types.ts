import type { DependencyContainer } from 'tsyringe';

/**
 * Context provided during service registration
 */
export interface iRegistrationCtx {
  container: DependencyContainer;
  token: symbol;
}
