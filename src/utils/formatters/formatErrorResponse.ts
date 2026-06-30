// utils/formatters/formatErrorResponse.ts
import type { NormalizedError } from '../../api/interceptors';

type FormattedError = {
  message: string;
  errors: Record<string, string>;
};

export function formatErrorResponse(error: any): FormattedError {
  let message = 'An unexpected error occurred.';
  const formErrors: Record<string, string> = {};
  const isNormalizedError =
    error &&
    typeof error === 'object' &&
    typeof error.code === 'string' &&
    'message' in error;
  if (isNormalizedError) {
    const norm = error as NormalizedError;
    if (norm.code === 'VALIDATION' && norm.details && typeof norm.details === 'object') {
      for (const [field, messages] of Object.entries(norm.details as Record<string, string[]>) ) {
        if (Array.isArray(messages) && messages.length > 0) {
          formErrors[field] = messages[0];
        }
      }
      message = 'Please fix the errors below.';
    } else {
      // Other normalized errors: just use the top-level message
      message = norm.message || message;
    }
    return {
      message,
      errors: formErrors,
    };
  }
  const errors =
    error?.response?.data?.errors ??
    error?.response?.errors ??
    error?.errors;
  if (errors && typeof errors === 'object') {
    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        formErrors[field] = messages[0];
      }
    }
    message = '';
  } else {
    message =
      error?.response?.data?.message ??
      error?.response?.message ??
      error?.message ??
      error?.response?.data?.error ??
      error?.response?.data?.error?.message ??
      'An unexpected error occurred.';
  }
  return {
    message,
    errors: formErrors,
  };
}
