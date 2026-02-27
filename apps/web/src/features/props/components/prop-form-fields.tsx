import { useMemo } from 'react';
import { LuBookUser, LuGlobe, LuScroll } from 'react-icons/lu';
import type { GroupBase } from 'react-select';

import { Badge } from '@~/components/ui/badge';
import { withForm } from '@~/components/ui/field';
import { Label } from '@~/components/ui/label';
import { MultiSelect } from '@~/components/ui/select';
import type { iOptionType } from '@~/components/ui/select';

const ENTITY_TYPE_PREFIXES = {
  CHARACTER: 'char:',
  LOCATION: 'loc:',
  SCRIPT: 'script:',
} as const;

type EntityValue = `${(typeof ENTITY_TYPE_PREFIXES)[keyof typeof ENTITY_TYPE_PREFIXES]}${string}`;

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

interface iPropFormFieldsProps {
  /** Characters for associations dropdown */
  characters?: iCharacter[];
  /** Locations for associations dropdown */
  locations?: iLocation[];
  /** Scripts for associations dropdown */
  scripts?: iScript[];
  /** Optional blur handler for auto-save (panel mode only) */
  handleBlur?: () => void;
  /** Whether the form is in a pending state */
  isPending?: boolean;
}

function AssociationsFieldInner({
  characters = [],
  locations = [],
  scripts = [],
  value,
  onChange,
  disabled = false,
}: {
  characters: iCharacter[];
  locations: iLocation[];
  scripts: iScript[];
  value: string[];
  onChange: (values: string[]) => unknown;
  disabled?: boolean;
}) {
  const options = useMemo(() => {
    const groups: GroupBase<iOptionType>[] = [];

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
        <p className="text-xs text-muted-foreground">Link this prop to characters, locations, or scripts</p>
      </div>
      <MultiSelect
        inputId="associations-field"
        options={options}
        value={value}
        onValueChange={onChange}
        isDisabled={disabled}
        placeholder="Select entities to associate..."
        closeMenuOnSelect={false}
        isClearable
      />
    </div>
  );
}

/**
 * Shared form fields for prop forms.
 * Used by both create and edit forms.
 */
export const PropFormFields = withForm({
  defaultValues: {
    name: '',
    description: '',
    entityValues: [] as string[],
  },
  props: {} as iPropFormFieldsProps,
  render: function Render({ form, characters = [], locations = [], scripts = [], handleBlur, isPending = false }) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
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

        <form.Field name="entityValues">
          {(field) => (
            <AssociationsFieldInner
              characters={characters}
              locations={locations}
              scripts={scripts}
              value={field.state.value ?? []}
              onChange={(values) => {
                field.handleChange(values);
                handleBlur?.();
              }}
              disabled={isPending}
            />
          )}
        </form.Field>
      </div>
    );
  },
});

// Export utility functions for association conversion
export { ENTITY_TYPE_PREFIXES };
export type { EntityValue };

interface iAssociation {
  characterId?: string;
  locationId?: string;
  scriptId?: string;
  note?: string;
}

export function parseEntityValue(value: EntityValue): { type: 'character' | 'location' | 'script'; id: string } | null {
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

export function associationsToEntityValues(associations: iAssociation[]): EntityValue[] {
  const values: EntityValue[] = [];
  associations.forEach((assoc) => {
    if (assoc.characterId) values.push(`${ENTITY_TYPE_PREFIXES.CHARACTER}${assoc.characterId}` as EntityValue);
    if (assoc.locationId) values.push(`${ENTITY_TYPE_PREFIXES.LOCATION}${assoc.locationId}` as EntityValue);
    if (assoc.scriptId) values.push(`${ENTITY_TYPE_PREFIXES.SCRIPT}${assoc.scriptId}` as EntityValue);
  });
  return values;
}

export function entityValuesToAssociations(values: EntityValue[]): iAssociation[] {
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
