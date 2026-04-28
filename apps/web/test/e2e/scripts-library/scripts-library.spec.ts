import { test } from '../fixtures/base.fixture';

const DEFAULT_SCRIPT_TITLE = 'Untitled Script';

function createProjectTitle() {
  return `E2E Project ${Date.now()}`;
}

test.describe.configure({ mode: 'serial' });

test.describe('Scripts library', () => {
  test('creates a script from an empty series and loads the default editor layout', async ({
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
    await scriptEditorPage.expectSplitLayout();
    await scriptEditorPage.expectDefaultBlock();
  });

  test('changes the current block type from the toolbar selector', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Block Type ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('action');
  });

  test('changes the current block type from the floating block menu', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Block Menu ${Date.now()}`;
    const sceneHeadingText = 'INT. BLOCK MENU - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(sceneHeadingText);
    await scriptEditorPage.changeCurrentBlockTypeFromBlockMenu('action');
  });

  test('cycles the current block type with Tab', async ({ dashboardPage, scriptEditorPage, scriptLibraryPage }) => {
    test.slow();

    const projectTitle = `E2E Tab Cycle ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.cycleCurrentBlockTypeWithTab('action');
  });

  test('creates an action block after pressing Enter on a scene heading', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Enter Action ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
  });

  test('creates a dialogue block after pressing Enter on a character block', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Enter Dialogue ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('character');
    await scriptEditorPage.pressEnterAndExpectNextBlock('dialogue');
  });

  test('creates a character block after pressing Enter on a dialogue block', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Enter Character ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('dialogue');
    await scriptEditorPage.pressEnterAndExpectNextBlock('character');
  });

  test('deletes an empty block and keeps the previous block editable on Backspace', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Backspace Delete ${Date.now()}`;
    const blockContent = 'INT. FOCUS RETURN - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
    await scriptEditorPage.pressBackspaceOnCurrentBlock();
    await scriptEditorPage.expectBlockCount(1);
    await scriptEditorPage.expectCurrentBlockType('scene-heading');
    await scriptEditorPage.typeAtCurrentSelection(blockContent);
    await scriptEditorPage.expectContent(blockContent);
  });

  test('does not delete the final remaining block on Backspace', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Backspace Guard ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.pressBackspaceOnCurrentBlock();
    await scriptEditorPage.expectBlockCount(1);
    await scriptEditorPage.expectCurrentBlockType('scene-heading');
  });

  test('moves between adjacent blocks with Arrow keys', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Arrow Navigation ${Date.now()}`;
    const sceneHeadingText = 'INT. ARROW MOVE - DAY';
    const characterText = 'ARROW SPEAKER';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.pressEnterAndExpectNextBlock('action');
    await scriptEditorPage.changeCurrentBlockTypeFromToolbar('character');
    await scriptEditorPage.focusBlockStart(1);
    await scriptEditorPage.pressArrowUpAndExpectToolbarBlockType('Scene Heading');
    await scriptEditorPage.typeAtCurrentSelection(sceneHeadingText);
    await scriptEditorPage.expectBlockTextAt(0, sceneHeadingText);
    await scriptEditorPage.focusBlockEnd(0);
    await scriptEditorPage.pressArrowDownAndExpectToolbarBlockType('Character');
    await scriptEditorPage.typeAtCurrentSelection(characterText);
    await scriptEditorPage.expectBlockTextAt(1, characterText);
  });

  test('adds a new block from the add-block controls', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Add Block ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.expectDefaultBlock();
    await scriptEditorPage.addBlockFromControls('action');
    await scriptEditorPage.expectBlockCount(2);
    await scriptEditorPage.expectBlockTypeAt(1, 'action');
  });

  test('collapses and expands the right panel without losing editor usability', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Panel Toggle ${Date.now()}`;
    const editorContent = 'INT. PANEL TOGGLE - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(editorContent);
    await scriptEditorPage.collapseRightPanel();
    await scriptEditorPage.expectContent(editorContent);
    await scriptEditorPage.expandRightPanel();
    await scriptEditorPage.expectContent(editorContent);
  });

  test('switches between knowledge and canvas tabs without losing editor content', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Panel Tabs ${Date.now()}`;
    const editorContent = 'INT. TAB SWITCH - NIGHT';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(editorContent);
    await scriptEditorPage.switchToCanvasPanel();
    await scriptEditorPage.expectContent(editorContent);
    await scriptEditorPage.switchToKnowledgePanel();
    await scriptEditorPage.expectContent(editorContent);
  });

  test('opens the export dialog with the keyboard shortcut', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Export Shortcut ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.openExportWithShortcut();
    await scriptEditorPage.closeOpenDialog();
  });

  test('opens script settings with the keyboard shortcut', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Settings Shortcut ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.openSettingsWithShortcut();
    await scriptEditorPage.closeOpenDialog();
  });

  test('opens the breakdown dialog from the file menu', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Breakdown Modal ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.openBreakdownFromFileMenu();
    await scriptEditorPage.closeOpenDialog();
  });

  test('opens the table read dialog from the file menu', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Table Read Modal ${Date.now()}`;

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.openTableReadFromFileMenu();
    await scriptEditorPage.closeOpenDialog();
  });

  test('opens and closes keyboard shortcuts without breaking editor typing', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Keyboard Shortcuts ${Date.now()}`;
    const editorContent = 'INT. SHORTCUT PANEL - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.openKeyboardShortcutsPanel();
    await scriptEditorPage.closeKeyboardShortcutsPanel();
    await scriptEditorPage.type(editorContent);
    await scriptEditorPage.expectContent(editorContent);
  });

  test('opens version history and lists a created version', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Versions ${Date.now()}`;
    const editorContent = 'INT. VERSION TEST - DAY';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(editorContent);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.switchToVersionsPanel();
    await scriptEditorPage.saveVersion();
    await scriptEditorPage.expectVersionVisible('v1');
  });

  test('previews a saved version as read-only and restores the draft after dismiss', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Version Preview ${Date.now()}`;
    const versionContent = 'INT. VERSION PREVIEW - DAY';
    const draftSuffix = ' UPDATED';
    const previewTyping = ' SHOULD-NOT-APPEAR';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(versionContent);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.switchToVersionsPanel();
    await scriptEditorPage.saveVersion();
    await scriptEditorPage.expectVersionVisible('v1');

    await scriptEditorPage.type(draftSuffix);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.expectBlockTextAt(0, `${versionContent}${draftSuffix}`);

    await scriptEditorPage.previewVersion('v1');
    await scriptEditorPage.expectBlockTextAt(0, versionContent);
    await scriptEditorPage.expectBlockDoesNotContainTextAt(0, draftSuffix.trim());
    await scriptEditorPage.typeAtCurrentSelection(previewTyping);
    await scriptEditorPage.expectBlockDoesNotContainTextAt(0, previewTyping.trim());

    await scriptEditorPage.dismissVersionPreview();
    await scriptEditorPage.expectBlockTextAt(0, `${versionContent}${draftSuffix}`);
  });

  test('restores a previewed version as the canonical current content', async ({
    dashboardPage,
    scriptEditorPage,
    scriptLibraryPage,
  }) => {
    test.slow();

    const projectTitle = `E2E Version Restore ${Date.now()}`;
    const versionContent = 'INT. VERSION RESTORE - DAY';
    const draftSuffix = ' REWRITE';

    await dashboardPage.navigateToDashboard();
    await dashboardPage.createProject(projectTitle);
    await dashboardPage.openProject(projectTitle);

    await scriptLibraryPage.expectLoaded();
    await scriptLibraryPage.createScript();
    await scriptEditorPage.expectLoaded();
    await scriptEditorPage.type(versionContent);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.switchToVersionsPanel();
    await scriptEditorPage.saveVersion();
    await scriptEditorPage.expectVersionVisible('v1');

    await scriptEditorPage.type(draftSuffix);
    await scriptEditorPage.saveAndExpectIndicatorCycle();
    await scriptEditorPage.expectBlockTextAt(0, `${versionContent}${draftSuffix}`);

    await scriptEditorPage.previewVersion('v1');
    await scriptEditorPage.restorePreviewedVersion();
    await scriptEditorPage.expectBlockTextAt(0, versionContent);
    await scriptEditorPage.expectBlockDoesNotContainTextAt(0, draftSuffix.trim());
    await scriptEditorPage.reloadAndExpectLoaded();
    await scriptEditorPage.expectBlockTextAt(0, versionContent);
    await scriptEditorPage.expectBlockDoesNotContainTextAt(0, draftSuffix.trim());
  });

  test('shows save progress and persists script content after explicit save and reload', async ({
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
