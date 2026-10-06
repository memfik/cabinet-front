"use client"

import {useState, type ChangeEvent, type ComponentProps, type CSSProperties} from "react"
import {DayPicker, type DropdownProps} from "react-day-picker"
import {enUS, kk, ru} from "date-fns/locale"
import {CalendarDays} from "lucide-react"
import "react-day-picker/style.css"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {toDateInput} from "@/lib/format"
import {cn} from "@/lib/utils"
import {useI18n, type Locale} from "@/i18n"

/**
 * Поля даты и даты-времени в формате `дд/мм/гггг` независимо от локали браузера/ОС
 * (нативный `<input type="date">` на Linux показывает `мм/дд/гггг`).
 * Значение наружу — как у нативных полей: `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm`, пока ввод неполный или неверный — `""`.
 */

type Props = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type" | "min" | "max"> & {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

/** Оставляет цифры и расставляет разделители по маске (`дд/мм/гггг` или `дд/мм/гггг чч:мм`). */
function mask(raw: string, withTime: boolean): string {
  const d = raw.replace(/\D/g, "").slice(0, withTime ? 12 : 8)
  let out = d.slice(0, 2)
  if (d.length > 2) out += "/" + d.slice(2, 4)
  if (d.length > 4) out += "/" + d.slice(4, 8)
  if (withTime && d.length > 8) out += " " + d.slice(8, 10)
  if (withTime && d.length > 10) out += ":" + d.slice(10, 12)
  return out
}

/** Значение API → текст в поле. */
function toText(value: string, withTime: boolean): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return ""
  const date = `${m[3]}/${m[2]}/${m[1]}`
  return withTime && m[4] ? `${date} ${m[4]}:${m[5]}` : date
}

/** Текст в поле → значение API (`""`, если неполное или несуществующая дата). */
function toValue(text: string, withTime: boolean): string {
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}))?$/)
  if (!m || (withTime && !m[4])) return ""
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return ""
  if (withTime && (Number(m[4]) > 23 || Number(m[5]) > 59)) return ""
  const iso = `${m[3]}-${m[2]}-${m[1]}`
  return withTime ? `${iso}T${m[4]}:${m[5]}` : iso
}

/** Месяц/год в шапке календаря — наш Select вместо нативного `<select>`. */
function CaptionSelect({options, value, onChange, disabled}: DropdownProps) {
  const current = options?.find((o) => o.value === value)
  return (
    <Select
      value={String(value)}
      disabled={disabled}
      onValueChange={(v) => onChange?.({target: {value: v}} as ChangeEvent<HTMLSelectElement>)}
    >
      <SelectTrigger size="sm" className="font-medium capitalize">
        {current?.label}
      </SelectTrigger>
      <SelectContent className="max-h-64 min-w-24">
        {options?.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled} className="capitalize">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const dateLocales: Record<Locale, typeof ru> = {ru, en: enUS, kk}

/** `YYYY-MM-DD` → Date в локальной зоне (`new Date("YYYY-MM-DD")` дал бы UTC и сдвиг на день). */
const parseDay = (v: string | undefined) => {
  const m = v?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined
}

function MaskedInput({withTime, value, onChange, min, max, className, ...rest}: Props & {withTime: boolean}) {
  const {locale, t} = useI18n()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(() => toText(value, withTime))
  // внешнее значение изменилось не из этого поля (пресет, сброс) — подтягиваем текст
  if (value !== toValue(text, withTime) && (value !== "" || toValue(text, withTime) !== "")) {
    setText(toText(value, withTime))
  }

  const outOfRange = !!value && ((!!min && value < min) || (!!max && value > max))

  const pickDay = (day: Date | undefined) => {
    if (!day) return
    const iso = toDateInput(day)
    // время сохраняем; если его не было — подставляем 00:00
    const next = withTime ? `${iso}T${value.slice(11, 16) || "00:00"}` : iso
    setText(toText(next, withTime))
    onChange(next)
    if (!withTime) setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        className="pr-10"
        inputMode="numeric"
        autoComplete="off"
        placeholder={withTime ? "дд/мм/гггг чч:мм" : "дд/мм/гггг"}
        {...rest}
        value={text}
        aria-invalid={rest["aria-invalid"] || outOfRange || undefined}
        onChange={(e) => {
          const next = mask(e.target.value, withTime)
          setText(next)
          onChange(toValue(next, withTime))
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={rest.disabled}
          aria-label={t("common.calendar")}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center disabled:opacity-50"
        >
          <CalendarDays className="size-4" />
        </PopoverTrigger>
        <PopoverContent className="p-2" align="end">
          <DayPicker
            mode="single"
            locale={dateLocales[locale]}
            weekStartsOn={1}
            captionLayout="dropdown"
            components={{Dropdown: CaptionSelect}}
            classNames={{dropdowns: "flex items-center gap-1.5"}}
            startMonth={parseDay(min) ?? new Date(2015, 0)}
            endMonth={parseDay(max) ?? new Date(new Date().getFullYear() + 5, 11)}
            selected={parseDay(value)}
            defaultMonth={parseDay(value) ?? parseDay(max) ?? new Date()}
            onSelect={pickDay}
            disabled={[...(min ? [{before: parseDay(min)!}] : []), ...(max ? [{after: parseDay(max)!}] : [])]}
            style={
              {
                "--rdp-accent-color": "var(--brand)",
                "--rdp-accent-background-color": "color-mix(in oklab, var(--brand) 15%, transparent)",
              } as CSSProperties
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DateInput(props: Props) {
  return <MaskedInput {...props} withTime={false} />
}

export function DateTimeInput(props: Props) {
  return <MaskedInput {...props} withTime />
}
