/**
 * Core contracts - foundational system operations
 */
import indexContract from '../index.contract';
import userContract from '../user.contract';

export const CORE_CONTRACT = {
  user: userContract,
  index: indexContract,
};

export type CoreContract = typeof CORE_CONTRACT;
