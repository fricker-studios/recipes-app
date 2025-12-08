import { lazy } from 'react';
import { wrapCreateBrowserRouterV7 } from '@sentry/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { LazyWrapper } from './components/LazyWrapper';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';

const sentryCreateBrowserRouter = wrapCreateBrowserRouterV7(createBrowserRouter);

const Recipes = lazy(() =>
  import('@/pages/Recipes.page').then((m) => ({
    default: m.Recipes,
  }))
);

const RecipeDetail = lazy(() =>
  import('@/pages/RecipeDetail.page').then((m) => ({
    default: m.RecipeDetail,
  }))
);

const Ingredients = lazy(() =>
  import('@/pages/Ingredients.page').then((m) => ({
    default: m.Ingredients,
  }))
);

const IngredientDetail = lazy(() =>
  import('@/pages/IngredientDetail.page').then((m) => ({
    default: m.IngredientDetail,
  }))
);

const RecipeLists = lazy(() =>
  import('@/pages/RecipeLists.page').then((m) => ({
    default: m.RecipeLists,
  }))
);

const FdcFoodItems = lazy(() =>
  import('@/pages/FdcFoodItems.page').then((m) => ({
    default: m.FdcFoodItems,
  }))
);

const FdcFoodItemDetail = lazy(() =>
  import('@/pages/FdcFoodItemDetail.page').then((m) => ({
    default: m.FdcFoodItemDetail,
  }))
);

const FdcSettings = lazy(() =>
  import('@/pages/FdcSettings.page').then((m) => ({
    default: m.FdcSettings,
  }))
);

export function Router() {
  const router = sentryCreateBrowserRouter([
    {
      path: '/',
      element: (
        <AppLayout>
          <LazyWrapper>
            <Recipes />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/recipes',
      element: (
        <AppLayout>
          <LazyWrapper>
            <Recipes />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/recipes/:id',
      element: (
        <AppLayout>
          <LazyWrapper>
            <RecipeDetail />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/ingredients',
      element: (
        <AppLayout>
          <LazyWrapper>
            <Ingredients />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/ingredients/:id',
      element: (
        <AppLayout>
          <LazyWrapper>
            <IngredientDetail />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/lists',
      element: (
        <AppLayout>
          <LazyWrapper>
            <RecipeLists />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/fdc',
      element: (
        <AppLayout>
          <LazyWrapper>
            <FdcFoodItems />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/fdc/food-items/:id',
      element: (
        <AppLayout>
          <LazyWrapper>
            <FdcFoodItemDetail />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
    {
      path: '/fdc/settings',
      element: (
        <AppLayout>
          <LazyWrapper>
            <FdcSettings />
          </LazyWrapper>
        </AppLayout>
      ),
      errorElement: <RouterErrorBoundary />,
    },
  ]);

  return <RouterProvider router={router} />;
}
