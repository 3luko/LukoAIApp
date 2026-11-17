import type { FieldDef } from '../../types/form'
import type { ChangeEvent } from 'react';

const control =
  'w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-accent/30'


interface FormFieldProps {
  field: FieldDef;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/**
 * Renders a labeled input from a FieldDef.
 * Controlled: the parent owns the value and receives changes through onChange.
 * There's no validation yet.
 */
export function FormField({ field, value, onChange }: FormFieldProps) {
  const hintId = field.hint ? `${field.id}-hint` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={field.id} className="flex items-baseline justify-between text-sm font-medium">
        {field.label}
        {field.optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>

      {field.type === 'select' ? (
        <select
          id={field.id}
          name={field.id}
          value={value}
          onChange={onChange}
          aria-describedby={hintId}
          className={control}
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
            aria-describedby={hintId}
            className={`${control} ${field.prefix ? 'pl-7' : ''}`}
          />
        </div>
      )}

      {field.hint && (
        <p id={hintId} className="text-xs text-muted">
          {field.hint}
        </p>
      )}
    </div>
  )
}
