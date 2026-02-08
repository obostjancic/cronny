import React from "react";
import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  const handleReset = () => {
    resetErrorBoundary();
  };

  const handleGoHome = () => {
    navigate({ to: "/" });
    resetErrorBoundary();
  };

  let title = "Something went wrong";
  let message = error.message;

  // Handle specific error types
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) {
      title = "Not authenticated";
      message = "Please log in to continue";
    } else if (status === 403) {
      title = "Not authorized";
      message = "You don't have permission to access this resource";
    } else if (status === 404) {
      title = "Not found";
      message = "The requested resource was not found";
    }
  }

  return (
    <Stack p="xl" gap="md">
      <Alert
        variant="light"
        color="red"
        title={title}
        icon={<IconAlertCircle />}
      >
        <Text size="sm" mb="md">
          {message}
        </Text>
        <Group>
          <Button variant="light" onClick={handleReset}>
            Try again
          </Button>
          <Button variant="subtle" onClick={handleGoHome}>
            Go home
          </Button>
        </Group>
      </Alert>
    </Stack>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  resetErrorBoundary = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }
    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    const { reset } = useQueryErrorResetBoundary();

    return (
      <ErrorBoundaryClass onReset={reset}>
        <Component {...props} />
      </ErrorBoundaryClass>
    );
  };
}
