
import React from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import type { FallbackProps } from 'react-error-boundary';

import type { ReactNode } from 'react';

import axios from 'axios';

import "./styles/ErrorBoundary.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faExclamationTriangle, faWifi, faServer, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

 

interface ErrorBoundaryProps {

  children: ReactNode;

}

 

type ErrorType = 'API_ERROR' | 'NETWORK_ERROR' | 'UI_ERROR' | 'UNKNOWN_ERROR';

 

interface ParsedError {

  type: ErrorType;

  title: string;

  message: string;

  statusCode?: number;

  isRetryable: boolean;

  icon: typeof faExclamationTriangle;

}

 

const parseError = (error: unknown): ParsedError => {

  if (axios.isAxiosError(error)) {

    const statusCode = error.response?.status;

   

    if (!error.response) {

      return {

        type: 'NETWORK_ERROR',

        title: 'Network Connection Failed',

        message: 'Unable to connect to the server. Please check your internet connection and try again.',

        isRetryable: true,

        icon: faWifi,

      };

    }

 

    switch (statusCode) {

      case 400:

        return {

          type: 'API_ERROR',

          title: 'Invalid Request',

          message: 'The request contains invalid data. Please check your input and try again.',

          statusCode,

          isRetryable: false,

          icon: faExclamationCircle,

        };

 

      case 401:

        return {

          type: 'API_ERROR',

          title: 'Session Expired',

          message: 'Your session has expired. Please log in again.',

          statusCode,

          isRetryable: false,

          icon: faExclamationCircle,

        };

 

      case 403:

        return {

          type: 'API_ERROR',

          title: 'Access Denied',

          message: 'You do not have permission to access this resource.',

          statusCode,

          isRetryable: false,

          icon: faExclamationCircle,

        };

 

      case 404:

        return {

          type: 'API_ERROR',

          title: 'Resource Not Found',

          message: 'The requested resource was not found.',

          statusCode,

          isRetryable: false,

          icon: faExclamationCircle,

        };

 

      case 408:

        return {

          type: 'API_ERROR',

          title: 'Request Timeout',

          message: 'The request took too long to complete. Please try again.',

          statusCode,

          isRetryable: true,

          icon: faServer,

        };

 

      case 429:

        return {

          type: 'API_ERROR',

          title: 'Too Many Requests',

          message: 'Too many requests. Please wait a moment and try again.',

          statusCode,

          isRetryable: true,

          icon: faServer,

        };

 

      case 500:

      case 502:

      case 503:

      case 504:

        return {

          type: 'API_ERROR',

          title: 'Server Error',

          message: 'The service is temporarily unavailable. Please try again in a few moments.',

          statusCode,

          isRetryable: true,

          icon: faServer,

        };

 

      default:

        return {

          type: 'API_ERROR',

          title: 'API Error',

          message: 'An unexpected error occurred. Please try again.',

          statusCode,

          isRetryable: true,

          icon: faServer,

        };

    }

  }

 

  if (error instanceof Error) {

    return {

      type: 'UI_ERROR',

      title: 'Application Error',

      message: 'An unexpected error occurred in the application. Please refresh the page and try again.',

      isRetryable: true,

      icon: faExclamationTriangle,

    };

  }

 

  return {

    type: 'UNKNOWN_ERROR',

    title: 'Unknown Error',

    message: 'An unexpected error occurred. Please refresh the page and try again.',

    isRetryable: true,

    icon: faExclamationTriangle,

  };

};

 

const logErrorToService = (error: unknown, errorInfo: React.ErrorInfo): void => {

  const err = error instanceof Error ? error : new Error(String(error));

  const parsedError = parseError(error);

 

  const errorDetails = {

    type: parsedError.type,

    title: parsedError.title,

    message: err.message,

    stack: err.stack,

    componentStack: errorInfo.componentStack,

    statusCode: parsedError.statusCode,

    timestamp: new Date().toISOString(),

    userAgent: navigator.userAgent,

    url: window.location.href

  };

 

  if (process.env.NODE_ENV === 'development') {

    console.error(`[${parsedError.type}] ErrorBoundary caught an error:`, err, errorInfo);

    console.error('Error Details:', errorDetails);

  }

 

  // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)

  // fetch('/api/log-error', {

  //   method: 'POST',

  //   headers: { 'Content-Type': 'application/json' },

  //   body: JSON.stringify(errorDetails)

  // }).catch(err => console.error('Failed to log error:', err));

};

 

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {

  const handleReload = (): void => {

    window.location.reload();

  };

 

  const handleGoHome = (): void => {

    window.location.href = '/';

  };

 

  const err = error instanceof Error ? error : new Error(String(error));

  const parsedError = parseError(error);

 

  return (

    <div className="error-boundary-container">

      <div className="error-boundary-content">

        <div className="error-icon">

          <FontAwesomeIcon icon={parsedError.icon} />

        </div>

        <h1 className="error-title">{parsedError.title}</h1>

        <p className="error-message">

          {parsedError.message}

        </p>

       

        {parsedError.statusCode && (

          <div className="error-warning">

            <p>Error Code: {parsedError.statusCode}</p>

          </div>

        )}

 

        {process.env.NODE_ENV === 'development' && err && (

          <details className="error-details">

            <summary className="error-details-summary">Error Details (Development Only)</summary>

            <div className="error-details-content">

              <div className="error-section">

                <strong>Error Message:</strong>

                <pre>{err.toString()}</pre>

              </div>

              {err.stack && (

                <div className="error-section">

                  <strong>Stack Trace:</strong>

                  <pre>{err.stack}</pre>

                </div>

              )}

            </div>

          </details>

        )}

 

        <div className="error-actions">

          {parsedError.isRetryable && (

            <button onClick={resetErrorBoundary} className="error-button error-button-primary">

              Try Again

            </button>

          )}

          <button onClick={handleReload} className="error-button error-button-secondary">

            Reload Page

          </button>

          <button onClick={handleGoHome} className="error-button error-button-secondary">

            Go to Home

          </button>

        </div>

      </div>

    </div>

  );

};

 

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {

  return (

    <ReactErrorBoundary

      FallbackComponent={ErrorFallback}

      onError={logErrorToService}

      onReset={() => {

        console.log('ErrorBoundary reset');

      }}

    >

      {children}

    </ReactErrorBoundary>

  );

};

 

export default ErrorBoundary;

 

 

 

 
