/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-restricted-syntax */
import { useForm } from '@tanstack/react-form';
import { LuLoader, LuSave } from 'react-icons/lu';

import { toastError, toastSuccess } from '@~/components/toastifications';
import { Button } from '@~/components/ui/button';
import { Input } from '@~/components/ui/input';
import { Label } from '@~/components/ui/label';
import { SingleSelect } from '@~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@~/components/ui/tabs';

import { useCreateExportPreset } from '../hooks/mutations/use-create-export-preset';
import { useUpdateExportPreset } from '../hooks/mutations/use-update-export-preset';
import type { ExportPreset } from '../hooks/queries/use-export-presets';

const PAGE_SIZES = ['LETTER', 'A4', 'LEGAL'] as const;
const FONT_FAMILIES = ['Courier', 'CourierPrime', 'Arial', 'TimesNewRoman', 'Helvetica'] as const;
const ALIGNMENTS = ['left', 'center', 'right'] as const;
const PAGE_NUMBER_POSITIONS = ['top-right', 'top-center', 'bottom-right', 'bottom-center'] as const;

interface iExportPresetFormProps {
  preset?: ExportPreset;
  onSave: () => void;
  onCancel: () => void;
}

const DEFAULT_BLOCK_STYLE = {
  fontSize: 12,
  bold: false,
  italic: false,
  uppercase: false,
  alignment: 'left' as const,
  marginLeft: 0,
  marginRight: 0,
  spaceBefore: 12,
  spaceAfter: 0,
  color: '#000000',
};

