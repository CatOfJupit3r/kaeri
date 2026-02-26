import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LuArrowLeft, LuBookUser, LuCheck, LuGlobe, LuLoader, LuScroll } from 'react-icons/lu';
import type { GroupBase } from 'react-select';
import z from 'zod';

import { Badge } from '@~/components/ui/badge';
import { Button } from '@~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import { useAppForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { ScrollArea } from '@~/components/ui/scroll-area';
import { MultiSelect } from '@~/components/ui/select';
import type { iOptionType } from '@~/components/ui/select';
import { Separator } from '@~/components/ui/separator';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';

import { useUpdateProp } from '../hooks/mutations/use-update-prop';
import { useProp } from '../hooks/queries/use-prop';

interface iPropEditPanelProps {
  propId: string;
  seriesId: string;
  onClose: () => void;
}

interface iAssociation {
  characterId?: string;
  locationId?: string;
  scriptId?: string;
  note?: string;
}

const ENTITY_TYPE_PREFIXES = {
  CHARACTER: 'char:',
  LOCATION: 'loc:',
  SCRIPT: 'script:',
} as const;

type EntityValue = `${(typeof ENTITY_TYPE_PREFIXES)[keyof typeof ENTITY_TYPE_PREFIXES]}${string}`;

function parseEntityValue(value: EntityValue): { type: 'character' | 'location' | 'script'; id: string } | null {
  if (value.startsWith(ENTITY_TYPE_PREFIXES.CHARACTER)) {
    return { type: 'character', id: value.slice(ENTITY_TYPE_PREFIXES.CHARACTER.length) };
  }
  if (value.startsWith(ENTITY_TYPE_PREFIXES.LOCATION)) {
    return { type: 'location', id: value.slice(ENTITY_TYPE_PREFIXES.LOCATION.length) };
  }
  if (value.startsWith(ENTITY_TYPE_PREFIXES.SCRIPT)) {
    return { type: 'script', id: value.slice(ENTITY_TYPE_PREFIXES.SCRIPT.length) };
  }
  return null;
}

function associationsToEntityValues(associations: iAssociation[]): EntityValue[] {
  const values: EntityValue[] = [];
  associations.forEach((assoc) => {
    if (assoc.characterId) values.push(`${ENTITY_TYPE_PREFIXES.CHARACTER}${assoc.characterId}` as EntityValue);
    if (assoc.locationId) values.push(`${ENTITY_TYPE_PREFIXES.LOCATION}${assoc.locationId}` as EntityValue);
    if (assoc.scriptId) values.push(`${ENTITY_TYPE_PREFIXES.SCRIPT}${assoc.scriptId}` as EntityValue);
  });
  return values;
}

function entityValuesToAssociations(values: EntityValue[]): iAssociation[] {
  const associations: iAssociation[] = [];
  values.forEach((value) => {
    const parsed = parseEntityValue(value);
    if (!parsed) return;

    if (parsed.type === 'character') {
      associations.push({ characterId: parsed.id });
    } else if (parsed.type === 'location') {
      associations.push({ locationId: parsed.id });
    } else if (parsed.type === 'script') {
      associations.push({ scriptId: parsed.id });
    }
  });
  return associations;
}

interface iAssociationsFieldProps {
  seriesId: string;
  value: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function AssociationsField({ seriesId, value, onChange, disabled = false }: iAssociationsFieldProps) {
  const { data: charactersData, isLoading: isLoadingCharacters } = useCharacterList(seriesId, 100, 0);
  const { data: locationsData, isLoading: isLoadingLocations } = useLocationList(seriesId, 100, 0);
  const { data: scriptsData, isLoading: isLoadingScripts } = useScriptList(seriesId, 100, 0);

  const options = useMemo(() => {
    const groups: GroupBase<iOptionType>[] = [];

    // Characters group
    if (charactersData?.items && charactersData.items.length > 0) {
      groups.push({
        label: 'Characters',
        options: charactersData.items.map((char) => ({
          value: `${ENTITY_TYPE_PREFIXES.CHARACTER}${char._id}` as EntityValue,
          label: char.name,
          icon: <LuBookUser className="h-4 w-4" />,
          meta: (
            <Badge variant="secondary" className="text-xs">
              Character
            </Badge>
          ),
        })),
      });
    }

    // Locations group
    if (locationsData?.items && locationsData.items.length > 0) {
      groups.push({
        label: 'Locations',
        options: locationsData.items.map((loc) => ({
          value: `${ENTITY_TYPE_PREFIXES.LOCATION}${loc._id}` as EntityValue,
          label: loc.name,
          icon: <LuGlobe className="h-4 w-4" />,
          meta: (
            <Badge variant="secondary" className="text-xs">
              Location
            </Badge>
          ),
        })),
      });
    }

    // Scripts group
    if (scriptsData?.items && scriptsData.items.length > 0) {
      groups.push({
        label: 'Scripts',
        options: scriptsData.items.map((script) => ({
          value: `${ENTITY_TYPE_PREFIXES.SCRIPT}${script._id}` as EntityValue,
          label: script.title,
          icon: <LuScroll className="h-4 w-4" />,
          meta: (
            <Badge variant="secondary" className="text-xs">
              Script
            </Badge>
          ),
        })),
      });
    }

    return groups;
  }, [charactersData, locationsData, scriptsData]);

  const isLoading = isLoadingCharacters || isLoadingLocations || isLoadingScripts;

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="associations-field">Associations</Label>
        <p className="text-xs text-muted-foreground">Link this prop to characters, locations, or scripts</p>
      </div>
      <MultiSelect
        inputId="associations-field"
        options={options}
        value={value}
        onValueChange={onChange}
        isDisabled={disabled}
        isLoading={isLoading}
        placeholder="Select entities to associate..."
        closeMenuOnSelect={false}
        isClearable
      />
    </div>
  );
}

