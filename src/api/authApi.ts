import apiClient from "./config";

/**
 * Exchange a Keycloak authorization code for session cookies.
 * The backend sets HTTP-only access_token and refresh_token cookies on success.
 *
 * @param code - The authorization code returned by Keycloak in the redirect URL.
 * @param redirectUri - The exact redirect URI used during the authorization request.
 */
export const loginWithCode = async (
  code: string,
  redirectUri: string,
): Promise<void> => {
  await apiClient.post("/auth/login", { code, redirectUri });
};
