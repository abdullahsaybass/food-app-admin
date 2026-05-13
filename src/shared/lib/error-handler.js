// lib/api/error-handler.js

export const normalizeError = (error) => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    return {
      message:    data?.message ?? "Something went wrong.",
      errors:     data?.errors  ?? [],
      statusCode: error.response?.status,
    };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: "An unexpected error occurred." };
};
 
export const isGlobalError = (error) => {
  const code = error.statusCode;
  if (!code)       return true;
  if (code >= 500) return true;
  if (code === 401 || code === 403) return true;
  return false;
};
 
const isAxiosError = (error) =>
  typeof error === "object" && error !== null &&
  "response" in error && "message" in error;