import { ZodError } from "zod";

export const IS_PROD = process.env.NODE_ENV === "production";

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field !== undefined && !result[String(field)]) {
      result[String(field)] = issue.message;
    }
  }
  return result;
}
