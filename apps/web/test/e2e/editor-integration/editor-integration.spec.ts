import { test } from '../fixtures/base.fixture';
import { ScenePage } from '../pages/scene.page';

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
  test('shows location suggestions in a scene heading after the INT. prefix', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Scene Heading');
    const locationName = `Integration Loft ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=locations');
    await knowledgeBasePage.createLocation({
      name: locationName,
      description: 'Created for scene-heading location suggestion coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.triggerSceneHeadingLocationSuggestions(`INT. /${locationName.slice(0, 8)}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(locationName);
  });

  test('shows time-of-day suggestions after selecting a scene heading location and typing a separator', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Scene Time Of Day');
    const locationName = `Transit Hub ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=locations');
    await knowledgeBasePage.createLocation({
      name: locationName,
      description: 'Created for scene heading time-of-day suggestion coverage.',
      timeOfDay: ['Night', 'Morning'],
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.triggerSceneHeadingLocationSuggestions(`INT. /${locationName.slice(0, 8)}`);
    await scriptEditorPage.selectAutocompleteSuggestion(locationName);
    await scriptEditorPage.expectBlockTextAt(0, locationName);
    await scriptEditorPage.triggerSceneHeadingTimeOfDaySuggestions();
    await scriptEditorPage.expectAutocompleteSuggestionVisible('NIGHT');
    await scriptEditorPage.expectAutocompleteSuggestionVisible('MORNING');
    await scriptEditorPage.selectAutocompleteSuggestion('NIGHT');
    await scriptEditorPage.expectBlockTextAt(0, `INT. ${locationName} - NIGHT`);
  });

  test('opens the scene details editor from the block menu and persists metadata after reload', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Scene Details');
    const sceneHeadingText = `INT. Riverside Cafe ${Date.now()} - NIGHT`;
    const emotionalTone = 'Tense and watchful';
    const conflict = 'Mara hides the recorder before the courier arrives.';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();

    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.expectSceneMetadataPanelVisible(sceneHeadingText);
    await scriptEditorPage.fillSceneMetadata({
      emotionalTone,
      conflict,
    });
    await scriptEditorPage.saveSceneMetadata();
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.expectBlockTextAt(0, sceneHeadingText);

    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.expectSceneMetadataValues({
      emotionalTone,
      conflict,
    });
  });

  test('syncs editor scene character and prop links into the scene detail view after saving', async ({
    dashboardPage,
    knowledgeBasePage,
    page,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const scenePage = new ScenePage(page);
    const projectTitle = createProjectTitle('E2E Integration Scene Entity Detail');
    const sceneHeadingText = `INT. Signal Deck ${Date.now()} - NIGHT`;
    const characterName = `Deck Marshal ${Date.now()}`;
    const propName = `Signal Key ${Date.now()}`;
    const characterQuery = characterName.split(' ')[0];
    const propQuery = propName.split(' ')[0];

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
      description: 'Created for scene detail sync coverage.',
    });

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=props');
    await knowledgeBasePage.createProp({
      name: propName,
      description: 'Created for scene detail sync coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
    await scriptEditorPage.typeAtCurrentSelection(`@${characterQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(characterName);
    await scriptEditorPage.selectAutocompleteSuggestion(characterName);
    await scriptEditorPage.expectMentionVisible('character', characterName);
    await scriptEditorPage.typeAtCurrentSelection(' secures ');
    await scriptEditorPage.typeAtCurrentSelection(`#${propQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(propName);
    await scriptEditorPage.selectAutocompleteSuggestion(propName);
    await scriptEditorPage.expectMentionVisible('prop', propName);
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=scenes');
    await knowledgeBasePage.expectSceneVisible(sceneHeadingText);
    await knowledgeBasePage.openScene(sceneHeadingText);
    await scenePage.expectLoaded({
      heading: sceneHeadingText,
      sceneNumber: 1,
      scriptName: 'Untitled Script',
    });
    await scenePage.expectCharacterVisible(characterName);
    await scenePage.expectPropVisible(propName);
  });

  test('opens a prefilled location create dialog from scene heading quick create', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Scene Quick Create');
    const locationName = `Skybridge Atrium ${Date.now()}`;
    const sceneHeadingQuery = `${locationName} - NIGHT`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.triggerSceneHeadingLocationSuggestions(`INT. /${sceneHeadingQuery}`);
    await scriptEditorPage.expectCreateAutocompleteOptionVisible(sceneHeadingQuery, 'location');
    await scriptEditorPage.selectCreateAutocompleteOption(sceneHeadingQuery, 'location');
    await scriptEditorPage.expectLocationCreateDialogPrefilled(locationName, 'Night');
  });

  test('opens a prefilled character create dialog from character block quick create', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Quick Create');
    const newCharacterName = `QuickCreateHero${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('character');
    await scriptEditorPage.triggerCharacterBlockSuggestions(`/${newCharacterName}`);
    await scriptEditorPage.expectCreateAutocompleteOptionVisible(newCharacterName, 'character');
    await scriptEditorPage.selectCreateAutocompleteOption(newCharacterName, 'character');
    await scriptEditorPage.expectCharacterCreateDialogPrefilled(newCharacterName);
  });

  test('shows and inserts character mentions from the knowledge base in an action block', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Mentions');
    const characterName = `Mention Hero ${Date.now()}`;
    const mentionQuery = characterName.split(' ')[0];

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
      description: 'Created for action-block mention suggestion coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`@${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(characterName);
    await scriptEditorPage.selectAutocompleteSuggestion(characterName);
    await scriptEditorPage.expectMentionVisible('character', characterName);
  });

  test('records character appearances from editor mentions in the character detail view after saving', async ({
    characterPage,
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Character Appearances');
    const sceneHeadingText = `INT. Harbor Watch ${Date.now()} - NIGHT`;
    const characterName = `Signal Keeper ${Date.now()}`;
    const mentionQuery = characterName.split(' ')[0];

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
      description: 'Created for appearance sync coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
    await scriptEditorPage.typeAtCurrentSelection(`@${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(characterName);
    await scriptEditorPage.selectAutocompleteSuggestion(characterName);
    await scriptEditorPage.expectMentionVisible('character', characterName);
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=characters');
    await knowledgeBasePage.openCharacter(characterName);
    await characterPage.expectLoaded(characterName);
    await characterPage.openAppearancesTab();
    await characterPage.expectAppearanceVisible({
      scriptTitle: 'Untitled Script',
      sceneRef: sceneHeadingText,
    });
  });

  test('persists theme tags from selected text and surfaces them in theme appearances', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Theme Tagging');
    const sceneHeadingText = `INT. Lantern Pier ${Date.now()} - NIGHT`;
    const taggedPassage = 'The harbor lights flicker like promises kept.';
    const themeName = `Redemption ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=themes');
    await knowledgeBasePage.createTheme({
      name: themeName,
      description: 'Created for theme tagging coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
    await scriptEditorPage.typeAtCurrentSelection(taggedPassage);
    await scriptEditorPage.selectBlockText(1);
    await scriptEditorPage.applyThemeTag(themeName);
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await scriptEditorPage.reloadAndExpectLoaded();
    await scriptEditorPage.expectThemeTagVisible(themeName, taggedPassage);

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=themes');
    await knowledgeBasePage.openThemeForEdit(themeName);
    await knowledgeBasePage.expectThemeAppearanceVisible(taggedPassage);
  });

  test('persists story arc links from scene metadata and surfaces linked scenes in story arc detail flows', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Story Arc Linking');
    const sceneHeadingText = `INT. Archive Annex ${Date.now()} - NIGHT`;
    const storyArcName = `Main Plot ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=story-arcs');
    await knowledgeBasePage.createStoryArc({
      name: storyArcName,
      description: 'Created for scene metadata story arc linking coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.linkStoryArcInSceneMetadata(storyArcName);
    await scriptEditorPage.expectStoryArcLinkedInSceneMetadata(storyArcName);
    await scriptEditorPage.saveSceneMetadata();
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await scriptEditorPage.reloadAndExpectLoaded();
    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.expectStoryArcLinkedInSceneMetadata(storyArcName);

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=story-arcs');
    await knowledgeBasePage.openStoryArcForEdit(storyArcName);
    await knowledgeBasePage.expectStoryArcKeyBeatVisible(sceneHeadingText);
  });

  test('persists timeline links from scene metadata and surfaces linked scenes in timeline views', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Timeline Linking');
    const sceneHeadingText = `INT. Switchyard Office ${Date.now()} - NIGHT`;
    const timelineLabel = `Day 2 ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=timeline');
    await knowledgeBasePage.createTimelineEntry({
      label: timelineLabel,
      date: '2026-05-01',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectDefaultBlock('scene-heading');
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.linkTimelineEntryInSceneMetadata(timelineLabel);
    await scriptEditorPage.expectTimelineEntryLinkedInSceneMetadata(timelineLabel);
    await scriptEditorPage.saveSceneMetadata();
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await scriptEditorPage.reloadAndExpectLoaded();
    await scriptEditorPage.openSceneMetadataPanel();
    await scriptEditorPage.expectTimelineEntryLinkedInSceneMetadata(timelineLabel);

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=timeline');
    await knowledgeBasePage.openTimelineEntry(timelineLabel);
    await knowledgeBasePage.expectTimelineLinkedSceneVisible(sceneHeadingText);
  });

  test('shows and inserts prop mentions from the knowledge base in an action block', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Prop Mentions');
    const propName = `Signal Device ${Date.now()}`;
    const mentionQuery = propName.split(' ')[0];

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=props');
    await knowledgeBasePage.createProp({
      name: propName,
      description: 'Created for action-block prop mention suggestion coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`#${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(propName);
    await scriptEditorPage.selectAutocompleteSuggestion(propName);
    await scriptEditorPage.expectMentionVisible('prop', propName);
  });

  test('shows and inserts wildcard mentions from the knowledge base in an action block', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Wildcard Mentions');
    const wildcardTitle = `Storm Warning ${Date.now()}`;
    const mentionQuery = wildcardTitle.split(' ')[0];

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    const seriesId = getSeriesIdFromUrl(scriptEditorPage.page.url());
    const scriptId = getScriptIdFromUrl(scriptEditorPage.page.url());

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=wildcards');
    await knowledgeBasePage.createWildcard({
      title: wildcardTitle,
      body: 'Created for action-block wildcard mention suggestion coverage.',
      tag: 'weather',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`!${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(wildcardTitle);
    await scriptEditorPage.selectAutocompleteSuggestion(wildcardTitle);
    await scriptEditorPage.expectMentionVisible('wildcard', wildcardTitle);
  });

  test('shows an orphaned state for deleted character mentions after reloading the editor', async ({
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Orphaned Mention');
    const characterName = `Orphaned Hero ${Date.now()}`;
    const mentionQuery = characterName.split(' ')[0];

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
      description: 'Created for orphaned mention coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`@${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(characterName);
    await scriptEditorPage.selectAutocompleteSuggestion(characterName);
    await scriptEditorPage.expectMentionVisible('character', characterName);
    await scriptEditorPage.saveAndExpectIndicatorCycle();

    await knowledgeBasePage.navigateToKnowledgeBase(seriesId, '?tab=characters');
    await knowledgeBasePage.deleteCharacter(characterName);

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectOrphanedMentionVisible('character', characterName);
  });

  test('updates linked character mentions after the character is renamed in the knowledge base', async ({
    characterPage,
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Rename Mention');
    const originalCharacterName = `Rename Hero ${Date.now()}`;
    const renamedCharacterName = `Renamed Hero ${Date.now()}`;
    const mentionQuery = originalCharacterName.split(' ')[0];

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
      name: originalCharacterName,
      description: 'Created for rename propagation coverage.',
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`@${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(originalCharacterName);
    await scriptEditorPage.selectAutocompleteSuggestion(originalCharacterName);
    await scriptEditorPage.expectMentionVisible('character', originalCharacterName);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.openMentionInKnowledgeBase('character', originalCharacterName);

    await characterPage.expectLoaded(originalCharacterName);
    await characterPage.updateName(renamedCharacterName);

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.expectMentionVisible('character', renamedCharacterName);
    await scriptEditorPage.expectMentionNotVisible('character', originalCharacterName);
  });

  test('shows a character hover preview and opens the character in the knowledge base', async ({
    characterPage,
    dashboardPage,
    knowledgeBasePage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = createProjectTitle('E2E Integration Mention Preview');
    const characterName = `Preview Hero ${Date.now()}`;
    const mentionQuery = characterName.split(' ')[0];
    const description = 'Created for mention hover preview coverage.';

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
      description,
    });

    await scriptEditorPage.navigateToScript(seriesId, scriptId);
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
    await scriptEditorPage.type(`@${mentionQuery}`);
    await scriptEditorPage.expectAutocompleteSuggestionVisible(characterName);
    await scriptEditorPage.selectAutocompleteSuggestion(characterName);
    await scriptEditorPage.expectMentionVisible('character', characterName);
    await scriptEditorPage.hoverMention('character', characterName);
    await scriptEditorPage.expectEntityPreviewVisible(characterName);
    await scriptEditorPage.expectEntityPreviewVisible(description);
    await scriptEditorPage.openMentionInKnowledgeBase('character', characterName);
    await characterPage.expectLoaded(characterName);
  });

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
    const mentionQuery = characterName.charAt(0);

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
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('dialogue');
    await scriptEditorPage.pressEnterAndExpectNextBlock('character');
    await scriptEditorPage.focusBlock(1);
    await scriptEditorPage.typeAtCurrentSelection(`/${mentionQuery}`);
    await scriptEditorPage.expectCharacterSuggestionVisible(characterName);
    await scriptEditorPage.moveAutocompleteSelectionDown();
    await scriptEditorPage.confirmAutocompleteSelection();
    await scriptEditorPage.expectBlockTextAt(1, characterName);
  });
});
