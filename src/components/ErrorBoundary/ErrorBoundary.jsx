import React from "react";

const defaultFallback = ({ reset }) => (
  <div className="rounded-[var(--radius-card)] border border-rose-200 bg-rose-50 p-6 text-center shadow-[var(--shadow-soft)]">
    <h2 className="text-xl font-semibold text-rose-900">Something went wrong</h2>
    <p className="mt-2 text-sm leading-6 text-rose-800">
      This section hit an unexpected error. You can try rendering it again.
    </p>
    <button
      type="button"
      onClick={reset}
      className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
    >
      Try Again
    </button>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { fallback, children } = this.props;
    const { hasError, error } = this.state;

    if (!hasError) {
      return children;
    }

    if (typeof fallback === "function") {
      return fallback({
        error,
        reset: this.reset,
      });
    }

    if (fallback) {
      return fallback;
    }

    return defaultFallback({
      error,
      reset: this.reset,
    });
  }
}

export default ErrorBoundary;
