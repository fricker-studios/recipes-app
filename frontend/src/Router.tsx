import { lazy } from 'react';
import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LazyWrapper } from './components/LazyWrapper';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';

const sentryCreateBrowserRouter = wrapCreateBrowserRouterV7(createBrowserRouter);

const HelloWorld = lazy(() =>
  import('@/pages/HelloWorld').then((m) => ({
    default: m.HelloWorld,
  }))
);
export function Router() {
  const router = sentryCreateBrowserRouter([
    // Unauthenticated/public routes
    {
      path: '/',
      element: (
        <LazyWrapper>
          <HelloWorld />
        </LazyWrapper>
      ),
      errorElement: <RouterErrorBoundary />,
    },
  ]);

  return <RouterProvider router={router} />;
}
