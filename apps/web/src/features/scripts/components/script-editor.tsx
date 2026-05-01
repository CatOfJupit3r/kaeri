import { useQueryClient } from '@tanstack/react-query';
import type { Editor as TiptapEditor } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import History from '@tiptap/extension-history';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';
import type { Mark } from '@tiptap/pm/model';
import { Selection } from '@tiptap/pm/state';
import { EditorContent, useEditor } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LuBookOpen,
  LuChevronLeft,
  LuChevronRight,
  LuHistory,
  LuKeyboard,
  LuPenTool,
  LuPlus,
  LuRotateCcw,
  LuX,
} from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@~/components/ui/tooltip';
import { CanvasBoard } from '@~/features/canvas/components/board';
import { useStoryArcList } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { useThemeList } from '@~/features/themes/hooks/queries/use-theme-list';
import { useTimelineList } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { cn } from '@~/lib/utils';
import client from '@~/utils/orpc';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

import {
  Action,
  Character,
  Dialogue,
  Parenthetical,
  SceneHeading,
  ScriptKeyboardHandler,
  Transition,
} from '../extensions';
import { CharacterBlockSuggestion } from '../extensions/character-block-suggestion';
import type { EntityType } from '../extensions/entity-mention';
import { CharacterMention, PropMention, WildcardMention } from '../extensions/entity-mention';
import { SceneHeadingSuggestion } from '../extensions/scene-heading-suggestion';
import type { iLocationBlockSuggestion } from '../extensions/scene-heading-suggestion';
import { SceneTimeOfDaySuggestion } from '../extensions/scene-time-of-day-suggestion';
import { ThemeMark } from '../extensions/theme-mark';
import { BLOCK_CONFIG } from '../helpers/block-config';
import {
  useAppearanceTracker,
  useKBIntegration,
  useCharacterSuggestions,
  useLocationSuggestions,
  usePropSuggestions,
  useValidateEntityLinks,
  useWildcardSuggestions,
  useSuggestionRenderer,
  useCharacterBlockSuggestionRenderer,
  useSceneHeadingSuggestionRenderer,
  useMentionHoverPreview,
  useAutoVersion,
  useScriptVersion,
  useScriptVersions,
  useRestoreScriptVersion,
} from '../hooks';
import { useSceneTimeOfDaySuggestionRenderer } from '../hooks/use-scene-time-of-day-suggestion-renderer';
import type { ScriptBlockType } from '../types';
import { BLOCK_TYPE_CYCLE_ORDER, SCRIPT_BLOCK_TYPES } from '../types';
import { BlockMenu } from './block-menu';
import { BreakdownModal } from './breakdown-modal';
import { EditorToolbar } from './editor-toolbar';
import { EntityPreviewCard } from './entity-preview';
import { KnowledgeBasePanel } from './knowledge-base-panel';
import { TableReadModal } from './table-read-modal';
import { VersionHistoryPanel } from './version-history-panel';

interface iScriptEditorProps {
  /** Script content as JSON string */
  content: string;
  /** Callback when content changes */
  onContentChange?: (content: string) => void;
  /** Script title */
  title?: string;
  /** Series ID for fetching knowledge base data */
  seriesId: string;
  /** Script ID for KB integration */
  scriptId: string;
  /** Callback to open script settings */
  onOpenSettings?: () => void;
  /** Callback to open export dialog */
  onExport?: () => void;
  /** Callback to trigger an immediate save */
  onSave?: (content: string) => void;
  /** Whether the content is currently saving */
  isSaving?: boolean;
  /** Last edit timestamp */
  lastEditedAt?: Date;
  /** Called when an entity preview should open in the knowledge base */
  onOpenEntityInKnowledgeBase?: (entityId: string, entityType: EntityType) => void;
}

/**
 * Default content for new scripts
 */
const DEFAULT_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'scene-heading',
      content: [],
    },
  ],
};

const LOCATION_TIME_OF_DAY_VALUES = new Set(['dawn', 'morning', 'afternoon', 'evening', 'dusk', 'night']);

interface iTextSelectionRange {
  from: number;
  to: number;
}

interface iThemeAppearanceSyncRecord {
  themeId: string;
  sceneId: string;
  quote: string;
}

interface iStoryArcBeatSyncRecord {
  storyArcId: string;
  sceneId: string;
  description: string;
  sceneNumber: number;
}

interface iTimelineSceneLinkRecord {
  timelineEntryId: string;
  sceneId: string;
}

/**
 * Parse content string to tiptap JSON
 */
function parseContent(content: string): Record<string, unknown> {
  if (!content) return DEFAULT_CONTENT;

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (parsed.type === 'doc') return parsed;
    return DEFAULT_CONTENT;
  } catch {
    // If not valid JSON, convert plain text to blocks
    return convertPlainTextToDoc(content);
  }
}

/**
 * Convert plain text to tiptap document structure
 */
function convertPlainTextToDoc(text: string): Record<string, unknown> {
  const lines = text.split('\n').filter((line) => line.trim());
  if (lines.length === 0) return DEFAULT_CONTENT;

  const content = lines.map((line) => {
    const trimmed = line.trim();
    let type: ScriptBlockType = 'action';

    // Detect block type from content
    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed)) {
      type = 'scene-heading';
    } else if (/^(FADE IN:|FADE OUT|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)$/i.test(trimmed)) {
      type = 'transition';
    } else if (/^\(.*\)$/.test(trimmed)) {
      type = 'parenthetical';
    }

    return {
      type,
      content: trimmed ? [{ type: 'text', text: trimmed }] : [],
    };
  });

  return { type: 'doc', content };
}

