'use client';

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Code,
  Lightbulb,
  MessageSquare,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_META: Record<string, { label: string; icon: LucideIcon }> = {
  overview: { label: 'Overview', icon: BookOpen },
  examples: { label: 'Examples', icon: Code },
  indepth: { label: 'In-Depth', icon: Lightbulb },
  questions: { label: 'Interview Q&A', icon: MessageSquare },
  playground: { label: 'Playground', icon: PlayCircle },
};

export interface TopicTabProps {
  value: string;
  label?: string;
  children: ReactNode;
}

export function TopicTab({ value, children }: TopicTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      {children}
    </TabsContent>
  );
}

TopicTab.displayName = 'TopicTab';

export interface TopicTabsProps {
  defaultValue?: string;
  children: ReactNode;
}

export function TopicTabs({ defaultValue = 'overview', children }: TopicTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = Children.toArray(children)
    .filter((child): child is ReactElement<TopicTabProps> => {
      if (!isValidElement(child)) return false;
      const typeName = (child.type as { displayName?: string }).displayName;
      if (typeName === 'TopicTab') return true;
      const value = (child.props as { value?: unknown }).value;
      return typeof value === 'string';
    })
    .map((child) => {
      const meta = TAB_META[child.props.value];
      return {
        value: child.props.value,
        label: child.props.label ?? meta?.label ?? child.props.value,
        icon: meta?.icon ?? BookOpen,
      };
    });

  const cols = Math.min(tabs.length, 5);
  const tabKey = tabs.map((t) => t.value).join('|');
  const [activeTab, setActiveTab] = useState(defaultValue);

  useEffect(() => {
    const allowed = tabKey.split('|');
    const sync = () => {
      const tab = new URLSearchParams(window.location.search).get('tab');
      setActiveTab(tab && allowed.includes(tab) ? tab : defaultValue);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [defaultValue, tabKey]);

  function handleTabChange(value: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', value);
    setActiveTab(value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-2">
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
