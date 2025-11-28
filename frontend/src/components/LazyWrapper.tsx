import { Suspense } from 'react';
import { Center, Loader } from '@mantine/core';

interface LazyWrapperProps {
  children: React.ReactNode;
}

export function LazyWrapper({ children }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        <Center style={{ height: '60vh' }}>
          <Loader color="teal" size="md" />
        </Center>
      }
    >
      {children}
    </Suspense>
  );
}
