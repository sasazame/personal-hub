import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/cn';

export interface FormFieldProps {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  htmlFor?: string;
}

/**
 * Common form field wrapper with label and error handling
 */
export function FormField({
  label,
  error,
  required,
  children,
  className,
  labelClassName,
  errorClassName,
  htmlFor,
}: FormFieldProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message;
  
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            'block text-sm font-medium text-foreground',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {errorMessage && (
        <p className={cn('text-sm text-destructive', errorClassName)}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/**
 * Form field with input
 */
import { Input, InputProps } from './Input';

export interface FormInputProps extends Omit<InputProps, 'label' | 'error'> {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  fieldClassName?: string;
}

export function FormInput({
  label,
  error,
  required,
  fieldClassName,
  ...inputProps
}: FormInputProps) {
  // Don't pass label to Input since FormField handles it
  const inputPropsWithoutLabel = inputProps;
  
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={fieldClassName}
      htmlFor={inputProps.id}
    >
      <Input {...inputPropsWithoutLabel} label="" />
    </FormField>
  );
}

/**
 * Form field with textarea
 */
import { TextArea, TextAreaProps } from './TextArea';

export interface FormTextAreaProps extends Omit<TextAreaProps, 'label' | 'error'> {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  fieldClassName?: string;
}

export function FormTextArea({
  label,
  error,
  required,
  fieldClassName,
  ...textAreaProps
}: FormTextAreaProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={fieldClassName}
      htmlFor={textAreaProps.id}
    >
      <TextArea {...textAreaProps} label="" />
    </FormField>
  );
}

/**
 * Form field with select
 */
export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  options: SelectOption[];
  fieldClassName?: string;
  selectClassName?: string;
}

export function FormSelect({
  label,
  error,
  required,
  options,
  fieldClassName,
  selectClassName,
  ...selectProps
}: FormSelectProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={fieldClassName}
      htmlFor={selectProps.id}
    >
      <select
        {...selectProps}
        className={cn(
          'w-full px-3 py-2 border border-input rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'bg-background text-foreground',
          selectClassName
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

/**
 * Form field with checkbox
 */
export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string;
  error?: FieldError | string;
  fieldClassName?: string;
  checkboxClassName?: string;
}

export function FormCheckbox({
  label,
  error,
  fieldClassName,
  checkboxClassName,
  ...checkboxProps
}: FormCheckboxProps) {
  return (
    <div className={cn('flex items-start', fieldClassName)}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          {...checkboxProps}
          className={cn(
            'h-4 w-4 rounded border-input',
            'text-primary focus:ring-2 focus:ring-ring',
            checkboxClassName
          )}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxProps.id} className="font-medium text-foreground">
          {label}
        </label>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
}

/**
 * Form field with radio group
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormRadioGroupProps {
  name: string;
  label?: string;
  error?: FieldError | string;
  required?: boolean;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  fieldClassName?: string;
}

export function FormRadioGroup({
  name,
  label,
  error,
  required,
  options,
  value,
  onChange,
  fieldClassName,
}: FormRadioGroupProps) {
  return (
    <FormField
      label={label}
      error={error}
      required={required}
      className={fieldClassName}
    >
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-start cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="mt-1 h-4 w-4 text-primary focus:ring-2 focus:ring-ring"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-foreground">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-muted-foreground">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </FormField>
  );
}