function parseSceneHeadingLocationCreateQuery(query: string) {
  const [rawName, rawTimeOfDay] = query.split(/\s*-\s*/, 2);
  const name = rawName?.trim() ?? '';
  const normalizedTimeOfDay = rawTimeOfDay?.trim().toLowerCase() ?? '';

  return {
    name,
    timeOfDay: LOCATION_TIME_OF_DAY_VALUES.has(normalizedTimeOfDay) ? [normalizedTimeOfDay] : [],
  };
}

function getActiveSceneHeadingLocationId(editor: TiptapEditor) {
  const { $from } = editor.state.selection;

  if ($from.parent.type.name !== SCRIPT_BLOCK_TYPES['scene-heading']) {
    return null;
  }

  const { locationId } = $from.parent.attrs;

  return typeof locationId === 'string' && locationId.length > 0 ? locationId : null;
}

function normalizeLocationTimeOfDayOptions(values: string[] | undefined) {
  return Array.from(new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean)));
}

function formatSceneTimeOfDaySuggestion(value: string) {
  return value.toUpperCase();
}

function getSceneHeadingTimeOfDay(sceneRef: string) {
  const [, rawTimeOfDay] = sceneRef.split(/\s*-\s*/, 2);
  const timeOfDay = rawTimeOfDay?.trim();

  return timeOfDay || undefined;
}

function getEntityLinkKey(entityType: string, entityId: string) {
  return `${entityType}:${entityId}`;
}

function getSceneIdsFromDoc(editor: TiptapEditor) {
  const sceneIds = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (node.type.name !== SCRIPT_BLOCK_TYPES['scene-heading']) {
      return true;
    }

    if (typeof node.attrs.sceneId === 'string' && node.attrs.sceneId.length > 0) {
      sceneIds.add(node.attrs.sceneId);
    }

    return true;
  });

  return sceneIds;
}

function extractThemeAppearancesFromDoc(editor: TiptapEditor): iThemeAppearanceSyncRecord[] {
  const themeMarkType = editor.state.schema.marks.theme;

  if (!themeMarkType) {
    return [];
  }

  const seen = new Set<string>();
  const appearances: iThemeAppearanceSyncRecord[] = [];
  let currentSceneId: string | null = null;

  editor.state.doc.descendants((node) => {
    if (node.type.name === SCRIPT_BLOCK_TYPES['scene-heading']) {
      currentSceneId =
        typeof node.attrs.sceneId === 'string' && node.attrs.sceneId.length > 0 ? node.attrs.sceneId : null;
      return true;
    }

    if (!currentSceneId || !node.isText || node.text == null) {
      return true;
    }

    const quote = node.text.trim();

    if (!quote) {
      return true;
    }

    const themeMark = node.marks.find((mark) => mark.type === themeMarkType);

    if (!themeMark || typeof themeMark.attrs.themeId !== 'string' || themeMark.attrs.themeId.length === 0) {
      return true;
    }

    const key = `${themeMark.attrs.themeId}:${currentSceneId}:${quote}`;

    if (seen.has(key)) {
      return true;
    }

    seen.add(key);
    appearances.push({
      themeId: themeMark.attrs.themeId,
      sceneId: currentSceneId,
      quote,
    });

    return true;
  });

  return appearances;
}

function normalizeThemeAppearances(
  appearances: Array<{
    sceneId: string;
    quote?: string;
    notes?: string;
  }>,
) {
  return [...appearances].sort((left, right) => {
    const leftKey = `${left.sceneId}:${left.quote ?? ''}:${left.notes ?? ''}`;
    const rightKey = `${right.sceneId}:${right.quote ?? ''}:${right.notes ?? ''}`;

    return leftKey.localeCompare(rightKey);
  });
}

function extractStoryArcBeatsFromDoc(editor: TiptapEditor): iStoryArcBeatSyncRecord[] {
  const storyArcBeats: iStoryArcBeatSyncRecord[] = [];
  const seen = new Set<string>();
  let sceneNumber = 0;

  editor.state.doc.descendants((node) => {
    if (node.type.name !== SCRIPT_BLOCK_TYPES['scene-heading']) {
      return true;
    }

    sceneNumber += 1;

    const sceneId = typeof node.attrs.sceneId === 'string' && node.attrs.sceneId.length > 0 ? node.attrs.sceneId : null;
    const description = node.textContent.trim();
    const storyArcIds = Array.isArray(node.attrs.storyArcIds)
      ? node.attrs.storyArcIds.filter((storyArcId): storyArcId is string => typeof storyArcId === 'string')
      : [];

    if (!sceneId || !description || storyArcIds.length === 0) {
      return true;
    }

    for (const storyArcId of storyArcIds) {
      const key = `${storyArcId}:${sceneId}`;

      if (!seen.has(key)) {
        seen.add(key);
        storyArcBeats.push({
          storyArcId,
          sceneId,
          description,
          sceneNumber,
        });
      }
    }

    return true;
  });

  return storyArcBeats;
}

function normalizeStoryArcKeyBeats(
  keyBeats: Array<{
    id: string;
    order: number;
    description: string;
    scriptId?: string;
    sceneId?: string;
  }>,
) {
  return [...keyBeats]
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .map((keyBeat, index) => ({
      ...keyBeat,
      order: index,
    }));
}

function extractTimelineSceneLinksFromDoc(editor: TiptapEditor): iTimelineSceneLinkRecord[] {
  const links: iTimelineSceneLinkRecord[] = [];
  const seen = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (node.type.name !== SCRIPT_BLOCK_TYPES['scene-heading']) {
      return true;
    }

    const sceneId = typeof node.attrs.sceneId === 'string' && node.attrs.sceneId.length > 0 ? node.attrs.sceneId : null;
    const timelineEntryId =
      typeof node.attrs.timelineEntryId === 'string' && node.attrs.timelineEntryId.length > 0
        ? node.attrs.timelineEntryId
        : null;

    if (!sceneId || !timelineEntryId) {
      return true;
    }

    const key = `${timelineEntryId}:${sceneId}`;

    if (!seen.has(key)) {
      seen.add(key);
      links.push({ timelineEntryId, sceneId });
    }

    return true;
  });

  return links;
}

