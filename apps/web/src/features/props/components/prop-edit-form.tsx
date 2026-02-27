import { useMemo } from 'react';
import { LuBookUser, LuGlobe, LuScroll } from 'react-icons/lu';
import type { GroupBase } from 'react-select';

import { EditPanelWrapper } from '@~/components/forms';
import { Badge } from '@~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { MultiSelect } from '@~/components/ui/select';
import type { iOptionType } from '@~/components/ui/select';
import { useCharacterList } from '@~/features/characters/hooks/queries/use-character-list';
import { useLocationList } from '@~/features/locations/hooks/queries/use-location-list';
import { useScriptList } from '@~/features/scripts/hooks/queries/use-script-list';
import { useAutoSave } from '@~/hooks/use-auto-save';
import type { EditFormMode } from '@~/types/form.types';
import { EDIT_FORM_MODES } from '@~/types/form.types';

import { useUpdateProp } from '../hooks/mutations/use-update-prop';
import type { PropQueryReturnType } from '../hooks/queries/use-prop';
import { propFormSchema } from '../schemas/prop.schema';
import type { EntityValue } from './prop-form-fields';
import {
  associationsToEntityValues,
  entityValuesToAssociations,
  ENTITY_TYPE_PREFIXES,
  PropFormFields,
} from './prop-form-fields';

interface iPropEditFormProps {
  mode: EditFormMode;
  seriesId: string;
  /** Initial data - required, parent must fetch and provide */
  initialData: PropQueryReturnType;
  onClose: () => void;
  /** For dialog mode only */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Self-contained associations field that fetches its own data
function PanelAssociationsField({
  seriesId,
  value,
  onChange,
  disabled = false,
}: {
  seriesId: string;
  value: string[];
  onChange: (values: string[]) => unknown;
  disabled?: boolean;
}) {
  const { data: charactersData, isLoading: isLoadingCharacters } = useCharacterList(seriesId, 100, 0);
  const { data: locationsData, isLoading: isLoadingLocations } = useLocationList(seriesId, 100, 0);
  const { data: scriptsData, isLoading: isLoadingScripts } = useScriptList(seriesId, 100, 0);

  const options = useMemo(() => {
    const groups: GroupBase<iOptionType>[] = [];

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

/**
 * Unified edit form for props.
 * Supports both panel mode (auto-save on blur) and dialog mode (manual submit).
 *
 * @param mode - 'panel' for inline panel editing, 'dialog' for modal editing
 * @param initialData - Required prop data (parent fetches this)
 */
export function PropEditForm({ mode, seriesId, initialData, onClose, open, onOpenChange }: iPropEditFormProps) {
  const { updateProp, isPending: isUpdating } = useUpdateProp();

  // Fetch data for associations field (needed for dialog mode with PropFormFields)
  const { data: charactersData } = useCharacterList(seriesId, 100, 0);
  const { data: locationsData } = useLocationList(seriesId, 100, 0);
  const { data: scriptsData } = useScriptList(seriesId, 100, 0);

  const form = useAppForm({
    defaultValues: {
      name: initialData.name,
      description: initialData.description ?? '',
      entityValues: initialData.associations ? associationsToEntityValues(initialData.associations) : ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      const associations = entityValuesToAssociations((value.entityValues ?? []) as EntityValue[]);

      updateProp(
        {
          id: initialData._id,
          seriesId,
          patch: {
            name: value.name || undefined,
            description: value.description || undefined,
            associations: associations.length > 0 ? associations : undefined,
          },
        },
        {
          onSuccess: () => {
            if (mode === EDIT_FORM_MODES.dialog) {
              onOpenChange?.(false);
            }
          },
        },
      );
    },
    validators: {
      onSubmit: propFormSchema,
    },
  });

  const { handleAutoSave } = useAutoSave(form, {
    isUpdating,
    enabled: mode === EDIT_FORM_MODES.panel,
  });

  const handleBlur = mode === EDIT_FORM_MODES.panel ? handleAutoSave : undefined;

  // Panel form content
  const panelFormContent = (
    <form.AppForm key={initialData._id}>
      <form.Form className="p-4">
        {/* Basic Info Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Core details about this prop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.AppField name="name">
                {(field) => <field.TextField label="Name" placeholder="Enter prop name" required onBlur={handleBlur} />}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextareaField
                    label="Description"
                    placeholder="Describe the prop..."
                    rows={3}
                    maxLength={500}
                    onBlur={handleBlur}
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
                <PanelAssociationsField
                  seriesId={seriesId}
                  value={field.state.value ?? []}
                  onChange={(values) => {
                    field.handleChange(values);
                    if (handleBlur) handleBlur();
                  }}
                  disabled={isUpdating}
                />
              )}
            </form.Field>
          </CardContent>
        </Card>
      </form.Form>
    </form.AppForm>
  );

  // Dialog form content (simpler layout)
  const dialogFormContent = (
    <form.AppForm>
      <form.Form className="space-y-4 p-0">
        <PropFormFields
          form={form}
          characters={charactersData?.items ?? []}
          locations={locationsData?.items ?? []}
          scripts={scriptsData?.items ?? []}
          isPending={isUpdating}
        />

        <DialogFooter>
          <form.FormActions
            onCancel={() => onOpenChange?.(false)}
            submitLabel="Update Prop"
            loadingLabel="Updating..."
            isDisabled={isUpdating}
          />
        </DialogFooter>
      </form.Form>
    </form.AppForm>
  );

  // Render based on mode
  if (mode === EDIT_FORM_MODES.panel) {
    return (
      <EditPanelWrapper title="Edit Prop" onClose={onClose}>
        {panelFormContent}
      </EditPanelWrapper>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Prop</DialogTitle>
          <DialogDescription>Update the prop details below.</DialogDescription>
        </DialogHeader>
        {dialogFormContent}
      </DialogContent>
    </Dialog>
  );
}
