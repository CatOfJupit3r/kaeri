import { expect, test } from '../fixtures/base.fixture';
import { AnalyticsPage } from '../pages/analytics.page';
import { ScenePage } from '../pages/scene.page';

function createProjectTitle(prefix: string) {
  return `${prefix} ${Date.now()}`;
}

test.describe.configure({ mode: 'serial' });

test.describe('Narrative', () => {
  test('loads scene detail metadata and linked entities', async ({
    dashboardPage,
    knowledgeBasePage,
    page,
    scriptLibraryPage,
  }) => {
    test.slow();

    const scenePage = new ScenePage(page);
    const projectTitle = createProjectTitle('E2E Narrative Scene');
    const sceneHeading = `INT. WATCHTOWER - NIGHT ${Date.now()}`;
    const locationName = `Watchtower ${Date.now()}`;
    const propName = `Signal Lantern ${Date.now()}`;
    const characterName = `Ari Voss ${Date.now()}`;
    const emotionalTone = 'Uneasy';
    const conflict = 'Ari must decide whether to light the warning signal.';
    const storyNotes = 'This scene establishes the cost of speaking up too late.';
    const beatDescription = 'Ari notices the fleet crest painted on the incoming ship.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);
    await scriptLibraryPage.createScript();

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=locations');
    await knowledgeBasePage.createLocation({
      name: locationName,
      description: 'A storm-battered tower overlooking the harbor mouth.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=props');
    await knowledgeBasePage.createProp({
      name: propName,
      description: 'An old brass lantern used to signal allied ships.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'A sentry who keeps rewriting the same warning letter.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=scenes');
    await knowledgeBasePage.createScene({
      heading: sceneHeading,
      emotionalTone,
      conflict,
      storyNotes,
    });

    await knowledgeBasePage.openScene(sceneHeading);
    await scenePage.expectLoaded({
      heading: sceneHeading,
      sceneNumber: 1,
      scriptName: 'Untitled Script',
    });
    await expect(page.getByText(emotionalTone, { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(conflict, { exact: false })).toBeVisible({ timeout: 10_000 });
    await scenePage.expectStoryNotes(storyNotes);

    await scenePage.updateLinkedEntities({
      locationName,
      beatDescription,
      characterName,
      propName,
    });
    await scenePage.expectLocationVisible(locationName);
    await scenePage.expectBeatVisible(beatDescription);
    await scenePage.expectCharacterVisible(characterName);
    await scenePage.expectPropVisible(propName);
  });

  test('renders theme panel details for persisted narrative data', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Narrative Theme');
    const themeName = `Signal Duty ${Date.now()}`;
    const characterName = `Keira Holt ${Date.now()}`;
    const motif = 'Lantern reflections';
    const connection = 'She treats every signal as a confession.';
    const evolutionNotes = 'The theme shifts from ritual to rebellion in the pilot.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);
    await scriptLibraryPage.createScript();

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'A signal officer who distrusts ceremonial language.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=themes');
    await knowledgeBasePage.createTheme({
      name: themeName,
      description: 'Who gets to decide when a warning becomes truth.',
    });
    await knowledgeBasePage.openThemeForEdit(themeName);
    await knowledgeBasePage.addThemeVisualMotif(motif);
    await knowledgeBasePage.addThemeRelatedCharacter({ characterName, connection });
    await knowledgeBasePage.addThemeEvolution({
      scriptTitle: 'Untitled Script',
      notes: evolutionNotes,
    });
    await knowledgeBasePage.closeThemeEditPanel();

    await knowledgeBasePage.openThemeForEdit(themeName);
    await knowledgeBasePage.expectThemePanelDetails({
      motif,
      characterName,
      connection,
      scriptTitle: 'Untitled Script',
      evolutionNotes,
    });
  });

  test('renders story arc panel details for persisted narrative data', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Narrative Arc');
    const themeName = `False Dawn ${Date.now()}`;
    const characterName = `Milo Renn ${Date.now()}`;
    const storyArcName = `Harbor Uprising ${Date.now()}`;
    const beatDescription = 'Milo decides to light the harbor beacons before the council vote.';
    const characterRole = 'protagonist';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);
    await scriptLibraryPage.createScript();

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'A harbor clerk learning how public courage sounds.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=themes');
    await knowledgeBasePage.createTheme({
      name: themeName,
      description: 'The cost of announcing the truth before anyone is ready.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=story-arcs');
    await knowledgeBasePage.createStoryArc({
      name: storyArcName,
      description: 'A season-long arc about whether warning people can still save them.',
    });
    await knowledgeBasePage.openStoryArcForEdit(storyArcName);
    await knowledgeBasePage.addStoryArcKeyBeat(beatDescription);
    await knowledgeBasePage.addStoryArcCharacterRole({
      characterName,
      role: characterRole,
    });
    await knowledgeBasePage.addStoryArcTheme(themeName);
    await knowledgeBasePage.closeStoryArcEditPanel();

    await knowledgeBasePage.openStoryArcForEdit(storyArcName);
    await knowledgeBasePage.expectStoryArcPanelDetails({
      beatDescription,
      characterName,
      role: characterRole,
      themeName,
    });
  });

  test('loads paginated audit history for knowledge-base changes', async ({ dashboardPage, knowledgeBasePage }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Narrative History');
    const labelSeed = Date.now();
    const entryLabels = Array.from(
      { length: 21 },
      (_, index) => `History Entry ${labelSeed}-${index.toString().padStart(2, '0')}`,
    );
    const newestLabel = entryLabels[entryLabels.length - 1];
    const oldestLabel = entryLabels[0];

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=timeline');

    for (const [index, label] of entryLabels.entries()) {
      const day = String((index % 28) + 1).padStart(2, '0');

      await knowledgeBasePage.createTimelineEntry(
        {
          label,
          date: `2026-04-${day}`,
        },
        { expectVisible: false },
      );
    }

    await knowledgeBasePage.switchTab('History');
    await knowledgeBasePage.expectHistoryEntryVisible(newestLabel);
    await knowledgeBasePage.expectHistoryEntryNotVisible(oldestLabel);
    await knowledgeBasePage.openHistoryEntry(newestLabel);
    await knowledgeBasePage.expectHistoryEntryExpanded('Created Data');
    await knowledgeBasePage.loadMoreHistory();
    await knowledgeBasePage.expectHistoryEntryVisible(oldestLabel);
  });

  test('loads the analytics dashboard without route errors for a populated series', async ({
    characterPage,
    dashboardPage,
    knowledgeBasePage,
    page,
    scriptLibraryPage,
  }) => {
    test.slow();

    const analyticsPage = new AnalyticsPage(page);
    const scenePage = new ScenePage(page);
    const projectTitle = createProjectTitle('E2E Narrative Analytics');
    const sceneHeading = `EXT. HARBOR GATE - DAWN ${Date.now()}`;
    const locationName = `Harbor Gate ${Date.now()}`;
    const propName = `Brass Whistle ${Date.now()}`;
    const characterName = `Nia Sol ${Date.now()}`;
    const storyArcName = `Signal Fire ${Date.now()}`;
    const beatDescription = 'Nia counts the ships before choosing which alarm to sound.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);
    await scriptLibraryPage.createScript();

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=locations');
    await knowledgeBasePage.createLocation({
      name: locationName,
      description: 'The eastern gate where incoming ships request entry.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=props');
    await knowledgeBasePage.createProp({
      name: propName,
      description: 'A whistle used to distinguish official alarms from rumors.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.createCharacter({
      name: characterName,
      description: 'A watch captain who trusts patterns more than proclamations.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=story-arcs');
    await knowledgeBasePage.createStoryArc({
      name: storyArcName,
      description: 'A story arc about choosing the right alarm before the city turns on itself.',
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=scenes');
    await knowledgeBasePage.createScene({
      heading: sceneHeading,
      emotionalTone: 'Alert',
      conflict: 'Nia knows the wrong signal will start a riot.',
      storyNotes: 'This scene seeds the public stakes of the harbor crisis.',
    });
    await knowledgeBasePage.openScene(sceneHeading);
    await scenePage.updateLinkedEntities({
      locationName,
      beatDescription,
      characterName,
      propName,
    });

    await knowledgeBasePage.navigateToKnowledgeBaseFromCurrentSeries('?tab=characters');
    await knowledgeBasePage.openCharacter(characterName);
    await characterPage.expectLoaded(characterName);
    await characterPage.addAppearance({
      sceneRef: 'Scene 1',
      locationName,
    });

    await analyticsPage.navigateToAnalyticsFromCurrentSeries();
    await analyticsPage.expectSectionVisible('Scenes by Location');
    await analyticsPage.expectSectionVisible('Character Appearances');
    await analyticsPage.expectSectionVisible('Story Arc Progress');
    await analyticsPage.expectSectionTextVisible(locationName);
    await analyticsPage.expectSectionTextVisible(characterName);
    await analyticsPage.expectSectionTextVisible(storyArcName);
  });
});
