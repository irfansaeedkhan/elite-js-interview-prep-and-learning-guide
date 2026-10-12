'use client';

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const tabs = Children.toArray(children)
    .filter(
      (child): child is ReactElement<TopicTabProps> =>
        isValidElement(child) &&
        (child.type as { displayName?: string }).displayName === 'TopicTab',
    )
    .map((child) => {
      const meta = TAB_META[child.props.value];
      return {
        value: child.props.value,
        label: child.props.label ?? meta?.label ?? child.props.value,
        icon: meta?.icon ?? BookOpen,
      };
    });

  const cols = Math.min(tabs.length, 5);
  const tabValues = tabs.map((t) => t.value);
  const tabParam = searchParams.get('tab');
  const activeTab =
    tabParam && tabValues.includes(tabParam) ? tabParam : defaultValue;

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
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
