import axios from "axios";

interface FastApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Extracts a human-readable message from any error thrown by the axios
 * client. Understands FastAPI's two error shapes:
 *  - HTTPException -> { detail: string }
 *  - RequestValidationError -> { detail: FastApiValidationError[] }
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return "Cannot reach the server. Please check your connection and try again.";
    }

    const detail: unknown = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const messages = (detail as FastApiValidationError[])
        .map((item) => item.msg)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
