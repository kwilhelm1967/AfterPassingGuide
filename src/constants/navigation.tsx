/**
 * Navigation Configuration
 * 
 * Centralized navigation items and routing constants.
 */

import React from 'react';
import type { NavigationTab } from '../types';
import type { LucideIcon } from 'lucide-react';
import { Heart, FileText, MessageSquare, ClipboardCheck, Settings } from 'lucide-react';

export interface NavItemConfig {
  id: NavigationTab;
  label: string;
  iconComponent: LucideIcon;
}

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  { id: 'guidance', label: 'Guidance', iconComponent: Heart },
  { id: 'documents', label: 'Documents', iconComponent: FileText },
  { id: 'templates', label: 'Templates', iconComponent: MessageSquare },
  { id: 'executor', label: 'Executor Tools', iconComponent: ClipboardCheck },
  { id: 'settings', label: 'Settings', iconComponent: Settings },
];

export interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
}

export function createNavItems(): NavItem[] {
  return NAV_ITEMS_CONFIG.map(item => {
    const IconComponent = item.iconComponent;
    return {
      id: item.id,
      label: item.label,
      icon: <IconComponent className="w-[18px] h-[18px]" strokeWidth={1.75} />,
    };
  });
}

