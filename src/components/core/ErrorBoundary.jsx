import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({
            errorInfo: errorInfo,
            errorId: Date.now()
        });
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: Date.now()
        });
        if (this.props.onRetry) {
            this.props.onRetry();
        } else {
            window.location.reload();
        }
    };
    
    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;
            if (fallback && typeof fallback === 'function') {
                return fallback({ error: this.state.error, errorInfo: this.state.errorInfo, retry: this.handleRetry });
            }
            if (React.isValidElement(fallback)) {
                return fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-red-50" role="alert">
                    <AlertOctagon size={48} className="text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-red-700 mb-2">Oops! Something went wrong.</h1>
                    <p className="text-gray-700 mb-4 max-w-md">
                        We encountered an unexpected issue. Please try again. If the problem persists, contact support.
                    </p>
                    
                    <details className="mb-4 p-3 bg-red-100 text-left text-xs text-red-800 rounded-md w-full max-w-2xl overflow-auto">
                        <summary className="font-semibold cursor-pointer">Error Details</summary>
                        <pre className="mt-2 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                            {this.state.errorInfo?.componentStack && (
                                `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`
                            )}
                        </pre>
                    </details>

                    <button
                        onClick={this.handleRetry}
                        className="flex items-center justify-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Try Again
                    </button>
                    {this.props.showSupportInfo && (
                         <p className="text-xs text-gray-500 mt-6">
                            Error ID: {this.state.errorId || 'N/A'}. Please include this ID if you contact support.
                        </p>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;