export function PropEditPanel({ propId, seriesId, onClose }: iPropEditPanelProps) {
  const { data: prop, isPending: isLoading, error } = useProp(propId, seriesId);
  const { updateProp, isPending: isUpdating } = useUpdateProp();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
      entityValues: [] as string[],
    },
    onSubmit: async ({ value }) => {
      if (!prop) return;

      const normalizedName = value.name.trim();
      const normalizedDescription = value.description.trim();
      const associations = entityValuesToAssociations((value.entityValues ?? []) as EntityValue[]);

      updateProp(
        {
          id: prop._id,
          seriesId,
          patch: {
            name: normalizedName,
            description: normalizedDescription || undefined,
            associations: associations.length > 0 ? associations : undefined,
          },
        },
        {
          onSuccess: () => {
            // Stay open on save, form is now synced
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
        description: z.string().trim().max(500, 'Description must be 500 characters or less'),
        entityValues: z.array(z.string()),
      }),
    },
  });

  // Auto-save function
  const handleAutoSave = useCallback(() => {
    if (!isInitializedRef.current) return;

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    form.handleSubmit().catch(() => {
      // Handle submit errors silently - the form validators will show errors
    });
  }, [form]);

  // Sync form with prop data when loaded
  useEffect(() => {
    if (prop) {
      isInitializedRef.current = false;
      form.reset({
        name: prop.name,
        description: prop.description ?? '',
        entityValues: prop.associations ? associationsToEntityValues(prop.associations) : [],
      });
      // Mark as initialized after a short delay to avoid autosave on initial load
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
    }
  }, [prop, form]);

  // Update save status when mutation completes
  useEffect(() => {
    if (!isUpdating && saveStatus === 'saving') {
      setSaveStatus('saved');
      // Clear saved status after 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isUpdating, saveStatus]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading prop...</p>
      </div>
    );
  }

  if (error || !prop) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ? `Error: ${error.message}` : 'Prop not found'}</p>
        <Button variant="outline" onClick={onClose}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b-2 border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <LuArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h2 className="text-lg font-bold">Edit Prop</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5">
              <LuLoader className="size-4 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600">
              <LuCheck className="size-4" />
              Saved
            </span>
          )}
          {saveStatus === 'idle' && <span>Auto-save enabled</span>}
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <form.AppForm>
          <form.Form className="p-4">
            {/* Basic Info Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Core details about this prop</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Name */}
                  <form.AppField name="name">
                    {(field) => (
                      <field.TextField label="Name" placeholder="Enter prop name" required onBlur={handleAutoSave} />
                    )}
                  </form.AppField>

                  {/* Description */}
                  <form.AppField name="description">
                    {(field) => (
                      <field.TextareaField
                        label="Description"
                        placeholder="Describe the prop..."
                        rows={3}
                        maxLength={500}
                        onBlur={handleAutoSave}
                      />
                    )}
                  </form.AppField>
                </div>
              </CardContent>
            </Card>

            {/* Associations Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Associations</CardTitle>
                <CardDescription>Link this prop to characters, locations, or scripts</CardDescription>
              </CardHeader>
              <CardContent>
                <form.Field name="entityValues">
                  {(field) => (
                    <AssociationsField
                      seriesId={seriesId}
                      value={field.state.value ?? []}
                      onChange={(values) => {
                        field.handleChange(values);
                        handleAutoSave();
                      }}
                      disabled={isUpdating}
                    />
                  )}
                </form.Field>
              </CardContent>
            </Card>
          </form.Form>
        </form.AppForm>
      </ScrollArea>
    </div>
  );
}
