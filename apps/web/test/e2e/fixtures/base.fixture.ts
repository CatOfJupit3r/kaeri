import { test as base } from '@playwright/test';

import {
  AuthPage,
  CharacterPage,
  DashboardPage,
  KnowledgeBasePage,
  ScriptEditorPage,
  ScriptLibraryPage,
} from '../pages';
import { TEST_USERS, createTestUser } from '../test-users';

interface iPageFixtures {
  authPage: AuthPage;
  characterPage: CharacterPage;
  dashboardPage: DashboardPage;
  knowledgeBasePage: KnowledgeBasePage;
  scriptEditorPage: ScriptEditorPage;
  scriptLibraryPage: ScriptLibraryPage;
}

export const test = base.extend<iPageFixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  characterPage: async ({ page }, use) => {
    await use(new CharacterPage(page));
  },
  knowledgeBasePage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },
  scriptEditorPage: async ({ page }, use) => {
    await use(new ScriptEditorPage(page));
  },
  scriptLibraryPage: async ({ page }, use) => {
    await use(new ScriptLibraryPage(page));
  },
});

export { expect } from '@playwright/test';
export { TEST_USERS, createTestUser };
