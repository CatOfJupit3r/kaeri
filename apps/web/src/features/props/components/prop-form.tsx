import { useEffect, useMemo } from 'react';
import { LuBookUser, LuGlobe, LuScroll } from 'react-icons/lu';
import type { GroupBase } from 'react-select';
import { components } from 'react-select';

import { Badge } from '@~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@~/components/ui/dialog';
import { useAppForm, withForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { MultiSelect } from '@~/components/ui/select';
import type { iOptionType } from '@~/components/ui/select';

import { useCreateProp } from '../hooks/mutations/use-create-prop';
import { useUpdateProp } from '../hooks/mutations/use-update-prop';
import { propFormSchema } from '../schemas/prop.schema';

interface iProp {
  _id: string;
  name: string;
  description?: string;
  associations?: Array<{
    characterId?: string;
    locationId?: string;
    scriptId?: string;
    note?: string;
  }>;
}

interface iPropFormProps {
  seriesId: string;
  characters: iCharacter[];
  locations: iLocation[];
  scripts: iScript[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: iProp;
}

type Association = NonNullable<iProp['associations']>[number];

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

function associationsToEntityValues(associations: Association[]): EntityValue[] {
  const values: EntityValue[] = [];
  associations.forEach((assoc) => {
    if (assoc.characterId) values.push(`${ENTITY_TYPE_PREFIXES.CHARACTER}${assoc.characterId}` as EntityValue);
    if (assoc.locationId) values.push(`${ENTITY_TYPE_PREFIXES.LOCATION}${assoc.locationId}` as EntityValue);
    if (assoc.scriptId) values.push(`${ENTITY_TYPE_PREFIXES.SCRIPT}${assoc.scriptId}` as EntityValue);
  });
  return values;
}

function entityValuesToAssociations(values: EntityValue[]): Association[] {
  const associations: Association[] = [];
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

interface iCharacter {
  _id: string;
  name: string;
}

interface iLocation {
  _id: string;
  name: string;
}

interface iScript {
  _id: string;
  title: string;
}

interface iAssociationsFieldProps {
  characters: iCharacter[];
  locations: iLocation[];
  scripts: iScript[];
  value: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

function AssociationsField({
  characters,
  locations,
  scripts,
  value,
  onChange,
  disabled = false,
}: iAssociationsFieldProps) {
  const options = useMemo(() => {
    const groups: GroupBase<iOptionType>[] = [];

    // Characters group
    if (characters.length > 0) {
      groups.push({
        label: 'Characters',
        options: characters.map((char) => ({
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
    if (locations.length > 0) {
      groups.push({
        label: 'Locations',
        options: locations.map((loc) => ({
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
    if (scripts.length > 0) {
      groups.push({
        label: 'Scripts',
        options: scripts.map((script) => ({
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
  }, [characters, locations, scripts]);

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="associations-field">Associations (Optional)</Label>
        <p className="text-xs text-muted-foreground" id="associations-field">
          Link this prop to characters, locations, or scripts
        </p>
      </div>
      <MultiSelect
        id="associations-field"
        options={options}
        value={value}
        onValueChange={onChange}
        isDisabled={disabled}
        placeholder="Select entities to associate..."
        closeMenuOnSelect={false}
        isClearable
        components={{
          MenuList: components.MenuList,
        }}
      />
    </div>
  );
}

const PropFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    entityValues: [] as string[],
  },
  props: {
    isPending: false,
    onCancel: () => {},
    isEditMode: false,
    characters: [] as iCharacter[],
    locations: [] as iLocation[],
    scripts: [] as iScript[],
  },
  render: function Render({ form, isPending, onCancel, isEditMode, characters, locations, scripts }) {
    return (
      <>
        <div className="grid gap-4">
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" placeholder="Enter prop name" required />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField label="Description" placeholder="Describe the prop..." rows={3} maxLength={500} />
            )}
          </form.AppField>
        </div>

        <form.Field name="entityValues">
          {(field) => (
            <AssociationsField
              characters={characters}
              locations={locations}
              scripts={scripts}
              value={field.state.value ?? []}
              onChange={(values) => field.handleChange(values)}
              disabled={isPending}
            />
          )}
        </form.Field>

        <DialogFooter>
          <form.FormActions
            onCancel={onCancel}
            submitLabel={isEditMode ? 'Update Prop' : 'Create Prop'}
            loadingLabel={isEditMode ? 'Updating...' : 'Creating...'}
            isDisabled={isPending}
          />
        </DialogFooter>
      </>
    );
  },
});

export function PropForm({
  seriesId,
  characters,
  locations,
  scripts,
  open,
  onOpenChange,
  initialData,
}: iPropFormProps) {
  const { createProp, isPending: isCreating } = useCreateProp();
  const { updateProp, isPending: isUpdating } = useUpdateProp();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useAppForm({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      entityValues: initialData?.associations ? associationsToEntityValues(initialData.associations) : ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      const associations = entityValuesToAssociations((value.entityValues ?? []) as EntityValue[]);
      if (isEditMode && initialData) {
        updateProp(
          {
            id: initialData._id,
            seriesId,
            patch: {
              name: value.name,
              description: value.description || undefined,
              associations: associations.length > 0 ? associations : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
            },
          },
        );
      } else {
        createProp(
          {
            seriesId,
            value: {
              name: value.name,
              description: value.description || undefined,
              associations: associations.length > 0 ? associations : undefined,
            },
          },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          },
        );
      }
    },
    validators: {
      onSubmit: propFormSchema,
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? '',
        entityValues: initialData.associations ? associationsToEntityValues(initialData.associations) : [],
      });
    } else if (!open) {
      form.reset({
        name: '',
        description: '',
        entityValues: [],
      });
    }
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Prop' : 'Create Prop'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the prop details below.'
              : 'Add a new prop to your series. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form.AppForm>
          <form.Form className="space-y-4 p-0">
            <PropFormFields
              form={form}
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
              isEditMode={isEditMode}
              characters={characters}
              locations={locations}
              scripts={scripts}
            />
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
