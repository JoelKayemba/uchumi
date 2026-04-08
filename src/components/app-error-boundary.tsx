import React, { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallbackScreen } from '@/src/components/error-fallback-screen';
import { reportException } from '@/src/services/observability';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportException(error, { componentStack: info.componentStack ?? '' });
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorFallbackScreen error={this.state.error} onReset={this.reset} />
      );
    }
    return this.props.children;
  }
}
