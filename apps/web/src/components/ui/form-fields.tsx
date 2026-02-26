import { useStore } from '@tanstack/react-form';
import type { FocusEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

import { Button } from './button';
import type { iButtonProps } from './button';
// eslint-disable-next-line import-x/no-cycle
import { useFieldContext, FieldError, useFormContext, FieldDescription, FieldLabel } from './field';
import { Input } from './input';
import { MultiSelect, SingleSelect } from './select';
import type { iMultiSelectProps, iSingleSelectProps } from './select';
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

const useFormErrors = () => {
  const form = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const errors = useStore(form.store, (state) => state.errors);
  return { errors, hasErrors: Object.keys(errors).length > 0 };
};

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