function normalizeTimelineLinks(links: Array<{ entityType: string; entityId: string }>) {
  return [...links].sort((left, right) => {
    const leftKey = `${left.entityType}:${left.entityId}`;
    const rightKey = `${right.entityType}:${right.entityId}`;

    return leftKey.localeCompare(rightKey);
  });
}

function getMentionEntityLinks(editor: TiptapEditor): Array<{ entityType: EntityType; entityId: string }> {
  const seenLinks = new Set<string>();
  const links: Array<{ entityType: EntityType; entityId: string }> = [];

  editor.state.doc.descendants((node) => {
    node.marks.forEach((mark) => {
      if (mark.type.name !== 'mention') {
        return;
      }

      const { entityId, entityType } = mark.attrs;

      if (
        typeof entityId !== 'string' ||
        (entityType !== 'character' && entityType !== 'prop' && entityType !== 'wildcard')
      ) {
        return;
      }

      const key = `${entityType}:${entityId}`;

      if (seenLinks.has(key)) {
        return;
      }

      seenLinks.add(key);
      links.push({ entityType, entityId });
    });

    return true;
  });

  return links;
}

function syncMentionMarks(
  editor: TiptapEditor,
  orphanedEntityIds: Set<string>,
  resolvedEntityNamesByKey: Map<string, string>,
) {
  const mentionMarkType = editor.state.schema.marks.mention;

  if (!mentionMarkType) {
    return false;
  }

  const updates: Array<{ from: number; to: number; text: string; marks: Mark[] }> = [];

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || node.text == null || node.text.length === 0) {
      return true;
    }

    const mentionMark = node.marks.find((mark) => mark.type === mentionMarkType);

    if (
      !mentionMark ||
      typeof mentionMark.attrs.entityId !== 'string' ||
      typeof mentionMark.attrs.entityType !== 'string'
    ) {
      return true;
    }

    const entityKey = getEntityLinkKey(mentionMark.attrs.entityType, mentionMark.attrs.entityId);
    const resolvedEntityName = resolvedEntityNamesByKey.get(entityKey);
    const nextEntityName = resolvedEntityName ?? mentionMark.attrs.entityName ?? node.text;
    const isOrphaned = orphanedEntityIds.has(mentionMark.attrs.entityId);
    const nextText = resolvedEntityName && !isOrphaned ? resolvedEntityName : node.text;
    const isCurrentlyOrphaned = mentionMark.attrs.orphaned === true;
    const isNameChanged = nextEntityName !== (mentionMark.attrs.entityName ?? node.text);
    const isTextChanged = nextText !== node.text;

    if (!isTextChanged && !isNameChanged && isOrphaned === isCurrentlyOrphaned) {
      return true;
    }

    updates.push({
      from: pos,
      to: pos + node.nodeSize,
      text: nextText,
      marks: node.marks.map((mark) =>
        mark.type === mentionMark.type
          ? mentionMark.type.create({
              ...mentionMark.attrs,
              entityName: nextEntityName,
              orphaned: isOrphaned,
            })
          : mark,
      ),
    });

    return true;
  });

  if (updates.length === 0) {
    return false;
  }

  const transaction = editor.state.tr;

  for (const update of [...updates].reverse()) {
    transaction.replaceWith(update.from, update.to, editor.state.schema.text(update.text, update.marks));
  }

  editor.view.dispatch(transaction);
  return true;
}

