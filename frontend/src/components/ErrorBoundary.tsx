import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBug,
  IconHome,
  IconRefresh,
  IconWifi,
} from '@tabler/icons-react';
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

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        error: error.toString(),
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(error);
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  getErrorType = (error: Error | null): 'network' | 'notFound' | 'permission' | 'generic' => {
    if (!error) {
      return 'generic';
    }

    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Network-related errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      stack.includes('networkerror')
    ) {
      return 'network';
    }

    // 404/Not Found errors
    if (message.includes('not found') || message.includes('404') || stack.includes('404')) {
      return 'notFound';
    }

    // Permission/Authorization errors
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('403') ||
      message.includes('401')
    ) {
      return 'permission';
    }

    return 'generic';
  };

  getErrorContent = () => {
    const errorType = this.getErrorType(this.state.error);

    switch (errorType) {
      case 'network':
        return {
          icon: IconWifi,
          color: 'orange',
          title: 'Connection Problem',
          message:
            'Unable to connect to our servers. Please check your internet connection and try again.',
          showRefresh: true,
        };

      case 'notFound':
        return {
          icon: IconAlertTriangle,
          color: 'yellow',
          title: 'Page Not Found',
          message: "The page you're looking for doesn't exist or has been moved.",
          showRefresh: false,
        };

      case 'permission':
        return {
          icon: IconAlertTriangle,
          color: 'red',
          title: 'Access Denied',
          message: "You don't have permission to access this resource.",
          showRefresh: false,
        };

      default:
        return {
          icon: IconBug,
          color: 'red',
          title: 'Something Went Wrong',
          message:
            'An unexpected error occurred. Our team has been notified and is working on a fix.',
          showRefresh: true,
        };
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Allow custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorContent = this.getErrorContent();
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
                      onClick={this.handleRefresh}
                    >
                      Refresh Page
                    </Button>
                  )}

                  <Button
                    leftSection={<IconArrowLeft size={16} />}
                    variant="light"
                    color="gray"
                    onClick={this.handleGoBack}
                  >
                    Go Back
                  </Button>

                  <Button
                    leftSection={<IconHome size={16} />}
                    variant="outline"
                    color="teal"
                    onClick={this.handleGoHome}
                  >
                    Home
                  </Button>
                </Group>

                {import.meta.env.NODE_ENV === 'development' && this.state.error && (
                  <details style={{ width: '100%', marginTop: '1rem' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                      <Text size="sm" c="dimmed">
                        Developer Info (click to expand)
                      </Text>
                    </summary>
                    <Card withBorder padding="sm">
                      <Text size="xs" c="red" ff="monospace">
                        {this.state.error.toString()}
                      </Text>
                      {this.state.error.stack && (
                        <Text size="xs" c="dimmed" ff="monospace" style={{ marginTop: '0.5rem' }}>
                          {this.state.error.stack}
                        </Text>
                      )}
                    </Card>
                  </details>
                )}

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={this.handleRetry}
                  style={{ marginTop: '1rem' }}
                >
                  Try Again
                </Button>
              </Stack>
            </Card>
          </Center>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
