/**
 * Gamification contracts - achievements and badges
 */
import achievementsContract from '../achievements.contract';
import badgesContract from '../badges.contract';

export const GAMIFICATION_CONTRACT = {
  achievements: achievementsContract,
  badges: badgesContract,
};

export type GamificationContract = typeof GAMIFICATION_CONTRACT;
