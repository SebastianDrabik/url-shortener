"use client"

import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
    value?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    className?: string
    id?: string
    disabled?: boolean
}

export function DatePicker({
                               value,
                               onChange,
                               placeholder = "Pick a date",
                               className,
                               id,
                               disabled = false,
                           }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id={id}
                    disabled={disabled}
                    className={cn(
                        "w-full max-w-sm justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {value ? format(value, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    defaultMonth={value}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}