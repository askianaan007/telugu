'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

const inputClassName =
  'text-brand-charcoal placeholder:text-brand-muted/50 [font-family:var(--font-geist)] min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-normal leading-normal outline-none focus:ring-0'

const wrapperClassName =
  'flex items-center gap-3 rounded-[10px] border border-[#BFBFBF] px-2 py-2.5'

type BookingFormFieldBaseProps = {
  id: string
  label: string
  iconSrc: string
  className?: string
}

type BookingFormFieldInputProps = BookingFormFieldBaseProps & {
  type?: 'text' | 'tel' | 'date'
  placeholder?: string
  value: string
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange']
  required?: boolean
}

type BookingFormFieldSelectProps = BookingFormFieldBaseProps & {
  variant: 'select'
  placeholder?: string
  value: string
  onChange: SelectHTMLAttributes<HTMLSelectElement>['onChange']
  options: readonly { value: string; label: string }[]
}

export type BookingFormFieldProps = BookingFormFieldInputProps | BookingFormFieldSelectProps

function isSelectField(props: BookingFormFieldProps): props is BookingFormFieldSelectProps {
  return 'variant' in props && props.variant === 'select'
}

export function BookingFormField(props: BookingFormFieldProps) {
  const { id, label, iconSrc, className } = props

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-brand-charcoal mb-3 block [font-family:var(--font-geist)] text-[13px] leading-normal font-semibold"
      >
        {label}
      </label>
      <div className={wrapperClassName}>
        <Image
          src={iconSrc}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0"
          aria-hidden
        />
        {isSelectField(props) ? (
          <PassengerSelect
            id={id}
            value={props.value}
            onChange={props.onChange}
            placeholder={props.placeholder}
            options={props.options}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={props.type ?? 'text'}
            value={props.value}
            onChange={props.onChange}
            placeholder={props.placeholder}
            required={props.required}
            className={inputClassName}
          />
        )}
      </div>
    </div>
  )
}

function PassengerSelect({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string
  value: string
  onChange: SelectHTMLAttributes<HTMLSelectElement>['onChange']
  placeholder?: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={cn(
          inputClassName,
          'w-full appearance-none pr-6',
          !value && 'text-brand-muted/50'
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="text-brand-muted pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2"
        aria-hidden
      />
    </div>
  )
}
