"use client";

import Image from "next/image";
import {
  Children,
  type ChangeEvent,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "./cn";

// A dropdown in the style of the top bar's account menu (Figma New Design 187:10090), replacing the native <select>
// list, which the browser draws in its own (often dark grey) theme. It takes the same <option> children and calls
// onChange with an event-like object, so `event.target.value` keeps working. A hidden input carries `name` for forms.

type Option = { value: string; label: string; disabled: boolean };

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : isValidElement(child) ? textOf((child.props as { children?: ReactNode }).children) : ""))
    .join("");
}

function optionsOf(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== "option") return [];
    const props = (child as ReactElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>).props;
    const label = textOf(props.children);
    return [{ value: props.value === undefined ? label : String(props.value), label, disabled: Boolean(props.disabled) }];
  });
}

export type SelectMenuProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  invalid?: boolean;
  // Classes of the closed box (the trigger).
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  children: ReactNode;
};

export function SelectMenu({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  disabled,
  invalid,
  className,
  children,
  ...aria
}: SelectMenuProps) {
  const options = optionsOf(children);
  const [own, setOwn] = useState(defaultValue);
  const current = value ?? own;
  const selected = options.find((option) => option.value === current);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [upward, setUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
  });

  function show() {
    if (disabled) return;
    // Open upwards when the list would not fit under the box.
    const box = rootRef.current?.getBoundingClientRect();
    setUpward(box ? window.innerHeight - box.bottom < 280 && box.top > window.innerHeight - box.bottom : false);
    setActive(Math.max(0, options.findIndex((option) => option.value === current)));
    setOpen(true);
  }

  function choose(option: Option) {
    if (option.disabled) return;
    setOpen(false);
    if (option.value === current) return;
    if (value === undefined) setOwn(option.value);
    const target = { value: option.value, name: name ?? "", id: id ?? "" } as HTMLSelectElement;
    onChange?.({ target, currentTarget: target } as ChangeEvent<HTMLSelectElement>);
  }

  function move(from: number, step: number) {
    for (let index = from + step; index >= 0 && index < options.length; index += step) {
      if (!options[index].disabled) return index;
    }
    return from;
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => move(index, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => move(index, -1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(move(-1, 1));
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(move(options.length, -1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (event.key.length === 1) {
      // Type-ahead: jump to the next option starting with the letter.
      const letter = event.key.toLowerCase();
      const order = [...options.keys()].map((step) => (active + 1 + step) % options.length);
      const match = order.find((index) => !options[index].disabled && options[index].label.toLowerCase().startsWith(letter));
      if (match !== undefined) setActive(match);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      {name && <input name={name} type="hidden" value={current} />}
      <button
        {...aria}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-[50px] w-full items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] pl-[13px] pr-12 text-left text-base leading-normal text-[#1b1b1d] outline-none focus-visible:border-[#0058be] focus-visible:ring-2 focus-visible:ring-[rgba(0,88,190,0.15)] disabled:cursor-not-allowed disabled:bg-[#f0edef] disabled:text-[#45474c]",
          open && "border-[#0058be] ring-2 ring-[rgba(0,88,190,0.15)]",
          !current && "text-[#75777d]",
          invalid && "border-[#dc2626]",
          className,
        )}
        disabled={disabled}
        id={id}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        role="combobox"
        type="button"
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? options[0]?.label ?? ""}</span>
      </button>
      <Image
        alt=""
        className={cn("pointer-events-none absolute right-4 top-1/2 -translate-y-1/2", open && "rotate-180")}
        height={24}
        src="/assessment/chevron-down.svg"
        width={24}
      />

      {open && (
        <ul
          className={cn(
            "absolute left-0 right-0 z-40 flex max-h-[280px] flex-col gap-0.5 overflow-y-auto rounded-2xl bg-[#fafbfd] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
            upward ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
          )}
          id={listId}
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === current;
            return (
              <li
                aria-disabled={option.disabled || undefined}
                aria-selected={isSelected}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm leading-normal text-[#1b1b1d]",
                  index === active && "bg-[#e6eff9]",
                  isSelected && "font-semibold text-[#0058be]",
                  option.disabled && "cursor-not-allowed text-[#9aa1ae]",
                )}
                id={optionId(index)}
                key={`${option.value}-${index}`}
                onClick={() => choose(option)}
                onPointerMove={() => !option.disabled && setActive(index)}
                role="option"
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {isSelected && (
                  <svg aria-hidden className="size-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
