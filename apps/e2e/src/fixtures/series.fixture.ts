import { KnowledgeBasePage, ScriptEditorPage, SeriesPage } from "../pages";
import { test as authTest } from "./auth.fixture";
import { type E2EClient, createE2EClient } from "../utils/orpc";

type SeriesFixtures = {
  seriesPage: SeriesPage;
  scriptEditorPage: ScriptEditorPage;
  knowledgeBasePage: KnowledgeBasePage;
  apiClient: E2EClient;
  testSeries: { id: string; title: string };
  testScript: { id: string; title: string; seriesId: string };
};

export const test = authTest.extend<SeriesFixtures>({
  seriesPage: async ({ page }, use) => {
    await use(new SeriesPage(page));
  },

  scriptEditorPage: async ({ page }, use) => {
    await use(new ScriptEditorPage(page));
  },

  knowledgeBasePage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },

  apiClient: async ({ authenticatedPage }, use) => {
    const client = createE2EClient(authenticatedPage);
    await use(client);
  },

  testSeries: async ({ apiClient }, use) => {
    // Create series via oRPC client
    const series = await apiClient.series.createSeries({
      title: `Test Series ${Date.now()}`,
      genre: "DRAMA",
      logline: "A test series for E2E testing",
    });

    await use({ id: series._id, title: series.title });

    // Cleanup - ignore if already deleted (for delete tests)
    try {
      await apiClient.series.deleteSeries({ seriesId: series._id });
    } catch {
      // Series may already be deleted by the test
    }
  },

  testScript: async ({ apiClient, testSeries }, use) => {
    // Create script via oRPC client
    const script = await apiClient.scripts.createScript({
      seriesId: testSeries.id,
      title: `Test Script ${Date.now()}`,
    });

    await use({
      id: script._id,
      title: script.title,
      seriesId: testSeries.id,
    });

    // Cleanup handled by series deletion
  },
});

export { expect } from "@playwright/test";
