'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export type GoalFilter = 'active' | 'inactive' | 'all';

interface FilterTabsProps {
  activeFilter: GoalFilter;
  onFilterChange: (filter: GoalFilter) => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const t = useTranslations();
  
  const tabs: { value: GoalFilter; label: string }[] = [
    { value: 'active', label: t('goal.filterActive') },
    { value: 'inactive', label: t('goal.filterInactive') },
    { value: 'all', label: t('goal.filterAll') },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={activeFilter === tab.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onFilterChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}