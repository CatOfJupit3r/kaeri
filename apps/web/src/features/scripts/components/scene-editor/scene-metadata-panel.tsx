import { memo, useCallback, useMemo, useState } from 'react';
import { LuChevronDown, LuChevronUp, LuSave, LuX } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@~/components/ui/card';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { Textarea } from '@~/components/ui/textarea';
import { useStoryArcList } from '@~/features/story-arcs/hooks/queries/use-story-arc-list';
import { useTimelineList } from '@~/features/timelines/hooks/queries/use-timeline-list';
import { cn } from '@~/lib/utils';

import { SceneArcLinker } from './scene-arc-linker';
import { SceneTimelineLinker } from './scene-timeline-linker';

export interface iSceneMetadataPanelScene {
  sceneRef: string;
}

export interface iSceneMetadataPanelProps {
  /** Scene info from the editor */
  scene: iSceneMetadataPanelScene;
  /** Series ID for fetching related narrative entities */
  seriesId: string;
  /** Initial persisted scene metadata */
  initialData?: Partial<iSceneMetadataPanelData>;
  /** Called when scene data changes */
  onChange?: (updates: Partial<iSceneMetadataPanelData>) => void;
  /** Called when save is requested */
  onSave?: (data: iSceneMetadataPanelData) => void;
  /** Called when panel is closed */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether in expanded mode */
  isExpanded?: boolean;
}

export interface iSceneMetadataPanelData {
  heading: string;
  emotionalTone?: string;
  conflict?: string;
  beats?: string[];
  lighting?: string;
  notes?: string;
  storyArcIds?: string[];
  timelineEntryId?: string;
}

// Type aliases for external use
export type SceneMetadataPanelProps = iSceneMetadataPanelProps;
export type SceneMetadataPanelData = iSceneMetadataPanelData;

function getInitialSceneMetadataPanelData(
  scene: iSceneMetadataPanelScene,
  initialData: Partial<iSceneMetadataPanelData> | undefined,
): iSceneMetadataPanelData {
  return {
    heading: scene.sceneRef,
    emotionalTone: initialData?.emotionalTone ?? '',
    conflict: initialData?.conflict ?? '',
    beats: initialData?.beats ?? [],
    lighting: initialData?.lighting ?? '',
    notes: initialData?.notes ?? '',
    storyArcIds: initialData?.storyArcIds ?? [],
    timelineEntryId: initialData?.timelineEntryId,
  };
}

/**
 * Scene Metadata Quick Editor Panel
 *
 * Displays inline below a scene heading for quick editing of scene metadata.
 * Supports editing emotional tone, conflict, beats, and other scene-level details.
 */
