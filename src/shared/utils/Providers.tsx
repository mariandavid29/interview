'use client';

import { ToastProvider } from '@heroui/toast';
import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';

declare module '@react-types/shared' {
  interface RouterConfig {
    href: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[0]>;
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider placement='top-center' toastOffset={40} />
      {children}
    </HeroUIProvider>
  );
}
