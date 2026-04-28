import { expect, test } from '../fixtures/base.fixture';

function createProjectTitle(prefix: string) {
  return `${prefix} ${Date.now()}`;
}

test.describe.configure({ mode: 'serial' });

test.describe('Knowledge base', () => {
  test('loads with the all tab by default and honors tab deep links', async ({ dashboardPage, knowledgeBasePage }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Route');

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries();
    await knowledgeBasePage.expectActiveTab('All');
    await expect(knowledgeBasePage.page).toHaveURL(/\/knowledge-base(?:\?.*)?$/, { timeout: 10_000 });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.expectActiveTab('Characters');
    await expect(knowledgeBasePage.page).toHaveURL(/tab=characters/, { timeout: 10_000 });
  });

  test('searches for a character and switches to the matching tab', async ({ dashboardPage, knowledgeBasePage }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Search');
    const characterName = `Search Character ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'Created for knowledge base search coverage.',
    });
    await knowledgeBasePage.switchTab('Locations');
    await knowledgeBasePage.searchForEntity(characterName);
    await knowledgeBasePage.expectSearchResultVisible(characterName);
    await knowledgeBasePage.clickSearchResult(characterName);
    await knowledgeBasePage.expectActiveTab('Characters');
    await knowledgeBasePage.expectCharacterVisible(characterName);
  });

  test('creates a character, opens its detail page, and edits it', async ({
    characterPage,
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Character');
    const characterName = `Hero ${Date.now()}`;
    const description = 'Initial character description.';
    const updatedDescription = 'Updated character description.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({ name: characterName, description });
    await knowledgeBasePage.openCharacter(characterName);
    await characterPage.expectLoaded(characterName);
    await characterPage.expectDescription(description);
    await characterPage.updateDescription(updatedDescription);
    await characterPage.expectDescription(updatedDescription);
    await characterPage.reloadAndExpectLoaded(characterName);
    await characterPage.expectDescription(updatedDescription);
  });

  test('deletes a character from the characters tab', async ({ dashboardPage, knowledgeBasePage }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Delete');
    const characterName = `Disposable ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'Created for character deletion coverage.',
    });
    await knowledgeBasePage.deleteCharacter(characterName);
  });

  test('creates a location, edits it from the locations tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Location');
    const locationName = `Harbor ${Date.now()}`;
    const description = 'A foggy harbor at dawn.';
    const updatedDescription = 'A foggy harbor at sunset.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=locations');
    await knowledgeBasePage.createLocation({ name: locationName, description });
    await knowledgeBasePage.openLocationForEdit(locationName);
    await knowledgeBasePage.updateLocationDescription(updatedDescription);
    await knowledgeBasePage.closeLocationEditPanel();
    await knowledgeBasePage.expectLocationVisible(locationName);
    await expect(knowledgeBasePage.page.getByText(updatedDescription, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteLocation(locationName);
  });

  test('creates a prop, edits it from the props tab, and deletes it', async ({ dashboardPage, knowledgeBasePage }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Prop');
    const propName = `Compass ${Date.now()}`;
    const description = 'A brass nautical compass.';
    const updatedDescription = 'A brass nautical compass with a cracked lid.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=props');
    await knowledgeBasePage.createProp({ name: propName, description });
    await knowledgeBasePage.openPropForEdit(propName);
    await knowledgeBasePage.updatePropDescription(updatedDescription);
    await knowledgeBasePage.closePropEditPanel();
    await knowledgeBasePage.expectPropVisible(propName);
    await expect(knowledgeBasePage.page.getByText(updatedDescription, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteProp(propName);
  });

  test('creates a scene from the scenes tab and opens its detail route', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Scene');
    const sceneHeading = `INT. HARBOR OFFICE - NIGHT ${Date.now()}`;
    const emotionalTone = 'Tense';
    const conflict = 'The captain refuses to reveal who altered the logbook.';
    const storyNotes = 'This scene should raise the stakes before the harbor raid.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);
    await scriptLibraryPage.createScript();

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=scenes');
    await knowledgeBasePage.createScene({
      heading: sceneHeading,
      emotionalTone,
      conflict,
      storyNotes,
    });
    await knowledgeBasePage.openScene(sceneHeading);
    await expect(knowledgeBasePage.page.getByRole('heading', { name: sceneHeading, exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(knowledgeBasePage.page.getByText('Scene #1', { exact: false })).toBeVisible({ timeout: 10_000 });
    await expect(knowledgeBasePage.page.getByText(emotionalTone, { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(knowledgeBasePage.page.getByText(conflict, { exact: false })).toBeVisible({ timeout: 10_000 });
    await expect(knowledgeBasePage.page.getByText(storyNotes, { exact: false })).toBeVisible({ timeout: 10_000 });
  });

  test('creates a theme, edits it from the themes tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Theme');
    const themeName = `Redemption ${Date.now()}`;
    const description = 'Characters struggle toward redemption.';
    const updatedDescription = 'Characters struggle toward redemption after betrayal.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=themes');
    await knowledgeBasePage.createTheme({ name: themeName, description });
    await knowledgeBasePage.openThemeForEdit(themeName);
    await knowledgeBasePage.updateThemeDescription(updatedDescription);
    await knowledgeBasePage.closeThemeEditPanel();
    await knowledgeBasePage.expectThemeVisible(themeName);
    await expect(knowledgeBasePage.page.getByText(updatedDescription, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteTheme(themeName);
  });

  test('creates a wild card, edits it from the wild cards tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Wildcard');
    const wildcardTitle = `Loose Thread ${Date.now()}`;
    const body = 'A clue that may matter later.';
    const updatedBody = 'A clue that definitely matters later.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=wildcards');
    await knowledgeBasePage.createWildcard({ title: wildcardTitle, body, tag: 'mystery' });
    await knowledgeBasePage.openWildcardForEdit(wildcardTitle);
    await knowledgeBasePage.updateWildcardContent(updatedBody);
    await knowledgeBasePage.expectWildcardVisible(wildcardTitle);
    await expect(knowledgeBasePage.page.getByText(updatedBody, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteWildcard(wildcardTitle);
  });

  test('creates a timeline entry, edits it from the timeline tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Timeline');
    const entryLabel = `Inciting Incident ${Date.now()}`;
    const updatedEntryLabel = `Escalation ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=timeline');
    await knowledgeBasePage.createTimelineEntry({ label: entryLabel, date: '2026-04-28' });
    await knowledgeBasePage.openTimelineEntryForEdit(entryLabel);
    await knowledgeBasePage.updateTimelineEntryLabel(updatedEntryLabel);
    await knowledgeBasePage.expectTimelineEntryVisible(updatedEntryLabel);
    await knowledgeBasePage.deleteTimelineEntry(updatedEntryLabel);
  });

  test('creates a research entry, edits it from the research tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Research');
    const researchTitle = `Harbor Notes ${Date.now()}`;
    const content = 'Initial notes about the harbor district.';
    const updatedContent = 'Updated notes about the harbor district and its hidden tunnels.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=research');
    await knowledgeBasePage.createResearch({ title: researchTitle, content, tags: 'harbor, mystery' });
    await knowledgeBasePage.openResearchForEdit(researchTitle);
    await knowledgeBasePage.updateResearchContent(updatedContent);
    await knowledgeBasePage.expectResearchVisible(researchTitle);
    await expect(knowledgeBasePage.page.getByText(updatedContent, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteResearch(researchTitle);
  });

  test('creates a story arc, edits it from the story arcs tab, and deletes it', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Story Arc');
    const storyArcName = `Harbor Redemption ${Date.now()}`;
    const description = 'A long arc about earning trust back.';
    const updatedDescription = 'A long arc about earning trust back after a public betrayal.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=story-arcs');
    await knowledgeBasePage.createStoryArc({ name: storyArcName, description });
    await knowledgeBasePage.openStoryArcForEdit(storyArcName);
    await knowledgeBasePage.updateStoryArcDescription(updatedDescription);
    await knowledgeBasePage.closeStoryArcEditPanel();
    await knowledgeBasePage.expectStoryArcVisible(storyArcName);
    await expect(knowledgeBasePage.page.getByText(updatedDescription, { exact: false }).first()).toBeVisible({
      timeout: 10_000,
    });
    await knowledgeBasePage.deleteStoryArc(storyArcName);
  });

  test('renders timeline entries in chronological order on the timeline tab', async ({
    dashboardPage,
    knowledgeBasePage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E KB Timeline Order');
    const earlierEntryLabel = `Earlier Event ${Date.now()}`;
    const laterEntryLabel = `Later Event ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=timeline');
    await knowledgeBasePage.createTimelineEntry({ label: laterEntryLabel, date: '2026-04-29' });
    await knowledgeBasePage.createTimelineEntry({ label: earlierEntryLabel, date: '2026-04-27' });
    await knowledgeBasePage.expectTimelineEntriesInOrder([earlierEntryLabel, laterEntryLabel]);
  });
});
