'use client';

const STYLE_ID = 'sandpack-css';

let injectPromise: Promise<void> | null = null;

/** Loads Sandpack CSS on the client only — never import sandpack-react from the root layout. */
export function ensureSandpackStyles(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.getElementById(STYLE_ID)) {
    return Promise.resolve();
  }

  if (!injectPromise) {
    injectPromise = import('@codesandbox/sandpack-react').then(({ getSandpackCssText }) => {
      if (document.getElementById(STYLE_ID)) return;

      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = getSandpackCssText();
      document.head.appendChild(style);
    });
  }

  return injectPromise;
}
