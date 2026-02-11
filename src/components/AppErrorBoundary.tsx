import React from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled React render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-[#020617] text-slate-300 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Please refresh the page and try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
