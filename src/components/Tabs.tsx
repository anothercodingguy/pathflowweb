"use client";

import React, { useRef } from "react";

/*
  Accessible tabs (the WAI-ARIA "tabs" pattern), shared by every tab group on
  the page.

  What this adds over a row of plain <button>s:
  - role="tablist" / role="tab" / aria-selected, so a screen reader announces
    "tab, 2 of 3, selected" instead of three unrelated buttons.
  - Roving tabindex: only the selected tab is in the Tab order, so Tab moves
    past the whole group in one keypress.
  - Left/Right arrows (plus Home/End) move between tabs.

  Styling stays with the caller: pass `className` for the row and
  `tabClassName(selected, value)` for each tab.

  Pair it with `tabPanelProps(idBase, value)` on the element that shows the
  selected tab's content, so tab and panel point at each other.
*/

export interface TabItem<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface TabListProps<T extends string> {
  /** Unique prefix for the generated tab / panel ids. */
  idBase: string;
  /** Accessible name for the group, e.g. "Investigation views". */
  label: string;
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  tabClassName: (selected: boolean, value: T) => string;
}

export const tabId = (idBase: string, value: string) => `${idBase}-tab-${value}`;
export const panelId = (idBase: string, value: string) => `${idBase}-panel-${value}`;

/** Spread onto the element that holds the selected tab's content. */
export function tabPanelProps(idBase: string, value: string) {
  return {
    role: "tabpanel" as const,
    id: panelId(idBase, value),
    "aria-labelledby": tabId(idBase, value),
    tabIndex: 0,
  };
}

export function TabList<T extends string>({
  idBase,
  label,
  tabs,
  value,
  onChange,
  className,
  tabClassName,
}: TabListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((t) => t.value === value);
    let next = current;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextValue = tabs[next].value;
    onChange(nextValue);
    // Move focus with the selection so the arrow keys keep working.
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(tabId(idBase, nextValue))}`)?.focus();
  };

  return (
    <div ref={listRef} role="tablist" aria-label={label} onKeyDown={handleKeyDown} className={className}>
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={tabId(idBase, tab.value)}
            aria-selected={selected}
            aria-controls={panelId(idBase, tab.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={tabClassName(selected, tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