export function ExportPresetForm({ preset, onSave, onCancel }: iExportPresetFormProps) {
  const { createPresetAsync, isPending: isCreating } = useCreateExportPreset();
  const { updatePresetAsync, isPending: isUpdating } = useUpdateExportPreset();
  const isPending = isCreating || isUpdating;

  const form = useForm({
    defaultValues: {
      name: preset?.name ?? 'New Preset',
      description: preset?.description ?? '',
      pageSize: preset?.pageSize ?? 'LETTER',
      fontFamily: preset?.fontFamily ?? 'Courier',
      baseFontSize: preset?.baseFontSize ?? 12,
      lineHeight: preset?.lineHeight ?? 1,
      margins: {
        top: preset?.margins?.top ?? 1,
        bottom: preset?.margins?.bottom ?? 1,
        left: preset?.margins?.left ?? 1.5,
        right: preset?.margins?.right ?? 1,
      },
      headerFooter: {
        showPageNumbers: preset?.headerFooter?.showPageNumbers ?? true,
        pageNumberPosition: preset?.headerFooter?.pageNumberPosition ?? 'top-right',
        showTitle: preset?.headerFooter?.showTitle ?? false,
        showDate: preset?.headerFooter?.showDate ?? false,
        customHeaderText: preset?.headerFooter?.customHeaderText ?? '',
        customFooterText: preset?.headerFooter?.customFooterText ?? '',
      },
      sceneHeadingStyle: preset?.sceneHeadingStyle ?? {
        ...DEFAULT_BLOCK_STYLE,
        bold: true,
        uppercase: true,
        spaceBefore: 24,
        spaceAfter: 12,
      },
      actionStyle: preset?.actionStyle ?? DEFAULT_BLOCK_STYLE,
      characterStyle: preset?.characterStyle ?? {
        ...DEFAULT_BLOCK_STYLE,
        bold: true,
        uppercase: true,
        marginLeft: 2.2,
      },
      dialogueStyle: preset?.dialogueStyle ?? {
        ...DEFAULT_BLOCK_STYLE,
        marginLeft: 1,
        marginRight: 1.5,
        spaceBefore: 0,
      },
      parentheticalStyle: preset?.parentheticalStyle ?? {
        ...DEFAULT_BLOCK_STYLE,
        italic: true,
        marginLeft: 1.6,
        marginRight: 2.1,
        spaceBefore: 0,
      },
      transitionStyle: preset?.transitionStyle ?? {
        ...DEFAULT_BLOCK_STYLE,
        bold: true,
        uppercase: true,
        alignment: 'right' as const,
        spaceAfter: 12,
      },
    },
    onSubmit: async ({ value }) => {
      try {
        if (preset != null) {
          await updatePresetAsync({
            presetId: preset._id,
            ...value,
          });
          toastSuccess('Preset updated');
        } else {
          await createPresetAsync(value);
          toastSuccess('Preset created');
        }
        onSave();
      } catch {
        toastError('Failed to save preset');
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="blocks">Block Styles</TabsTrigger>
          <TabsTrigger value="header">Headers</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Preset Name</Label>
                <Input
                  id="name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="My Custom Preset"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe this preset..."
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="fontFamily">
              {(field) => (
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <SingleSelect
                    options={FONT_FAMILIES.map((font) => ({ value: font, label: font }))}
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange((value ?? 'Courier') as typeof field.state.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="baseFontSize">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="baseFontSize">Base Font Size (pt)</Label>
                  <Input
                    id="baseFontSize"
                    type="number"
                    min={8}
                    max={18}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="lineHeight">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="lineHeight">Line Height</Label>
                <Input
                  id="lineHeight"
                  type="number"
                  min={1}
                  max={3}
                  step={0.1}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </div>
            )}
          </form.Field>
        </TabsContent>

        {/* Page Tab */}
        <TabsContent value="page" className="space-y-4">
          <form.Field name="pageSize">
            {(field) => (
              <div className="space-y-2">
                <Label>Page Size</Label>
                <SingleSelect
                  options={PAGE_SIZES.map((size) => ({ value: size, label: size }))}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange((value ?? 'LETTER') as typeof field.state.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="space-y-2">
            <Label>Page Margins (inches)</Label>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="margins.top">
                {(field) => (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input
                      type="number"
                      min={0.25}
                      max={3}
                      step={0.125}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="margins.bottom">
                {(field) => (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input
                      type="number"
                      min={0.25}
                      max={3}
                      step={0.125}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="margins.left">
                {(field) => (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input
                      type="number"
                      min={0.25}
                      max={3}
                      step={0.125}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="margins.right">
                {(field) => (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input
                      type="number"
                      min={0.25}
                      max={3}
                      step={0.125}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </div>
        </TabsContent>

        {/* Block Styles Tab */}
        <TabsContent value="blocks" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure styling for each screenplay block type. Margins are in inches relative to page margins.
          </p>

          <BlockStyleEditor form={form} blockName="sceneHeadingStyle" label="Scene Heading" />
          <BlockStyleEditor form={form} blockName="actionStyle" label="Action" />
          <BlockStyleEditor form={form} blockName="characterStyle" label="Character" />
          <BlockStyleEditor form={form} blockName="dialogueStyle" label="Dialogue" />
          <BlockStyleEditor form={form} blockName="parentheticalStyle" label="Parenthetical" />
          <BlockStyleEditor form={form} blockName="transitionStyle" label="Transition" />
        </TabsContent>

        {/* Headers Tab */}
        <TabsContent value="header" className="space-y-4">
          <form.Field name="headerFooter.showPageNumbers">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPageNumbers"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="showPageNumbers">Show page numbers</Label>
              </div>
            )}
          </form.Field>

          <form.Field name="headerFooter.pageNumberPosition">
            {(field) => (
              <div className="space-y-2">
                <Label>Page Number Position</Label>
                <SingleSelect
                  options={PAGE_NUMBER_POSITIONS.map((pos) => ({ value: pos, label: pos.replace('-', ' ') }))}
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange((value ?? 'top-right') as typeof field.state.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="headerFooter.showTitle">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showTitle"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="showTitle">Show script title in header</Label>
              </div>
            )}
          </form.Field>

          <form.Field name="headerFooter.showDate">
            {(field) => (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showDate"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="showDate">Show export date in footer</Label>
              </div>
            )}
          </form.Field>

          <form.Field name="headerFooter.customHeaderText">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="customHeaderText">Custom Header Text</Label>
                <Input
                  id="customHeaderText"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Optional header text"
                  maxLength={100}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="headerFooter.customFooterText">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="customFooterText">Custom Footer Text</Label>
                <Input
                  id="customFooterText"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Optional footer text"
                  maxLength={100}
                />
              </div>
            )}
          </form.Field>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <LuLoader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <LuSave className="mr-2 h-4 w-4" />
              Save Preset
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Block style editor sub-component
function BlockStyleEditor({
  form,
  blockName,
  label,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  blockName: string;
  label: string;
}) {
  return (
    <details className="group rounded-lg border p-3">
      <summary className="cursor-pointer font-medium">{label}</summary>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <form.Field name={`${blockName}.fontSize`}>
          {(field: { state: { value: number }; handleChange: (v: number) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Font Size</Label>
              <Input
                type="number"
                min={8}
                max={24}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.alignment`}>
          {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Alignment</Label>
              <SingleSelect
                options={ALIGNMENTS.map((align) => ({ value: align, label: align }))}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value ?? 'left')}
              />
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.color`}>
          {(field: { state: { value: string }; handleChange: (v: string) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <Input type="color" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.bold`}>
          {(field: { state: { value: boolean }; handleChange: (v: boolean) => void }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4"
              />
              <Label className="text-xs">Bold</Label>
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.italic`}>
          {(field: { state: { value: boolean }; handleChange: (v: boolean) => void }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4"
              />
              <Label className="text-xs">Italic</Label>
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.uppercase`}>
          {(field: { state: { value: boolean }; handleChange: (v: boolean) => void }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4"
              />
              <Label className="text-xs">Uppercase</Label>
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.marginLeft`}>
          {(field: { state: { value: number }; handleChange: (v: number) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Margin Left (in)</Label>
              <Input
                type="number"
                min={0}
                max={4}
                step={0.1}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.marginRight`}>
          {(field: { state: { value: number }; handleChange: (v: number) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Margin Right (in)</Label>
              <Input
                type="number"
                min={0}
                max={4}
                step={0.1}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>

        <form.Field name={`${blockName}.spaceBefore`}>
          {(field: { state: { value: number }; handleChange: (v: number) => void }) => (
            <div className="space-y-1">
              <Label className="text-xs">Space Before (pt)</Label>
              <Input
                type="number"
                min={0}
                max={72}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>
      </div>
    </details>
  );
}