export function ScriptEditor({
  content,
  onContentChange,
  title,
  seriesId,
  scriptId,
  onOpenSettings,
  onExport,
  onSave,
  isSaving,
  lastEditedAt,
  onOpenEntityInKnowledgeBase,
}: iScriptEditorProps) {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mentionValidationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const isPreviewingRef = useRef(false);
  const [rightPanelTab, setRightPanelTab] = useState('knowledge');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isShowingKeyboardShortcuts, setIsShowingKeyboardShortcuts] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isTableReadOpen, setIsTableReadOpen] = useState(false);
  const [previewingVersionId, setPreviewingVersionId] = useState<string | null>(null);
  const [textSelectionRange, setTextSelectionRange] = useState<iTextSelectionRange | null>(null);
  const [characterCreateRequest, setCharacterCreateRequest] = useState<{ requestId: number; name: string } | null>(
    null,
  );
  const [locationCreateRequest, setLocationCreateRequest] = useState<{
    requestId: number;
    name: string;
    timeOfDay: string[];
  } | null>(null);
  const [activeSceneHeadingLocationId, setActiveSceneHeadingLocationId] = useState<string | null>(null);
  const [sceneHeadingTimeOfDayByLocationId, setSceneHeadingTimeOfDayByLocationId] = useState<Record<string, string[]>>(
    {},
  );

  // Auto-version on tab blur / page close
  const { markContentChanged } = useAutoVersion({ scriptId, enabled: !!scriptId });

  // Version data
  const { data: versions } = useScriptVersions(scriptId);
  const { data: previewVersion } = useScriptVersion(scriptId, previewingVersionId ?? '');
  const { restoreVersion, isPending: isRestoringVersion } = useRestoreScriptVersion();
  const { data: storyArcListData } = useStoryArcList(seriesId, { limit: 100, offset: 0 });
  const { data: timelineListData } = useTimelineList(seriesId, 100, 0);
  const { validateLinksAsync } = useValidateEntityLinks();
  const { data: themeListData } = useThemeList(seriesId, 100, 0);

  // Entity mention suggestion query states
  const [characterQuery, setCharacterQuery] = useState('');
  const [propQuery, setPropQuery] = useState('');
  const [wildcardQuery, setWildcardQuery] = useState('');

  // Character block suggestion query (auto-trigger in character blocks)
  const [characterBlockQuery, setCharacterBlockQuery] = useState('');

  // Scene heading suggestion query (auto-trigger for locations)
  const [locationQuery, setLocationQuery] = useState('');

  const sceneTimeOfDaySuggestions = useMemo(() => {
    if (!activeSceneHeadingLocationId) {
      return [];
    }

    return (sceneHeadingTimeOfDayByLocationId[activeSceneHeadingLocationId] ?? []).map((value) => ({
      _id: value,
      name: formatSceneTimeOfDaySuggestion(value),
    }));
  }, [activeSceneHeadingLocationId, sceneHeadingTimeOfDayByLocationId]);

  const themeOptions = useMemo(
    () => (themeListData?.items ?? []).map((theme) => ({ id: theme._id, name: theme.name, color: theme.color })),
    [themeListData?.items],
  );

  // Fetch entity suggestions for autocomplete
  const { suggestions: characterSuggestions, isLoading: isLoadingCharacters } = useCharacterSuggestions(
    seriesId,
    characterQuery,
    { scriptId },
  );
  const { suggestions: propSuggestions, isLoading: isLoadingProps } = usePropSuggestions(seriesId, propQuery, {
    scriptId,
  });
  const { suggestions: wildcardSuggestions, isLoading: isLoadingWildcard } = useWildcardSuggestions(
    seriesId,
    wildcardQuery,
    { scriptId },
  );

  // Fetch character suggestions for character block autocomplete
  const { suggestions: characterBlockSuggestions, isLoading: isLoadingCharacterBlock } = useCharacterSuggestions(
    seriesId,
    characterBlockQuery,
    { scriptId },
  );

  // Fetch location suggestions for scene heading autocomplete
  const { suggestions: locationSuggestions, isLoading: isLoadingLocations } = useLocationSuggestions(
    seriesId,
    locationQuery,
    { scriptId },
  );

  // Create suggestion renderer configurations for each mention type
  const characterSuggestionConfig = useSuggestionRenderer({
    entityType: 'character',
    suggestions: characterSuggestions,
    isLoading: isLoadingCharacters,
    onQueryChange: setCharacterQuery,
    onSelect: () => {
      // Entity is inserted by the extension command
    },
  });

  const propSuggestionConfig = useSuggestionRenderer({
    entityType: 'prop',
    suggestions: propSuggestions,
    isLoading: isLoadingProps,
    onQueryChange: setPropQuery,
    onSelect: () => {
      // Entity is inserted by the extension command
    },
  });

  const wildcardSuggestionConfig = useSuggestionRenderer({
    entityType: 'wildcard',
    suggestions: wildcardSuggestions,
    isLoading: isLoadingWildcard,
    onQueryChange: setWildcardQuery,
    onSelect: () => {
      // Entity is inserted by the extension command
    },
  });

  const handleCharacterQuickCreateRequest = useCallback((name: string) => {
    setRightPanelTab('knowledge');
    setIsRightPanelCollapsed(false);
    setCharacterCreateRequest({ requestId: Date.now(), name });
  }, []);

  const handleLocationQuickCreateRequest = useCallback((query: string) => {
    const parsedLocation = parseSceneHeadingLocationCreateQuery(query);

    if (!parsedLocation.name) {
      return;
    }

    setRightPanelTab('knowledge');
    setIsRightPanelCollapsed(false);
    setLocationCreateRequest({ requestId: Date.now(), ...parsedLocation });
  }, []);

  const handleSceneHeadingLocationSelect = useCallback((location: iLocationBlockSuggestion) => {
    setActiveSceneHeadingLocationId(location._id);
    setSceneHeadingTimeOfDayByLocationId((current) => ({
      ...current,
      [location._id]: normalizeLocationTimeOfDayOptions(location.timeOfDay),
    }));
  }, []);

  const syncActiveSceneHeadingLocationId = useCallback((nextEditor: TiptapEditor) => {
    setActiveSceneHeadingLocationId(getActiveSceneHeadingLocationId(nextEditor));
  }, []);

  // Character block suggestion config (auto-triggers in character blocks)
  const characterBlockSuggestionConfig = useCharacterBlockSuggestionRenderer({
    suggestions: characterBlockSuggestions,
    isLoading: isLoadingCharacterBlock,
    onQueryChange: setCharacterBlockQuery,
    onSelect: () => {
      // Character is linked by the extension command
    },
    onCreate: handleCharacterQuickCreateRequest,
  });

  // Scene heading suggestion config (auto-triggers for locations)
  const sceneHeadingSuggestionConfig = useSceneHeadingSuggestionRenderer({
    suggestions: locationSuggestions,
    isLoading: isLoadingLocations,
    onQueryChange: setLocationQuery,
    onSelect: handleSceneHeadingLocationSelect,
    onCreate: handleLocationQuickCreateRequest,
  });

  const sceneTimeOfDaySuggestionConfig = useSceneTimeOfDaySuggestionRenderer({
    suggestions: sceneTimeOfDaySuggestions,
    isLoading: false,
    onSelect: () => {
      // Time of day is inserted by the extension command
    },
  });

  let requestedKnowledgeBaseTab: 'characters' | 'locations' | undefined;

  if (characterCreateRequest) {
    requestedKnowledgeBaseTab = 'characters';
  } else if (locationCreateRequest) {
    requestedKnowledgeBaseTab = 'locations';
  }

  // KB integration for scene tracking and entity mentions
  const { extensions: kbExtensions, scenes } = useKBIntegration({
    seriesId,
    scriptId,
  });

  const validateMentionLinks = useCallback(
    async (nextEditor: TiptapEditor) => {
      const mentionLinks = getMentionEntityLinks(nextEditor);

      if (mentionLinks.length === 0) {
        syncMentionMarks(nextEditor, new Set(), new Map());
        return;
      }

      const validationResult = await validateLinksAsync({
        seriesId,
        links: mentionLinks,
      });

      syncMentionMarks(
        nextEditor,
        new Set(validationResult.orphaned),
        new Map(
          validationResult.resolved.map((entity) => [
            getEntityLinkKey(entity.entityType, entity.entityId),
            entity.entityName,
          ]),
        ),
      );
    },
    [seriesId, validateLinksAsync],
  );

  const scheduleMentionValidation = useCallback(
    (nextEditor: TiptapEditor) => {
      if (mentionValidationRef.current) {
        clearTimeout(mentionValidationRef.current);
      }

      mentionValidationRef.current = setTimeout(() => {
        void validateMentionLinks(nextEditor);
      }, 200);
    },
    [validateMentionLinks],
  );

  const syncTextSelectionRange = useCallback((nextEditor: TiptapEditor) => {
    const { selection, doc } = nextEditor.state;

    if (
      selection.empty ||
      !selection.$from.sameParent(selection.$to) ||
      !selection.$from.parent.isTextblock ||
      doc.textBetween(selection.from, selection.to, ' ').trim().length === 0
    ) {
      setTextSelectionRange(null);
      return;
    }

    setTextSelectionRange({ from: selection.from, to: selection.to });
  }, []);

  // Memoize all extensions to prevent unnecessary re-renders
  const editorExtensions = useMemo(
    () => [
      Document,
      Text,
      Bold,
      Italic,
      Underline,
      History,
      Dropcursor,
      Gapcursor,
      Placeholder.configure({
        placeholder: ({ node }) => {
          const type = node.type.name as ScriptBlockType;
          return BLOCK_CONFIG[type]?.placeholder ?? 'Type something...';
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      // Custom screenplay block nodes
      SceneHeading,
      Action,
      Character,
      Dialogue,
      Parenthetical,
      Transition,
      // Custom keyboard handling
      ScriptKeyboardHandler,
      // KB integration extensions (scene metadata, mention marks)
      ...kbExtensions,
      ThemeMark,
      // Entity mention extensions with configured autocomplete
      CharacterMention.configure({
        suggestion: characterSuggestionConfig,
      }),
      PropMention.configure({
        suggestion: propSuggestionConfig,
      }),
      WildcardMention.configure({
        suggestion: wildcardSuggestionConfig,
      }),
      // Character block autocomplete (auto-triggers when typing in character blocks)
      CharacterBlockSuggestion.configure({
        suggestion: characterBlockSuggestionConfig,
      }),
      // Scene heading autocomplete (auto-triggers for locations after INT./EXT.)
      SceneHeadingSuggestion.configure({
        suggestion: sceneHeadingSuggestionConfig,
      }),
      // Scene heading time-of-day autocomplete (auto-triggers after typing ` - `)
      SceneTimeOfDaySuggestion.configure({
        suggestion: sceneTimeOfDaySuggestionConfig,
      }),
    ],
    [
      kbExtensions,
      characterSuggestionConfig,
      propSuggestionConfig,
      wildcardSuggestionConfig,
      characterBlockSuggestionConfig,
      sceneHeadingSuggestionConfig,
      sceneTimeOfDaySuggestionConfig,
    ],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content: parseContent(content),
    editorProps: {
      attributes: {
        class: 'script-editor-content prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor: e }) => {
      syncActiveSceneHeadingLocationId(e);
      syncTextSelectionRange(e);
      scheduleMentionValidation(e);

      // Skip autosave when previewing a version — the content is read-only and not the user's work
      if (isPreviewingRef.current) return;

      // Debounce content changes for autosave
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const json = e.getJSON();
        onContentChange?.(JSON.stringify(json));
      }, 300);
      markContentChanged();
    },
    onSelectionUpdate: ({ editor: e }) => {
      syncActiveSceneHeadingLocationId(e);
      syncTextSelectionRange(e);
    },
  });

  const handleApplyTheme = useCallback(
    (theme: { id: string; name: string; color?: string }) => {
      if (!editor || !textSelectionRange) {
        return;
      }

      editor
        .chain()
        .focus()
        .setTextSelection(textSelectionRange)
        .setTheme({
          themeId: theme.id,
          themeName: theme.name,
          themeColor: theme.color,
        })
        .run();
    },
    [editor, textSelectionRange],
  );

  const { sync: syncAppearances } = useAppearanceTracker({
    editor,
    scriptId,
    seriesId,
  });

  const syncThemeAppearances = useCallback(async () => {
    if (!editor) {
      return;
    }

    const currentSceneIds = getSceneIdsFromDoc(editor);
    const themeAppearances = extractThemeAppearancesFromDoc(editor);
    const themes = themeListData?.items ?? [];

    if (themes.length === 0) {
      return;
    }

    const updates = themes.flatMap((theme) => {
      const existingOtherAppearances = (theme.appearances ?? []).filter(
        (appearance) => !currentSceneIds.has(appearance.sceneId),
      );
      const nextAppearances = normalizeThemeAppearances([
        ...existingOtherAppearances,
        ...themeAppearances
          .filter((appearance) => appearance.themeId === theme._id)
          .map((appearance) => ({
            sceneId: appearance.sceneId,
            quote: appearance.quote,
          })),
      ]);
      const currentAppearances = normalizeThemeAppearances(theme.appearances ?? []);

      if (JSON.stringify(currentAppearances) === JSON.stringify(nextAppearances)) {
        return [];
      }

      return [
        client.theme.updateTheme({
          themeId: theme._id,
          patch: {
            appearances: nextAppearances,
          },
        }),
      ];
    });

    if (updates.length === 0) {
      return;
    }

    await Promise.all(updates);
    await queryClient.invalidateQueries({
      queryKey: tanstackRPC.theme.listThemesBySeries.queryKey({
        input: { seriesId, limit: 100, offset: 0 },
      }),
    });
    await queryClient.invalidateQueries({
      predicate: (query) => Array.isArray(query.queryKey) && JSON.stringify(query.queryKey).includes('"theme"'),
    });
  }, [editor, queryClient, seriesId, themeListData?.items]);

  const syncStoryArcBeats = useCallback(async () => {
    if (!editor) {
      return;
    }

    const currentSceneIds = getSceneIdsFromDoc(editor);
    const storyArcBeats = extractStoryArcBeatsFromDoc(editor);
    const storyArcs = storyArcListData?.items ?? [];

    if (storyArcs.length === 0) {
      return;
    }

    const updates = storyArcs.flatMap((storyArc) => {
      const retainedKeyBeats = (storyArc.keyBeats ?? []).filter(
        (keyBeat) => !keyBeat.sceneId || !currentSceneIds.has(keyBeat.sceneId),
      );
      const derivedKeyBeats = storyArcBeats
        .filter((storyArcBeat) => storyArcBeat.storyArcId === storyArc._id)
        .sort((left, right) => left.sceneNumber - right.sceneNumber || left.sceneId.localeCompare(right.sceneId))
        .map((storyArcBeat, index) => ({
          id: `scene-link:${storyArcBeat.sceneId}`,
          order: retainedKeyBeats.length + index,
          description: storyArcBeat.description,
          scriptId,
          sceneId: storyArcBeat.sceneId,
        }));
      const nextKeyBeats = normalizeStoryArcKeyBeats([...retainedKeyBeats, ...derivedKeyBeats]);
      const currentKeyBeats = normalizeStoryArcKeyBeats(storyArc.keyBeats ?? []);

      if (JSON.stringify(currentKeyBeats) === JSON.stringify(nextKeyBeats)) {
        return [];
      }

      return [
        client.storyArc.updateStoryArc({
          storyArcId: storyArc._id,
          patch: {
            keyBeats: nextKeyBeats,
          },
        }),
      ];
    });

    if (updates.length === 0) {
      return;
    }

    await Promise.all(updates);
    await queryClient.invalidateQueries({
      queryKey: tanstackRPC.storyArc.listStoryArcs.queryKey({
        input: { seriesId, limit: 100, offset: 0 },
      }),
    });
    await queryClient.invalidateQueries({
      predicate: (query) => Array.isArray(query.queryKey) && JSON.stringify(query.queryKey).includes('"storyArc"'),
    });
  }, [editor, queryClient, scriptId, seriesId, storyArcListData?.items]);

  const syncTimelineLinks = useCallback(async () => {
    if (!editor) {
      return;
    }

    const currentSceneIds = getSceneIdsFromDoc(editor);
    const timelineSceneLinks = extractTimelineSceneLinksFromDoc(editor);
    const timelineEntries = timelineListData?.items ?? [];

    if (timelineEntries.length === 0) {
      return;
    }

    const updates = timelineEntries.flatMap((timelineEntry) => {
      const retainedLinks = (timelineEntry.links ?? []).filter(
        (link) => link.entityType !== 'scene' || !currentSceneIds.has(link.entityId),
      );
      const derivedLinks = timelineSceneLinks
        .filter((timelineSceneLink) => timelineSceneLink.timelineEntryId === timelineEntry._id)
        .map((timelineSceneLink) => ({
          entityType: 'scene',
          entityId: timelineSceneLink.sceneId,
        }));
      const nextLinks = normalizeTimelineLinks([...retainedLinks, ...derivedLinks]);
      const currentLinks = normalizeTimelineLinks(timelineEntry.links ?? []);

      if (JSON.stringify(currentLinks) === JSON.stringify(nextLinks)) {
        return [];
      }

      return [
        client.knowledgeBase.timeline.update({
          id: timelineEntry._id,
          seriesId,
          patch: {
            links: nextLinks,
          },
        }),
      ];
    });

    if (updates.length === 0) {
      return;
    }

    await Promise.all(updates);
    await queryClient.invalidateQueries({
      queryKey: tanstackRPC.knowledgeBase.timeline.list.queryKey({
        input: { seriesId, limit: 100, offset: 0 },
      }),
    });
    await queryClient.invalidateQueries({
      predicate: (query) => Array.isArray(query.queryKey) && JSON.stringify(query.queryKey).includes('"timeline"'),
    });
  }, [editor, queryClient, seriesId, timelineListData?.items]);

  const ensureSceneEntities = useCallback(async () => {
    if (!editor) {
      return;
    }

    const scenesToEnsure = scenes
      .map((scene) => {
        const sceneRef = scene.sceneRef.trim();

        return sceneRef ? { ...scene, sceneRef } : null;
      })
      .filter((scene): scene is (typeof scenes)[number] & { sceneRef: string } => scene !== null);

    if (scenesToEnsure.length === 0) {
      return;
    }

    const ensuredScenes = await Promise.all(
      scenesToEnsure.map(async (scene) => {
        const result = await client.scriptKBIntegration.ensureScene({
          scriptId,
          seriesId,
          heading: scene.sceneRef,
          sceneNumber: scene.sceneNumber,
          locationId: scene.locationId ?? undefined,
          timeOfDay: getSceneHeadingTimeOfDay(scene.sceneRef),
        });

        return {
          pos: scene.pos,
          sceneId: result.scene._id,
          sceneRef: scene.sceneRef,
        };
      }),
    );

    const transaction = editor.state.tr;
    let hasChanges = false;

    for (const ensuredScene of ensuredScenes) {
      const node = transaction.doc.nodeAt(ensuredScene.pos);

      if (
        node?.type.name === SCRIPT_BLOCK_TYPES['scene-heading'] &&
        (node.attrs.sceneId !== ensuredScene.sceneId || node.attrs.sceneRef !== ensuredScene.sceneRef)
      ) {
        transaction.setNodeMarkup(ensuredScene.pos, undefined, {
          ...node.attrs,
          sceneId: ensuredScene.sceneId,
          sceneRef: ensuredScene.sceneRef,
        });
        hasChanges = true;
      }
    }

    if (hasChanges) {
      editor.view.dispatch(transaction);
    }
  }, [editor, scenes, scriptId, seriesId]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    syncActiveSceneHeadingLocationId(editor);
    syncTextSelectionRange(editor);
    scheduleMentionValidation(editor);
  }, [editor, scheduleMentionValidation, syncActiveSceneHeadingLocationId, syncTextSelectionRange]);

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (mentionValidationRef.current) clearTimeout(mentionValidationRef.current);
    },
    [],
  );

  // Scroll to bottom when editor loads - users typically edit from bottom to top
  useEffect(() => {
    if (!editor || !editorScrollRef.current) return undefined;

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (editorScrollRef.current) {
        editorScrollRef.current.scrollTop = editorScrollRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [editor]);

  // Version preview: swap editor content and toggle read-only
  const savedContentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!editor) return;

    if (previewingVersionId && previewVersion?.content) {
      // Save current content before showing preview
      savedContentRef.current ??= JSON.stringify(editor.getJSON());
      isPreviewingRef.current = true;
      editor.setEditable(false);
      editor.commands.setContent(parseContent(previewVersion.content));
    } else if (!previewingVersionId && savedContentRef.current !== null) {
      // Restore original content
      isPreviewingRef.current = false;
      editor.commands.setContent(parseContent(savedContentRef.current));
      editor.setEditable(true);
      savedContentRef.current = null;
    }
  }, [editor, previewingVersionId, previewVersion?.content]);

  const handleDismissPreview = useCallback(() => {
    setPreviewingVersionId(null);
  }, []);

  const handleRestorePreviewedVersion = useCallback(() => {
    if (!previewingVersionId || !editor) return;
    restoreVersion(
      { scriptId, versionId: previewingVersionId },
      {
        onSuccess: () => {
          // The restored content is now the canonical version — don't restore stale saved content
          savedContentRef.current = null;
          isPreviewingRef.current = false;
          editor.setEditable(true);
          setPreviewingVersionId(null);
        },
      },
    );
  }, [previewingVersionId, scriptId, restoreVersion, editor]);

  const addBlock = useCallback(
    (type: ScriptBlockType) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .command(({ tr, dispatch, state }) => {
          if (dispatch) {
            const nodeType = state.schema.nodes[type];
            if (nodeType) {
              const endPos = state.doc.content.size;
              const newNode = nodeType.create();
              tr.insert(endPos, newNode);
              // Move cursor to the new block
              tr.setSelection(Selection.near(tr.doc.resolve(endPos + 1)));
            }
          }
          return true;
        })
        .run();

      // Scroll to the new block after DOM update
      requestAnimationFrame(() => {
        if (editorScrollRef.current) {
          editorScrollRef.current.scrollTo({
            top: editorScrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    },
    [editor],
  );

  const getCurrentBlockType = useCallback((): ScriptBlockType | null => {
    if (!editor) return null;
    const { $from } = editor.state.selection;
    return $from.parent.type.name as ScriptBlockType;
  }, [editor]);

  // Mention hover preview integration
  const { previewState, hidePreview, handleOpenInKB, onCardMouseEnter, onCardMouseLeave } = useMentionHoverPreview({
    editor,
    delay: 500,
    onNavigateToKB: onOpenEntityInKnowledgeBase,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <EditorToolbar
        editor={editor}
        title={title}
        onOpenSettings={onOpenSettings}
        onExport={onExport}
        onSave={
          editor == null
            ? undefined
            : async () => {
                try {
                  await ensureSceneEntities();
                  await syncAppearances();
                  await syncStoryArcBeats();
                  await syncTimelineLinks();
                  await syncThemeAppearances();
                } finally {
                  onSave?.(JSON.stringify(editor.getJSON()));
                }
              }
        }
        onBreakdown={() => setIsBreakdownOpen(true)}
        onTableRead={() => setIsTableReadOpen(true)}
        isSaving={isSaving}
        lastEditedAt={lastEditedAt}
        currentBlockType={getCurrentBlockType()}
        onChangeBlockType={(type) => {
          editor?.chain().focus().setNode(type).run();
        }}
        versionCount={versions?.total}
        onShowVersions={() => {
          setRightPanelTab('versions');
          setIsRightPanelCollapsed(false);
        }}
        canApplyTheme={textSelectionRange !== null}
        themeOptions={themeOptions}
        onApplyTheme={handleApplyTheme}
      />

      {/* Breakdown Modal */}
      <BreakdownModal open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen} content={content} scriptTitle={title} />

      {/* Table Read Modal */}
      <TableReadModal open={isTableReadOpen} onOpenChange={setIsTableReadOpen} content={content} scriptTitle={title} />

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Editor Panel */}
        <div
          className={cn(
            'flex w-full flex-col overflow-hidden border-b border-border transition-all duration-300 lg:border-r lg:border-b-0',
            isRightPanelCollapsed ? 'h-full lg:w-full' : 'h-1/2 lg:h-full lg:w-1/2',
          )}
        >
          {/* Version Preview Banner */}
          {previewingVersionId ? (
            <div className="flex items-center justify-between border-b-2 border-foreground bg-amber-100 px-4 py-2 dark:bg-amber-900/30">
              <span className="text-sm font-medium">
                Previewing version {previewVersion?.version ?? '...'}
                {previewVersion?.name ? ` — ${previewVersion.name}` : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleRestorePreviewedVersion}
                  disabled={isRestoringVersion}
                >
                  <LuRotateCcw className="mr-1 h-3 w-3" />
                  Restore this version
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDismissPreview}>
                  <LuX className="mr-1 h-3 w-3" />
                  Back to current
                </Button>
              </div>
            </div>
          ) : null}

          {/* Editor Content */}
          <div ref={editorScrollRef} data-testid="script-editor" className="relative flex-1 overflow-y-auto pl-16">
            {editor ? <BlockMenu editor={editor} containerRef={editorScrollRef} seriesId={seriesId} /> : null}
            <EditorContent editor={editor} className="h-full" />
          </div>

          {/* Add Block Button */}
          <div className="border-t border-border p-3">
            <div data-testid="add-block-controls" className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Add block:</span>
              {BLOCK_TYPE_CYCLE_ORDER.map((type) => {
                const config = BLOCK_CONFIG[type];
                return (
                  <Button
                    key={type}
                    data-testid={`add-block-${type}`}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(type)}
                    className="gap-1.5 text-xs"
                    style={{
                      borderColor: config.borderColorVar,
                    }}
                  >
                    {config.icon}
                    <span className="hidden sm:inline">{config.label}</span>
                  </Button>
                );
              })}
              <Button
                data-testid="add-block-action-quick"
                variant="outline"
                size="sm"
                onClick={() => addBlock('action')}
                className="gap-1"
              >
                <LuPlus className="h-4 w-4" />
              </Button>

              {/* Keyboard Shortcuts Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      data-testid="keyboard-shortcuts-toggle"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsShowingKeyboardShortcuts(!isShowingKeyboardShortcuts)}
                      className="ml-auto gap-1.5 text-xs text-muted-foreground"
                    >
                      <LuKeyboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Shortcuts</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show keyboard shortcuts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Keyboard Shortcuts Panel */}
          {isShowingKeyboardShortcuts ? (
            <div
              data-testid="keyboard-shortcuts-panel"
              className="animate-in border-t border-border bg-muted/50 p-3 slide-in-from-bottom-2"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">Keyboard Shortcuts</span>
                <Button
                  data-testid="keyboard-shortcuts-close"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsShowingKeyboardShortcuts(false)}
                >
                  <LuX className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Enter</span>
                  <span>New block</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Tab</span>
                  <span>Next type</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Shift+Tab</span>
                  <span>Previous type</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Backspace</span>
                  <span>Delete empty</span>
                </div>
                {BLOCK_TYPE_CYCLE_ORDER.map((type, index) => {
                  const config = BLOCK_CONFIG[type];
                  return (
                    <div key={type} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Ctrl+{index + 1}</span>
                      <span className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Panel Toggle Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="right-panel-toggle"
                variant="outline"
                size="sm"
                className={cn(
                  'absolute top-2 z-50 hidden h-8 w-8 border-2 border-foreground p-0 shadow-[2px_2px_0px_rgb(0,0,0)] lg:flex',
                  isRightPanelCollapsed ? 'right-2' : 'right-[51%]',
                )}
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
              >
                {isRightPanelCollapsed ? <LuChevronLeft className="h-4 w-4" /> : <LuChevronRight className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isRightPanelCollapsed ? 'Show panel' : 'Hide panel'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Right Panel - Knowledge Base / Canvas */}
        <div
          className={cn(
            'flex w-full flex-col overflow-hidden transition-all duration-300',
            isRightPanelCollapsed ? 'hidden lg:hidden' : 'h-1/2 lg:h-full lg:w-1/2',
          )}
        >
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex h-full flex-col">
            <TabsList className="h-auto shrink-0 justify-start gap-0 border-b-2 border-foreground bg-card p-0">
              <TabsTrigger
                value="knowledge"
                className="flex-1 gap-2 border-r-2 border-foreground py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-blue) data-[state=active]:text-white"
              >
                <LuBookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </TabsTrigger>
              <TabsTrigger
                value="canvas"
                className="flex-1 gap-2 py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-pink)"
              >
                <LuPenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Canvas</span>
              </TabsTrigger>
              <TabsTrigger
                value="versions"
                className="flex-1 gap-2 border-l-2 border-foreground py-3 font-black tracking-wide uppercase data-[state=active]:bg-(--brutalist-yellow)"
              >
                <LuHistory className="h-4 w-4" />
                <span className="hidden sm:inline">Versions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge" data-testid="knowledge-base-panel" className="mt-0 flex-1 overflow-hidden">
              <KnowledgeBasePanel
                seriesId={seriesId}
                requestedTab={requestedKnowledgeBaseTab}
                characterCreateRequest={characterCreateRequest}
                onCharacterCreateRequestHandled={() => setCharacterCreateRequest(null)}
                locationCreateRequest={locationCreateRequest}
                onLocationCreateRequestHandled={() => setLocationCreateRequest(null)}
              />
            </TabsContent>

            <TabsContent value="canvas" data-testid="canvas-panel" className="mt-0 flex-1 overflow-hidden">
              <CanvasBoard seriesId={seriesId} />
            </TabsContent>

            <TabsContent value="versions" data-testid="versions-panel" className="mt-0 flex-1 overflow-hidden">
              <VersionHistoryPanel
                scriptId={scriptId}
                onPreviewVersion={setPreviewingVersionId}
                activePreviewId={previewingVersionId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Entity preview card for mention hover */}
      {previewState.isVisible && previewState.entityId && previewState.entityType && previewState.position ? (
        <EntityPreviewCard
          entityId={previewState.entityId}
          entityType={previewState.entityType}
          position={previewState.position}
          onClose={hidePreview}
          onOpenInKB={handleOpenInKB}
          onMouseEnter={onCardMouseEnter}
          onMouseLeave={onCardMouseLeave}
          seriesId={seriesId}
        />
      ) : null}
    </div>
  );
}
