"use client";

import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { formatNumber } from "@/lib/format";

export type Tab = {
  id: string;
  label: string;
  icon: IconName;
  count?: number;
  content: ReactNode;
};

// লুকানো ট্যাবও মাউন্ট থাকে, তাই ট্যাব বদলালে ফর্মে লেখা মুছে যায় না
export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold whitespace-nowrap outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/50 sm:px-3 ${
                selected ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon name={tab.icon} className="hidden size-4 sm:block" />
              {tab.label}
              {tab.count ? (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    selected ? "bg-emerald-100 text-emerald-700" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {formatNumber(tab.count)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="mt-5"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
