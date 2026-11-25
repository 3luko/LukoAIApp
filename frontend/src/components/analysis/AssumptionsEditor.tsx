import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  ASSUMPTION_SPECS,
  describeAssumption,
  formatAssumption,
  parseAssumption,
} from '../../lib/assumptionFields'
import type { AssumptionKey, AssumptionSpec } from '../../lib/assumptionFields'
import type { AssumptionsInput, CalculateResponse } from '../../types/calculate'
import type { FieldDef } from '../../types/form'
import { FormField } from '../ui/FormField'

/** Why a factor can't be edited right now, by assumption (for example "No loan: all cash"). */
export type DisabledReasons = Partial<Record<AssumptionKey, string>>

interface AssumptionsEditorProps {
  /** Makes the input ids unique when more than one editor is on the page. */
  idPrefix: string
  keys: AssumptionKey[]
  overrides: AssumptionsInput
  /** The default assumptions (from the first response), so we can show "Default: 5%". */
  baseline: CalculateResponse['assumptions'] | null
  disabled: DisabledReasons
  /** Changing this number resets every field's typed text. */
  resetVersion: number
  onChange: (key: AssumptionKey, value: number | undefined) => void
  onReset: (keys: AssumptionKey[]) => void
}

/** Editable fields for a set of assumptions. Blank means "use the default". */
export function AssumptionsEditor({
  idPrefix,
  keys,
  overrides,
  baseline,
  disabled,
  resetVersion,
  onChange,
  onReset,
}: AssumptionsEditorProps) {
  const anyChanged = keys.some((key) => overrides[key] !== undefined)

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <AssumptionRow
          key={`${key}-${resetVersion}`}
          idPrefix={idPrefix}
          spec={ASSUMPTION_SPECS[key]}
          assumptionKey={key}
          override={overrides[key]}
          defaultValue={baseline?.[key].value ?? null}
          disabledReason={disabled[key]}
          onChange={onChange}
        />
      ))}

      {anyChanged && (
        <button
          type="button"
          onClick={() => onReset(keys)}
          className="rounded-control text-sm text-muted underline underline-offset-2 transition-colors duration-(--duration-fast) hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reset these to the defaults
        </button>
      )}
    </div>
  )
}

interface AssumptionRowProps {
  idPrefix: string
  spec: AssumptionSpec
  assumptionKey: AssumptionKey
  override: number | undefined
  defaultValue: number | null
  disabledReason: string | undefined
  onChange: (key: AssumptionKey, value: number | undefined) => void
}

/**
 * One field. It keeps the text as typed, so half-typed input like "7." never reaches the
 * backend: only a valid number (or a blank) is passed up.
 */
function AssumptionRow({
  idPrefix,
  spec,
  assumptionKey,
  override,
  defaultValue,
  disabledReason,
  onChange,
}: AssumptionRowProps) {
  const [text, setText] = useState(() => (override === undefined ? '' : formatAssumption(spec.kind, override)))
  const [error, setError] = useState<string>()
  const changed = override !== undefined

  const defaultText = defaultValue === null ? null : describeAssumption(spec.kind, defaultValue)
  const hint =
    disabledReason ??
    (defaultText === null
      ? spec.hint
      : `${spec.hint} ${changed ? `Changed from the default of ${defaultText}.` : `Default: ${defaultText}.`}`)

  const field: FieldDef = {
    id: `${idPrefix}-${assumptionKey}`,
    label: spec.label,
    type: 'number',
    prefix: spec.prefix,
    placeholder: defaultValue === null ? undefined : formatAssumption(spec.kind, defaultValue),
    hint,
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const next = event.target.value
    setText(next)
    const result = parseAssumption(spec.kind, next)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(undefined)
    onChange(assumptionKey, result.value)
  }

  function reset() {
    setText('')
    setError(undefined)
    onChange(assumptionKey, undefined)
  }

  return (
    <div className="space-y-1">
      <FormField field={field} value={text} onChange={handleChange} error={error} disabled={Boolean(disabledReason)} />
      {changed && !disabledReason && (
        <button
          type="button"
          onClick={reset}
          className="rounded-control text-xs text-muted underline underline-offset-2 transition-colors duration-(--duration-fast) hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reset to default
        </button>
      )}
    </div>
  )
}
