import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBug,
  IconHome,
  IconLock,
  IconRefresh,
  IconWifi,
} from '@tabler/icons-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import {
  Button,
  Card,
  Center,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

export function RouterErrorBoundary() {
  const error = useRouteError();
  // If 404, check session and redirect if 401
  useEffect(() => {
    if (isRouteErrorResponse(error) && error.status === 404) {
      // Replace with your actual session API endpoint
      fetch('/api/auth/session/', { credentials: 'include' })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = '/';
          }
        })
        .catch(() => {
          // Ignore network errors for this check
        });
    }
  }, [error]);

  // Report to Sentry
  Sentry.withScope((scope) => {
    scope.setContext('routerError', {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isRouteError: isRouteErrorResponse(error),
      errorType: typeof error,
    });

    if (isRouteErrorResponse(error)) {
      scope.setContext('routeErrorResponse', {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      });
    }

    Sentry.captureException(error);
  });

  // Determine error type and content
  const getErrorContent = () => {
    if (isRouteErrorResponse(error)) {
      switch (error.status) {
        case 404:
          return {
            icon: IconAlertTriangle,
            color: 'yellow',
            title: 'Page Not Found',
            message: "The page you're looking for doesn't exist or has been moved.",
            showRefresh: false,
          };
        case 401:
          return {
            icon: IconLock,
            color: 'red',
            title: 'Unauthorized',
            message: 'You need to sign in to access this page.',
            showRefresh: false,
          };
        case 403:
          return {
            icon: IconLock,
            color: 'red',
            title: 'Access Denied',
            message: "You don't have permission to access this resource.",
            showRefresh: false,
          };
        case 500:
          return {
            icon: IconBug,
            color: 'red',
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
            showRefresh: true,
          };
        default:
          return {
            icon: IconBug,
            color: 'red',
            title: `Error ${error.status}`,
            message: error.statusText || 'An unexpected error occurred.',
            showRefresh: true,
          };
      }
    }

    // Handle other error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('network') || message.includes('fetch')) {
        return {
          icon: IconWifi,
          color: 'orange',
          title: 'Connection Problem',
          message: 'Unable to connect to our servers. Please check your internet connection.',
          showRefresh: true,
        };
      }
    }

    // Generic error
    return {
      icon: IconBug,
      color: 'red',
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Our team has been notified.',
      showRefresh: true,
    };
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const errorContent = getErrorContent();
  const IconComponent = errorContent.icon;

  return (
    <Container size="sm" style={{ paddingTop: '10vh', paddingBottom: '10vh' }}>
      <Center>
        <Card
          withBorder
          shadow="lg"
          padding="xl"
          radius="lg"
          style={{ maxWidth: 500, width: '100%' }}
        >
          <Stack gap="lg" align="center">
            <ThemeIcon size="xl" radius="xl" variant="light" color={errorContent.color}>
              <IconComponent size={32} />
            </ThemeIcon>

            <Stack gap="md" align="center">
              <Title order={2} ta="center">
                {errorContent.title}
              </Title>
              <Text ta="center" c="dimmed" size="md">
                {errorContent.message}
              </Text>
            </Stack>

            <Group gap="md" justify="center" wrap="wrap">
              {errorContent.showRefresh && (
                <Button
                  leftSection={<IconRefresh size={16} />}
                  variant="filled"
                  color={errorContent.color}
                  onClick={handleRefresh}
                >
                  Refresh Page
                </Button>
              )}

              <Button
                leftSection={<IconArrowLeft size={16} />}
                variant="light"
                color="gray"
                onClick={handleGoBack}
              >
                Go Back
              </Button>

              <Button
                leftSection={<IconHome size={16} />}
                variant="outline"
                color="teal"
                onClick={handleGoHome}
              >
                Home
              </Button>
            </Group>

            {import.meta.env.NODE_ENV === 'development' && (
              <details style={{ width: '100%', marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  <Text size="sm" c="dimmed">
                    Developer Info (click to expand)
                  </Text>
                </summary>
                <Card withBorder padding="sm">
                  <Text size="xs" c="red" ff="monospace">
                    {isRouteErrorResponse(error)
                      ? `${error.status} ${error.statusText}`
                      : error instanceof Error
                        ? error.toString()
                        : String(error)}
                  </Text>
                  {error instanceof Error && error.stack && (
                    <Text size="xs" c="dimmed" ff="monospace" style={{ marginTop: '0.5rem' }}>
                      {error.stack}
                    </Text>
                  )}
                  {isRouteErrorResponse(error) && error.data && (
                    <Text size="xs" c="dimmed" ff="monospace" style={{ marginTop: '0.5rem' }}>
                      Data: {JSON.stringify(error.data, null, 2)}
                    </Text>
                  )}
                </Card>
              </details>
            )}
          </Stack>
        </Card>
      </Center>
    </Container>
  );
}
