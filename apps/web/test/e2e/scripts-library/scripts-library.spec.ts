import { test } from '../fixtures/base.fixture';

const DEFAULT_SCRIPT_TITLE = 'Untitled Script';

function createProjectTitle() {
  return `E2E Project ${Date.now()}`;
}

test.describe.configure({ mode: 'serial' });

test.describe('Scripts library', () => {
  test('creates a script from an empty series and opens the editor', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle();

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.expectEmptyState();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
  });

  test('persists script content after explicit save and reload', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Writer ${Date.now()}`;
    const scriptContent = 'INT. TEST LAB - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.typeAndSave(scriptContent);
    await scriptEditorPage.expectContent(scriptContent);
  });

  test('shows script card metadata and reopens an existing script', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Library ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.expectEmptyState();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();

    await scriptEditorPage.goToLibrary();
    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.expectScriptVisible(DEFAULT_SCRIPT_TITLE);
    await scriptLibraryPage.expectScriptMetadataVisible(DEFAULT_SCRIPT_TITLE);
    await scriptLibraryPage.openScript(DEFAULT_SCRIPT_TITLE);
    await scriptEditorPage.expectLoaded();
  });
});
