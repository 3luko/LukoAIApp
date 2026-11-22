import type { FieldDef } from '../../types/form'
import type { ChangeEvent } from 'react';

/*
 * Shared look for text inputs and selects. Focus is shown with a champagne-gold border and a
 * soft 3px ring (tokens: focus, focus-ring). It is plain CSS, so no React state is involved.
 * The transparent outline is deliberate: it stays invisible normally but lets high-contrast
 * (forced-colors) modes draw a real focus outline. Disabled controls can't take focus, so
 * they never turn gold.
 */
const control =
  'w-full rounded-control border bg-surface px-3 py-2.5 text-sm text-fg ' +
  'transition-[border-color,box-shadow] duration-(--duration-fast) ease-(--ease-out) ' +
  'placeholder:text-subtle focus:outline-2 focus:outline-transparent focus:ring-3 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const controlDefault = 'border-border focus:border-focus focus:ring-focus-ring'

// An invalid field stays red while focused, so a validation error is never hidden by gold.
const controlInvalid = 'border-negative focus:ring-negative/20'


interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** Validation message to show under the field. */
  error?: string;
}

/**
 * Renders a labeled input from a FieldDef.
 * Controlled: the parent owns the value and receives changes through onChange.
 * Shows `error` (when set) under the field and marks the control invalid for screen readers.
 */
export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const hintId = field.hint ? `${field.id}-hint` : undefined
  const errorId = error ? `${field.id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const controlClass = `${control} ${error ? controlInvalid : controlDefault}`
  // The label turns gold while its field has focus (not when the field is invalid).
  const labelClass = `flex items-baseline justify-between text-sm font-medium transition-colors duration-(--duration-fast) ease-(--ease-out) ${
    error ? '' : 'group-focus-within:text-focus'
  }`

  return (
    <div className="group space-y-1.5">
      <label htmlFor={field.id} className={labelClass}>
        {field.label}
        {field.optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </label>

      {field.type === 'select' ? (
        <select
          id={field.id}
          name={field.id}
          value={value}
          onChange={onChange}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={controlClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          {field.prefix && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">
              {field.prefix}
            </span>
          )}
          <input
            id={field.id}
            name={field.id}
            type="text"
            inputMode={field.type === 'number' ? 'decimal' : undefined}
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={`${controlClass} ${field.prefix ? 'pl-7' : ''}`}
          />
        </div>
      )}

      {field.hint && (
        <p id={hintId} className="text-xs text-muted">
          {field.hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-negative">
          {error}
        </p>
      )}
    </div>
  )
}
