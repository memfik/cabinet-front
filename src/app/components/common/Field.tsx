"use client"

import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {cn} from "@/lib/utils"

/** Поле формы: подпись, контрол и ошибка валидации (422) под ним. */
export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  )
}

export interface Option {
  value: string
  label: string
}

/** Выпадающий список по массиву {value,label}: в триггере показывается label, а не value. */
export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Выберите…",
  invalid,
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  invalid?: boolean
  className?: string
  disabled?: boolean
}) {
  const current = options.find((o) => o.value === value)
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")} items={options} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)} aria-invalid={invalid}>
        <SelectValue>
          {current ? current.label : <span className="text-muted-foreground">{placeholder}</span>}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
