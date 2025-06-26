"use client";

import type React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface ProfessionalTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
}

export function ProfessionalTabs({
  tabs,
  defaultTab,
  onTabChange,
  children,
}: ProfessionalTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Inline Tab Headers */}
      <div className="grid grid-cols-2 items-center gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 relative",
              activeTab === tab.id
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-600 hover:text-pink-600 hover:bg-gray-50 rounded-t-md"
            )}
          >
            {tab.icon && <span className="inline">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">{children}</div>
    </div>
  );
}
