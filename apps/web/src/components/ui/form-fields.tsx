import { useStore } from '@tanstack/react-form';
import { useState } from 'react';
import type { FocusEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { LuX } from 'react-icons/lu';

import { Badge } from './badge';
import { Button } from './button';
import type { iButtonProps } from './button';
// eslint-disable-next-line import-x/no-cycle
import { useFieldContext, FieldError, useFormContext, FieldDescription, FieldLabel } from './field';
import { Input } from './input';
import { MultiSelect, SingleSelect } from './select';
import type { iMultiSelectProps, iSingleSelectProps, iOptionType } from './select';
import { Textarea } from './textarea';

type TextFieldProps = {
  label: string;
  description?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = ({ label, description, onBlur, ...inputProps }: TextFieldProps) => {
  const field = useFieldContext<string>();

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    field.handleBlur();
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <Input
          id={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={handleBlur}
          {...inputProps}
        />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

type TextareaFieldProps = {
  label: string;
  description?: ReactNode;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaField = ({ label, description, onBlur, ...textareaProps }: TextareaFieldProps) => {
  const field = useFieldContext<string>();

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    field.handleBlur();
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <Textarea
          id={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={handleBlur}
          {...textareaProps}
        />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

export const CheckboxField = ({ label, ...inputProps }: TextFieldProps) => {
  const field = useFieldContext<boolean>();

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center gap-1 space-y-0">
        <Input
          id={field.name}
          type="checkbox"
          checked={field.state.value}
          onChange={(e) => field.handleChange(e.target.checked)}
          onBlur={field.handleBlur}
          {...inputProps}
        />
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </div>
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

interface iSelectFieldProps extends iSingleSelectProps {
  label: string;
  description?: ReactNode;
}

export const SelectField = ({ label, description, options, onBlur, ...selectProps }: iSelectFieldProps) => {
  const field = useFieldContext<string>();

  const handleBlur: iSingleSelectProps['onBlur'] = (e) => {
    field.handleBlur();
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <SingleSelect
          id={field.name}
          value={field.state.value}
          onValueChange={(value) => (value ? field.handleChange(value) : undefined)}
          onBlur={handleBlur}
          options={options}
          {...selectProps}
        />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

interface iMultiSelectFieldProps extends Omit<iMultiSelectProps, 'value' | 'onValueChange'> {
  label: string;
  description?: ReactNode;
}

export const MultiSelectField = ({ label, description, options, onBlur, ...selectProps }: iMultiSelectFieldProps) => {
  const field = useFieldContext<string[]>();

  const handleBlur: iMultiSelectProps['onBlur'] = (e) => {
    field.handleBlur();
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <MultiSelect
          id={field.name}
          value={field.state.value ?? []}
          onValueChange={(values) => field.handleChange(values)}
          onBlur={handleBlur}
          options={options}
          {...selectProps}
        />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// TAG ARRAY FIELD
// ============================================================================

interface iTagArrayFieldProps {
  label: string;
  description?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Called after a tag is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing an array of string tags.
 * Supports adding via Enter key or button click, and removing via badge buttons.
 */
export const TagArrayField = ({
  label,
  description,
  placeholder = 'Add item (press Enter)',
  disabled,
  onChange,
}: iTagArrayFieldProps) => {
  const field = useFieldContext<string[]>();
  const [inputValue, setInputValue] = useState('');

  const tags = field.state.value ?? [];

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      field.pushValue(trimmed);
      setInputValue('');
      onChange?.();
    }
  };

  const handleRemove = (index: number) => {
    field.removeValue(index);
    onChange?.();
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={field.name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" onClick={handleAdd} disabled={!!disabled || !inputValue.trim()} size="sm">
            Add
          </Button>
        </div>
      </div>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 rounded-full hover:bg-muted"
                disabled={disabled}
              >
                <LuX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// ENTITY PICKER FIELD
// ============================================================================

interface iEntityPickerFieldProps {
  label: string;
  description?: ReactNode;
  options: iOptionType[];
  placeholder?: string;
  disabled?: boolean;
  /** Badge variant for selected items */
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
  /** Called after an entity is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for selecting multiple entities from a dropdown.
 * Displays selected items as badges with remove buttons.
 */
export const EntityPickerField = ({
  label,
  description,
  options,
  placeholder = 'Select item',
  disabled,
  badgeVariant = 'secondary',
  onChange,
}: iEntityPickerFieldProps) => {
  const field = useFieldContext<string[]>();
  const selectedIds = field.state.value ?? [];

  const handleAdd = (value: string | null) => {
    if (value && !selectedIds.includes(value)) {
      field.pushValue(value);
      onChange?.();
    }
  };

  const handleRemove = (index: number) => {
    field.removeValue(index);
    onChange?.();
  };

  const getLabel = (id: string): string => options.find((opt) => opt.value === id)?.label ?? 'Unknown';

  const availableOptions = options.filter((opt) => !selectedIds.includes(opt.value));

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <SingleSelect
          inputId={field.name}
          value={null}
          onValueChange={handleAdd}
          options={availableOptions}
          placeholder={placeholder}
          isDisabled={disabled}
        />
      </div>
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Badge key={`${id}-${index}`} variant={badgeVariant} className="gap-1">
              {getLabel(id)}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 rounded-full hover:bg-muted"
                disabled={disabled}
              >
                <LuX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// IMAGE ARRAY FIELD
// ============================================================================

interface iImageItem {
  url: string;
  caption?: string;
}

interface iImageArrayFieldProps {
  label: string;
  description?: ReactNode;
  urlPlaceholder?: string;
  captionPlaceholder?: string;
  disabled?: boolean;
  /** Called after an image is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing an array of images with URL and optional caption.
 * Validates URL format before adding.
 */
export const ImageArrayField = ({
  label,
  description,
  urlPlaceholder = 'Image URL',
  captionPlaceholder = 'Caption (optional)',
  disabled,
  onChange,
}: iImageArrayFieldProps) => {
  const field = useFieldContext<iImageItem[]>();
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');

  const images = field.state.value ?? [];

  const handleAdd = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    try {
      // eslint-disable-next-line no-new
      new URL(trimmedUrl);
      field.pushValue({ url: trimmedUrl, caption: captionInput.trim() || undefined });
      setUrlInput('');
      setCaptionInput('');
      onChange?.();
    } catch {
      // Invalid URL, don't add
    }
  };

  const handleRemove = (index: number) => {
    field.removeValue(index);
    onChange?.();
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={field.name}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={urlPlaceholder}
            disabled={disabled}
          />
          <Input
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder={captionPlaceholder}
            disabled={disabled}
            className="w-1/2"
          />
          <Button type="button" onClick={handleAdd} disabled={!!disabled || !urlInput.trim()}>
            Add
          </Button>
        </div>
      </div>
      {images.length > 0 ? (
        <div className="space-y-2">
          {images.map((image, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex-1">
                <p className="text-sm font-medium">{image.url}</p>
                {image.caption ? <p className="text-xs text-muted-foreground">{image.caption}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="rounded-full p-1 hover:bg-muted"
                disabled={disabled}
              >
                <LuX className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// KEY BEATS FIELD
// ============================================================================

interface iKeyBeat {
  id: string;
  order: number;
  description: string;
  scriptId?: string;
  sceneId?: string;
}

interface iKeyBeatsFieldProps {
  label: string;
  description?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  /** Whether to show reorder buttons */
  showReorder?: boolean;
  /** Called after a beat is added, removed, or reordered - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing an ordered array of key beats.
 * Supports adding, removing, and optionally reordering beats.
 */
export const KeyBeatsField = ({
  label,
  description,
  placeholder = 'Add a beat...',
  disabled = false,
  showReorder = true,
  onChange,
}: iKeyBeatsFieldProps) => {
  const field = useFieldContext<iKeyBeat[]>();
  const [inputValue, setInputValue] = useState('');

  const beats = field.state.value ?? [];

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      field.pushValue({
        id: crypto.randomUUID(),
        order: beats.length,
        description: trimmed,
      });
      setInputValue('');
      onChange?.();
    }
  };

  const handleRemove = (index: number) => {
    const updatedBeats = beats.filter((_, i) => i !== index);
    // Recalculate order after removal
    field.setValue(updatedBeats.map((b, i) => ({ ...b, order: i })));
    onChange?.();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBeats = [...beats];
    [newBeats[index - 1], newBeats[index]] = [newBeats[index], newBeats[index - 1]];
    field.setValue(newBeats.map((b, i) => ({ ...b, order: i })));
    onChange?.();
  };

  const handleMoveDown = (index: number) => {
    if (index === beats.length - 1) return;
    const newBeats = [...beats];
    [newBeats[index], newBeats[index + 1]] = [newBeats[index + 1], newBeats[index]];
    field.setValue(newBeats.map((b, i) => ({ ...b, order: i })));
    onChange?.();
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {beats.length > 0 ? (
          <div className="space-y-2">
            {beats.map((beat, index) => (
              <div key={beat.id ?? index} className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
                {showReorder ? (
                  <div className="flex flex-col gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-5 p-0"
                      onClick={() => handleMoveUp(index)}
                      disabled={!!disabled || index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-5 p-0"
                      onClick={() => handleMoveDown(index)}
                      disabled={!!disabled || index === beats.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                ) : (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                )}
                <p className="flex-1 text-sm">{beat.description}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="size-6 p-0"
                >
                  <LuX className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Input
            id={field.name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button type="button" onClick={handleAdd} disabled={!!disabled || !inputValue.trim()} size="sm">
            Add
          </Button>
        </div>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// CHARACTER ROLE FIELD
// ============================================================================

interface iCharacterRole {
  characterId: string;
  role: string;
}

interface iCharacterRoleFieldProps {
  label: string;
  description?: ReactNode;
  characters: Array<{ _id: string; name: string }>;
  characterPlaceholder?: string;
  rolePlaceholder?: string;
  disabled?: boolean;
  /** Called after a character role is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing character-role assignments.
 * Allows selecting a character and assigning a role to them.
 */
export const CharacterRoleField = ({
  label,
  description,
  characters,
  characterPlaceholder = 'Select character',
  rolePlaceholder = 'Role (e.g., protagonist)',
  disabled = false,
  onChange,
}: iCharacterRoleFieldProps) => {
  const field = useFieldContext<iCharacterRole[]>();
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const characterRoles = field.state.value ?? [];

  const handleAdd = () => {
    if (selectedCharacterId && roleInput.trim()) {
      if (!characterRoles.some((c) => c.characterId === selectedCharacterId)) {
        field.pushValue({ characterId: selectedCharacterId, role: roleInput.trim() });
        setSelectedCharacterId('');
        setRoleInput('');
        onChange?.();
      }
    }
  };

  const handleRemove = (characterId: string) => {
    const index = characterRoles.findIndex((c) => c.characterId === characterId);
    if (index !== -1) {
      field.removeValue(index);
      onChange?.();
    }
  };

  const getCharacterName = (characterId: string): string =>
    characters.find((c) => c._id === characterId)?.name ?? characterId;

  const availableCharacters = characters.filter((c) => !characterRoles.some((cr) => cr.characterId === c._id));

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {characterRoles.length > 0 ? (
          <div className="space-y-2">
            {characterRoles.map((char) => (
              <div key={char.characterId} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{getCharacterName(char.characterId)}</p>
                  <p className="text-xs text-muted-foreground">{char.role}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(char.characterId)}
                  disabled={disabled}
                >
                  <LuX className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <SingleSelect
            inputId={field.name}
            value={selectedCharacterId || null}
            onValueChange={(value) => setSelectedCharacterId(value ?? '')}
            options={availableCharacters.map((c) => ({ value: c._id, label: c.name }))}
            placeholder={characterPlaceholder}
            isDisabled={disabled}
          />
          <Input
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            placeholder={rolePlaceholder}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
          disabled={!!disabled || !selectedCharacterId || !roleInput.trim()}
        >
          Add Character
        </Button>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// CHARACTER CONNECTION FIELD
// ============================================================================

interface iCharacterConnection {
  characterId: string;
  connection: string;
}

interface iCharacterConnectionFieldProps {
  label: string;
  description?: ReactNode;
  characters: Array<{ _id: string; name: string }>;
  characterPlaceholder?: string;
  connectionPlaceholder?: string;
  disabled?: boolean;
  /** Called after a character connection is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing character-connection relationships.
 * Allows selecting a character and describing how they connect to/embody a theme.
 */
export const CharacterConnectionField = ({
  label,
  description,
  characters,
  characterPlaceholder = 'Select character',
  connectionPlaceholder = 'How they relate to this theme...',
  disabled = false,
  onChange,
}: iCharacterConnectionFieldProps) => {
  const field = useFieldContext<iCharacterConnection[]>();
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [connectionInput, setConnectionInput] = useState('');

  const connections = field.state.value ?? [];

  const handleAdd = () => {
    if (selectedCharacterId && connectionInput.trim()) {
      if (!connections.some((c) => c.characterId === selectedCharacterId)) {
        field.pushValue({ characterId: selectedCharacterId, connection: connectionInput.trim() });
        setSelectedCharacterId('');
        setConnectionInput('');
        onChange?.();
      }
    }
  };

  const handleRemove = (characterId: string) => {
    const index = connections.findIndex((c) => c.characterId === characterId);
    if (index !== -1) {
      field.removeValue(index);
      onChange?.();
    }
  };

  const getCharacterName = (characterId: string): string =>
    characters.find((c) => c._id === characterId)?.name ?? characterId;

  const availableCharacters = characters.filter((c) => !connections.some((conn) => conn.characterId === c._id));

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {connections.length > 0 ? (
          <div className="space-y-2">
            {connections.map((conn) => (
              <div key={conn.characterId} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{getCharacterName(conn.characterId)}</p>
                  <p className="text-xs text-muted-foreground">{conn.connection}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(conn.characterId)}
                  disabled={disabled}
                >
                  <LuX className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <SingleSelect
            inputId={field.name}
            value={selectedCharacterId || null}
            onValueChange={(value) => setSelectedCharacterId(value ?? '')}
            options={availableCharacters.map((c) => ({ value: c._id, label: c.name }))}
            placeholder={characterPlaceholder}
            isDisabled={disabled}
          />
          <Input
            value={connectionInput}
            onChange={(e) => setConnectionInput(e.target.value)}
            placeholder={connectionPlaceholder}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
          disabled={!!disabled || !selectedCharacterId || !connectionInput.trim()}
        >
          Add Character
        </Button>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

// ============================================================================
// EVOLUTION FIELD
// ============================================================================

interface iEvolution {
  scriptId: string;
  notes: string;
}

interface iEvolutionFieldProps {
  label: string;
  description?: ReactNode;
  scripts: Array<{ _id: string; title: string }>;
  scriptPlaceholder?: string;
  notesPlaceholder?: string;
  disabled?: boolean;
  /** Called after an evolution entry is added or removed - useful for auto-save */
  onChange?: () => void;
}

/**
 * Field component for managing theme evolution across scripts.
 * Allows selecting a script and describing how a theme evolves in it.
 */
export const EvolutionField = ({
  label,
  description,
  scripts,
  scriptPlaceholder = 'Select script',
  notesPlaceholder = 'How the theme evolves in this script...',
  disabled = false,
  onChange,
}: iEvolutionFieldProps) => {
  const field = useFieldContext<iEvolution[]>();
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const evolutionEntries = field.state.value ?? [];

  const handleAdd = () => {
    if (selectedScriptId && notesInput.trim()) {
      if (!evolutionEntries.some((e) => e.scriptId === selectedScriptId)) {
        field.pushValue({ scriptId: selectedScriptId, notes: notesInput.trim() });
        setSelectedScriptId('');
        setNotesInput('');
        onChange?.();
      }
    }
  };

  const handleRemove = (scriptId: string) => {
    const index = evolutionEntries.findIndex((e) => e.scriptId === scriptId);
    if (index !== -1) {
      field.removeValue(index);
      onChange?.();
    }
  };

  const getScriptTitle = (scriptId: string): string => scripts.find((s) => s._id === scriptId)?.title ?? scriptId;

  const availableScripts = scripts.filter((s) => !evolutionEntries.some((e) => e.scriptId === s._id));

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {evolutionEntries.length > 0 ? (
          <div className="space-y-2">
            {evolutionEntries.map((evo) => (
              <div key={evo.scriptId} className="flex items-center gap-2 rounded-lg border p-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{getScriptTitle(evo.scriptId)}</p>
                  <p className="text-xs text-muted-foreground">{evo.notes}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(evo.scriptId)}
                  disabled={disabled}
                >
                  <LuX className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <SingleSelect
            inputId={field.name}
            value={selectedScriptId || null}
            onValueChange={(value) => setSelectedScriptId(value ?? '')}
            options={availableScripts.map((s) => ({ value: s._id, label: s.title }))}
            placeholder={scriptPlaceholder}
            isDisabled={disabled}
          />
          <Input
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder={notesPlaceholder}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full"
          disabled={!!disabled || !selectedScriptId || !notesInput.trim()}
        >
          Add Evolution
        </Button>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field?.state?.meta?.errors} />
    </div>
  );
};

function useFormErrors() {
  const form = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const errors = useStore(form.store, (state) => state.errors);
  return { errors, hasErrors: Object.keys(errors).length > 0 };
}

interface iSubmitButtonProps extends Omit<iButtonProps, 'disabled'> {
  isDisabled?: boolean;
}

export function SubmitButton({ children, className, isDisabled, ...props }: iSubmitButtonProps) {
  const form = useFormContext();
  const { hasErrors } = useFormErrors();

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [state.isSubmitting, state.canSubmit]);

  return (
    <Button
      type="submit"
      disabled={isSubmitting || !canSubmit || !!isDisabled || hasErrors}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}

interface iFormActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel: string;
  loadingLabel?: string;
  isDisabled?: boolean;
}

export function FormActions({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel,
  loadingLabel,
  isDisabled,
}: iFormActionsProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isDisabled}>
        {cancelLabel}
      </Button>
      <SubmitButton isDisabled={isDisabled}>{isSubmitting && loadingLabel ? loadingLabel : submitLabel}</SubmitButton>
    </>
  );
}
