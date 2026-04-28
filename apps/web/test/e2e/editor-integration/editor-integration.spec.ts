import { test } from '../fixtures/base.fixture';

function createProjectTitle(prefix: string) {
  return `${prefix} ${Date.now()}`;
}

function getSeriesIdFromUrl(url: string) {
  const match = /\/series\/([^/]+)/.exec(url);

  if (match == null) {
    throw new Error(`Cannot derive seriesId from URL: ${url}`);
  }

  return match[1];
}

function getScriptIdFromUrl(url: string) {
  const match = /\/scripts\/([^/?]+)/.exec(url);

  if (match == null) {
    throw new Error(`Cannot derive scriptId from URL: ${url}`);
  }

  return match[1];
}

test.describe.configure({ mode: 'serial' });

test.describe('Editor integration', () => {
  test('shows character suggestions from the knowledge base in a character block', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Suggestions');
    const characterName = `Integration Hero ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'Created for character suggestion coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('character');
    await scriptEditorPage.triggerCharacterBlockSuggestions(`/${characterName.slice(0, 8)}`);
    await scriptEditorPage.expectCharacterSuggestionVisible(characterName);
  });

  test('navigates character suggestions with ArrowDown and confirms with Enter', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Keyboard');
    const characterName = `Keyboard Hero ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'Created for keyboard suggestion coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('character');
    await scriptEditorPage.triggerCharacterBlockSuggestions('/');
    await scriptEditorPage.expectCharacterSuggestionVisible(characterName);
    await scriptEditorPage.moveAutocompleteSelectionDown();
    await scriptEditorPage.confirmAutocompleteSelection();
    await scriptEditorPage.expectBlockTextAt(0, characterName);
  });
});
