'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgressMigration } from '@/hooks/use-topic-progress';

function ProgressMigration() {
  const { migrate, shouldMigrate } = useProgressMigration();

  useEffect(() => {
    if (shouldMigrate) {
      void migrate();
    }
  }, [shouldMigrate, migrate]);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProgressMigration />
      {children}
    </QueryClientProvider>
  );
}
