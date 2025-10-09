"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import type {
  ListBoxItemProps,
  ValidationResult,
  Selection,
} from "react-aria-components";
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Text,
} from "react-aria-components";
import { IoChevronDown, IoClose } from "react-icons/io5";
import { useFieldContext } from "./Field";
import { cn } from "@/utilities/cn";

// ============================================================================
// Types
// ============================================================================
interface MultiSelectOption {
  value: string;
  label: string;
}

interface MyMultiSelectProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  options: MultiSelectOption[];
  name: string;
  placeholder?: string;
  disabled?: boolean;
  maxDisplay?: number;
  onChange?: (values: string[]) => void;
  onValueChange?: (values: string[]) => void;
}

// ============================================================================
// Component
// ============================================================================
export const MyMultiSelect = forwardRef<HTMLButtonElement, MyMultiSelectProps>(
  (
    {
      label,
      description,
      errorMessage,
      options,
      name,
      placeholder = "Select options...",
      disabled,
      maxDisplay = 3,
      onChange,
      onValueChange,
    },
    ref,
  ) => {
    const { id, form, disabled: rootDisabled } = useFieldContext();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isDisabled =
      form?.formState?.isSubmitting || disabled || rootDisabled;

    const selectedValues: string[] = form?.watch(name) || [];
    const selectedOptions = options.filter((opt) =>
      selectedValues.includes(opt.value),
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      if (open) document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleSelectionChange = (keys: Selection) => {
      if (typeof keys === "string") return;
      const values = Array.from(keys).map(String);
      form?.setValue(name, values, { shouldValidate: true, shouldDirty: true });
      onChange?.(values);
      onValueChange?.(values);
    };

    const removeValue = (value: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValues = selectedValues.filter((v) => v !== value);
      form?.setValue(name, newValues, {
        shouldValidate: true,
        shouldDirty: true,
      });
      onChange?.(newValues);
      onValueChange?.(newValues);
    };

    const renderSelectedText = () => {
      if (selectedOptions.length === 0) {
        return (
          <span className="text-gray-500 dark:text-white/50">
            {placeholder}
          </span>
        );
      }

      if (selectedOptions.length <= maxDisplay) {
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                  "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-light",
                  "transition-colors duration-150",
                )}
              >
                <span className="max-w-[100px] truncate">{opt.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if (!isDisabled) {
                      removeValue(opt.value, e);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      removeValue(opt.value, e as unknown as React.MouseEvent);
                    }
                  }}
                  className={cn(
                    "rounded p-0.5 transition-colors duration-150",
                    "hover:bg-primary/25 dark:hover:bg-primary/30",
                    "focus:ring-primary/50 focus:ring-1 focus:outline-none",
                    isDisabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  )}
                  aria-label={`Remove ${opt.label}`}
                  aria-disabled={isDisabled}
                >
                  <IoClose className="size-2.5" />
                </span>
              </span>
            ))}
          </div>
        );
      }

      return (
        <span className="font-medium text-gray-800 dark:text-white">
          {selectedOptions.length} selected
        </span>
      );
    };

    return (
      <div className="relative w-full" ref={dropdownRef}>
        {label && (
          <Label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </Label>
        )}

        <span
          data-slot="control"
          className={cn(
            "relative block rounded-xl transition-all duration-150",
            open &&
              !isDisabled &&
              "ring-primary dark:ring-offset-primary-dark ring-2 ring-offset-1 ring-offset-inherit dark:ring-white/30",
          )}
        >
          <Button
            ref={ref}
            onPress={() => !isDisabled && setOpen((prev) => !prev)}
            isDisabled={isDisabled}
            className={cn(
              "group relative flex w-full appearance-none items-center justify-between",
              "dark:bg-primary-dark-foreground rounded-xl border-[1.5px] border-gray-300 bg-transparent dark:border-white/10",
              "text-sm/6 text-gray-800 dark:text-white",
              "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)]",
              "hover:border-gray-400 focus:outline-none dark:hover:border-white/20",
              "disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:border-white/10 dark:disabled:bg-gray-900/50 dark:disabled:text-white/50",
              "transition-all duration-150",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center text-left">
              {renderSelectedText()}
            </div>
            <IoChevronDown
              className={cn(
                "ml-3 size-4 flex-shrink-0 text-gray-600 transition-transform duration-200 dark:text-gray-400",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </Button>
        </span>

        {description && (
          <Text
            slot="description"
            className="mt-1.5 text-sm text-gray-600 dark:text-gray-400"
          >
            {description}
          </Text>
        )}
        {errorMessage && (
          <FieldError className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </FieldError>
        )}

        {/* Dropdown Content */}
        {open && (
          <div
            className={cn(
              "absolute left-0 z-50 mt-1 w-full overflow-hidden rounded-xl shadow-lg",
              "dark:from-primary-dark dark:to-primary-dark-foreground bg-gradient-to-br from-gray-900 to-gray-950 ring-1 ring-gray-800 dark:bg-gradient-to-br dark:ring-white/10",
              "animate-in fade-in-0 zoom-in-95 duration-150",
            )}
          >
            <ListBox
              aria-label="Select options"
              selectionMode="multiple"
              selectedKeys={new Set(selectedValues)}
              onSelectionChange={handleSelectionChange}
              items={options}
              className="max-h-[250px] overflow-auto p-1"
            >
              {(item) => (
                <ListBoxItem
                  key={item.value}
                  id={item.value}
                  className={({ isFocused, isSelected }) =>
                    cn(
                      "relative flex cursor-pointer items-center rounded-lg p-3 text-sm outline-none select-none",
                      "text-gray-200 transition-colors duration-150",
                      isSelected && "bg-primary/10 font-medium",
                      isFocused && "bg-primary text-white",
                    )
                  }
                >
                  {item.label}
                </ListBoxItem>
              )}
            </ListBox>
          </div>
        )}

        {/* Hidden inputs for form submission */}
        {selectedValues.map((value, i) => (
          <input key={i} type="hidden" name={name} value={value} />
        ))}
      </div>
    );
  },
);

MyMultiSelect.displayName = "MyMultiSelect";
export default MyMultiSelect;
