'use client';

import { useCallback, useEffect, useState } from 'react';

export type MainSidebarMode = 'full' | 'rail' | 'hidden';
export type TopicsSidebarMode = 'open' | 'hidden';

const STORAGE_MAIN = 'learn-main-sidebar';
const STORAGE_TOPICS = 'learn-topics-sidebar';
const LAPTOP_BREAKPOINT = 1280;

function readStoredMain(): MainSidebarMode {
  if (typeof window === 'undefined') return 'full';
  const v = localStorage.getItem(STORAGE_MAIN);
  if (v === 'full' || v === 'rail' || v === 'hidden') return v;
  return 'full';
}

function readStoredTopics(): TopicsSidebarMode {
  if (typeof window === 'undefined') return 'open';
  const v = localStorage.getItem(STORAGE_TOPICS);
  if (v === 'open' || v === 'hidden') return v;
  return 'open';
}

function defaultsForWidth(width: number): { main: MainSidebarMode; topics: TopicsSidebarMode } {
  if (width < LAPTOP_BREAKPOINT) {
    return { main: 'rail', topics: 'hidden' };
  }
  return { main: 'full', topics: 'open' };
}

export function useLearnSidebar() {
  const [mainMode, setMainMode] = useState<MainSidebarMode>('full');
  const [topicsMode, setTopicsMode] = useState<TopicsSidebarMode>('open');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    const responsive = defaultsForWidth(width);
    const storedMain = readStoredMain();
    const storedTopics = readStoredTopics();

    setMainMode(width < LAPTOP_BREAKPOINT ? responsive.main : storedMain);
    setTopicsMode(width < LAPTOP_BREAKPOINT ? responsive.topics : storedTopics);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_MAIN, mainMode);
  }, [mainMode, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_TOPICS, topicsMode);
  }, [topicsMode, ready]);

  const cycleMainSidebar = useCallback(() => {
    setMainMode((m) => {
      if (m === 'full') return 'rail';
      if (m === 'rail') return 'hidden';
      return 'full';
    });
  }, []);

  const toggleMainSidebar = useCallback(() => {
    setMainMode((m) => (m === 'hidden' ? 'full' : 'hidden'));
  }, []);

  const setMainFull = useCallback(() => setMainMode('full'), []);
  const setMainRail = useCallback(() => setMainMode('rail'), []);
  const hideMainSidebar = useCallback(() => setMainMode('hidden'), []);

  const toggleTopicsSidebar = useCallback(() => {
    setTopicsMode((m) => (m === 'open' ? 'hidden' : 'open'));
  }, []);

  const openTopicsSidebar = useCallback(() => setTopicsMode('open'), []);

  return {
    mainMode,
    topicsMode,
    cycleMainSidebar,
    toggleMainSidebar,
    setMainFull,
    setMainRail,
    hideMainSidebar,
    toggleTopicsSidebar,
    openTopicsSidebar,
    isMainFull: mainMode === 'full',
    isMainRail: mainMode === 'rail',
    isMainHidden: mainMode === 'hidden',
    isTopicsOpen: topicsMode === 'open',
  };
}