export const SceneMetadataPanel = memo(
  ({
    scene,
    seriesId,
    initialData,
    onChange,
    onSave,
    onClose,
    className,
    isExpanded: initialExpanded = true,
  }: iSceneMetadataPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);
    const [formData, setFormData] = useState<iSceneMetadataPanelData>(() =>
      getInitialSceneMetadataPanelData(scene, initialData),
    );
    const [isDirty, setIsDirty] = useState(false);
    const { data: storyArcListData, isPending: isLoadingStoryArcs } = useStoryArcList(seriesId, {
      limit: 100,
      offset: 0,
    });
    const { data: timelineListData, isPending: isLoadingTimelineEntries } = useTimelineList(seriesId, 100, 0);

    const availableStoryArcs = useMemo(
      () =>
        (storyArcListData?.items ?? []).map((storyArc) => ({
          _id: storyArc._id,
          name: storyArc.name,
          description: storyArc.description,
        })),
      [storyArcListData?.items],
    );
    const availableTimelineEntries = useMemo(
      () =>
        (timelineListData?.items ?? []).map((timelineEntry) => ({
          _id: timelineEntry._id,
          label: timelineEntry.label,
          date: timelineEntry.timestamp,
        })),
      [timelineListData?.items],
    );

    const handleFieldChange = useCallback(
      <K extends keyof iSceneMetadataPanelData>(field: K, value: iSceneMetadataPanelData[K]) => {
        setFormData((prev) => {
          const updated = { ...prev, [field]: value };
          onChange?.({ [field]: value });
          return updated;
        });
        setIsDirty(true);
      },
      [onChange],
    );

    const handleSave = useCallback(() => {
      onSave?.(formData);
      setIsDirty(false);
    }, [formData, onSave]);

    const handleBeatsChange = useCallback(
      (value: string) => {
        // Split beats by newline
        const beats = value
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean);
        handleFieldChange('beats', beats);
      },
      [handleFieldChange],
    );

    const handleLinkStoryArc = useCallback(
      (storyArcId: string) => {
        const linkedStoryArcIds = formData.storyArcIds ?? [];

        if (linkedStoryArcIds.includes(storyArcId)) {
          return;
        }

        handleFieldChange('storyArcIds', [...linkedStoryArcIds, storyArcId]);
      },
      [formData.storyArcIds, handleFieldChange],
    );

    const handleUnlinkStoryArc = useCallback(
      (storyArcId: string) => {
        handleFieldChange(
          'storyArcIds',
          (formData.storyArcIds ?? []).filter((linkedStoryArcId) => linkedStoryArcId !== storyArcId),
        );
      },
      [formData.storyArcIds, handleFieldChange],
    );

    const handleLinkTimelineEntry = useCallback(
      (timelineEntryId: string) => {
        handleFieldChange('timelineEntryId', timelineEntryId);
      },
      [handleFieldChange],
    );

    const handleUnlinkTimelineEntry = useCallback(() => {
      handleFieldChange('timelineEntryId', undefined);
    }, [handleFieldChange]);

    return (
      <Card data-testid="scene-metadata-panel" className={cn('w-full border-l-4 border-l-primary/50', className)}>
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <CardTitle className="text-sm font-medium">Scene Details: {scene.sceneRef}</CardTitle>
          <div className="flex items-center gap-1">
            {isDirty ? (
              <Button size="sm" variant="ghost" onClick={handleSave} className="h-7 px-2">
                <LuSave className="mr-1 size-4" />
                Save
              </Button>
            ) : null}
            <Button size="icon" variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="size-7">
              {isExpanded ? <LuChevronUp className="size-4" /> : <LuChevronDown className="size-4" />}
            </Button>
            {onClose ? (
              <Button size="icon" variant="ghost" onClick={onClose} className="size-7">
                <LuX className="size-4" />
              </Button>
            ) : null}
          </div>
        </CardHeader>

        {isExpanded ? (
          <CardContent className="grid gap-4 py-2">
            {/* Emotional Tone */}
            <div className="grid gap-1.5">
              <Label htmlFor="emotionalTone" className="text-xs">
                Emotional Tone
              </Label>
              <Input
                id="emotionalTone"
                value={formData.emotionalTone}
                onChange={(e) => handleFieldChange('emotionalTone', e.target.value)}
                placeholder="e.g., Tense, Hopeful, Melancholic"
                className="h-8 text-sm"
              />
            </div>

            {/* Conflict */}
            <div className="grid gap-1.5">
              <Label htmlFor="conflict" className="text-xs">
                Core Conflict
              </Label>
              <Input
                id="conflict"
                value={formData.conflict}
                onChange={(e) => handleFieldChange('conflict', e.target.value)}
                placeholder="What's at stake in this scene?"
                className="h-8 text-sm"
              />
            </div>

            {/* Scene Beats */}
            <div className="grid gap-1.5">
              <Label htmlFor="beats" className="text-xs">
                Scene Beats (one per line)
              </Label>
              <Textarea
                id="beats"
                value={formData.beats?.join('\n') ?? ''}
                onChange={(e) => handleBeatsChange(e.target.value)}
                placeholder="Key moments in this scene..."
                className="min-h-[60px] text-sm"
                rows={3}
              />
            </div>

            {/* Lighting */}
            <div className="grid gap-1.5">
              <Label htmlFor="lighting" className="text-xs">
                Lighting / Visual Style
              </Label>
              <Input
                id="lighting"
                value={formData.lighting}
                onChange={(e) => handleFieldChange('lighting', e.target.value)}
                placeholder="e.g., Low-key, Natural, Neon"
                className="h-8 text-sm"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <Label htmlFor="notes" className="text-xs">
                Director&apos;s Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Additional notes for production..."
                className="min-h-[40px] text-sm"
                rows={2}
              />
            </div>

            {/* Story Arc Integration */}
            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Story Arcs</span>
              <SceneArcLinker
                linkedArcIds={formData.storyArcIds ?? []}
                availableArcs={availableStoryArcs}
                isLoading={isLoadingStoryArcs}
                onLink={handleLinkStoryArc}
                onUnlink={handleUnlinkStoryArc}
              />
            </div>

            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Timeline</span>
              <SceneTimelineLinker
                linkedEntryId={formData.timelineEntryId}
                availableEntries={availableTimelineEntries}
                isLoading={isLoadingTimelineEntries}
                onLink={handleLinkTimelineEntry}
                onUnlink={handleUnlinkTimelineEntry}
              />
            </div>
          </CardContent>
        ) : null}
      </Card>
    );
  },
);

SceneMetadataPanel.displayName = 'SceneMetadataPanel';
