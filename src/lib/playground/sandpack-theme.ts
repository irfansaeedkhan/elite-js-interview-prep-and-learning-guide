'use client';

import { defaultDark, defaultLight, type SandpackTheme } from '@codesandbox/sandpack-react';

export const sandpackLightTheme: SandpackTheme = {
  ...defaultLight,
  colors: {
    ...defaultLight.colors,
    surface1: '#ffffff',
    surface2: '#f3f3f5',
    surface3: '#ececf0',
    accent: '#2563eb',
  },
};

export const sandpackDarkTheme: SandpackTheme = {
  ...defaultDark,
  colors: {
    ...defaultDark.colors,
    surface1: '#1a1a1a',
    surface2: '#262626',
    surface3: '#333333',
    accent: '#60a5fa',
  },
};
