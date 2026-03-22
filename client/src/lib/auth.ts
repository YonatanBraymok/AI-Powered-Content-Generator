// Auth state is managed via httpOnly cookies set by the server.
// Use useCurrentUser() to determine if the user is authenticated.

export function isAuthenticated(): boolean {
  // Cookies are httpOnly and not readable from JS.
  // Always return true so useCurrentUser always runs; the query result
  // determines actual auth state.
  return true;
}
