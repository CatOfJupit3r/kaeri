import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuX } from 'react-icons/lu';

import { Button } from '@~/components/ui/button';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import type { iOptionType } from '@~/components/ui/select';
import { SingleSelect } from '@~/components/ui/select';
import { tanstackRPC } from '@~/utils/tanstack-orpc';

interface iAppearance {
  scriptId: string;
  sceneRef: string;
  locationId?: string;
}

interface iAppearancePickerProps {
  seriesId: string;
  appearances: iAppearance[];
  onAdd: (appearance: iAppearance) => void;
  onRemove?: (index: number) => void;
  disabled?: boolean;
}

export function AppearancePicker({ seriesId, appearances, onAdd, onRemove, disabled = false }: iAppearancePickerProps) {
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [sceneRef, setSceneRef] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const { data: scriptsData } = useQuery({
    ...tanstackRPC.scripts.listScriptsBySeries.queryOptions({
      input: { seriesId, limit: 100, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const { data: locationsData } = useQuery({
    ...tanstackRPC.knowledgeBase.locations.list.queryOptions({
      input: { seriesId, limit: 100, offset: 0 },
    }),
    enabled: !!seriesId,
  });

  const scripts = scriptsData?.items ?? [];
  const locations = locationsData?.items ?? [];

  const scriptOptions: iOptionType[] = scripts.map((script) => ({
    label: script.title,
    value: script._id,
  }));

  const locationOptions: iOptionType[] = locations.map((location) => ({
    label: location.name,
    value: location._id,
  }));

  const getScriptTitle = (scriptId: string) => {
    const script = scripts.find((s) => s._id === scriptId);
    return script?.title ?? 'Unknown Script';
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l._id === locationId);
    return location?.name ?? 'Unknown Location';
  };

  const handleAddAppearance = () => {
    if (!selectedScriptId || !sceneRef.trim()) return;

    const newAppearance: iAppearance = {
      scriptId: selectedScriptId,
      sceneRef: sceneRef.trim(),
      locationId: selectedLocationId ?? undefined,
    };

    onAdd(newAppearance);

    setSelectedScriptId(null);
    setSceneRef('');
    setSelectedLocationId(null);
  };

  const handleRemoveAppearance = (index: number) => {
    onRemove?.(index);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="script-select">Script</Label>
          <SingleSelect
            inputId="script-select"
            options={scriptOptions}
            value={selectedScriptId}
            onValueChange={setSelectedScriptId}
            placeholder="Select a script..."
            isDisabled={disabled || scripts.length === 0}
            isClearable
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scene-ref">Scene Reference</Label>
          <Input
            id="scene-ref"
            value={sceneRef}
            onChange={(e) => setSceneRef(e.target.value)}
            placeholder="e.g., Scene 1, Act 2 Scene 3..."
            disabled={disabled}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-select">Location (optional)</Label>
          <SingleSelect
            inputId="location-select"
            options={locationOptions}
            value={selectedLocationId}
            onValueChange={setSelectedLocationId}
            placeholder="Select a location..."
            isDisabled={disabled || locations.length === 0}
            isClearable
          />
        </div>

        <Button
          type="button"
          onClick={handleAddAppearance}
          disabled={!selectedScriptId || !sceneRef.trim() || disabled}
          size="sm"
          className="w-full"
        >
          Add Appearance
        </Button>
      </div>

      {appearances.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="current-appearances">Current Appearances</Label>
          <div id="current-appearances" className="space-y-2">
            {appearances.map((appearance: iAppearance) => {
              const key = `${appearance.scriptId}-${appearance.sceneRef}`;
              return (
                <div key={key} className="flex items-start justify-between rounded-md border border-border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getScriptTitle(appearance.scriptId)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{appearance.sceneRef}</span>
                    </div>
                    {appearance.locationId ? (
                      <p className="mt-1 text-sm text-muted-foreground">@ {getLocationName(appearance.locationId)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAppearance(appearances.indexOf(appearance))}
                    className="ml-2 rounded-full p-1 hover:bg-muted"
                    disabled={disabled}
                    aria-label="Remove appearance"
                  >
                    <LuX className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
