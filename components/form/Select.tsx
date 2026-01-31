import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SelectOption {
  label: string
  value: string
}

type SelectFieldProps = {
  label: string
  options: SelectOption[]
  error?: string

  /** Name for native form submission (server actions). */
  name?: string

  /** Controlled value */
  value?: string

  /** Controlled change handler */
  onValueChange?: (value: string) => void

  placeholder?: string
  className?: string
}

export function SelectField({
  label,
  options,
  error,
  name,
  value,
  onValueChange,
  placeholder,
  className = "",
}: SelectFieldProps) {
  const id = React.useId()

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Hidden input makes Radix Select show up in FormData */}
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full max-w-48">
          <SelectValue placeholder={placeholder ?? `Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
