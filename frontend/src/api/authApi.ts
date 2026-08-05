import axiosClient from "./axiosClient";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "../types/auth";

/**
 * POST /auth/login
 * Backend uses OAuth2PasswordRequestForm -> must be sent as
 * application/x-www-form-urlencoded, NOT JSON.
 */
export function loginRequest(payload: LoginPayload) {
  const body = new URLSearchParams();
  body.set("username", payload.username);
  body.set("password", payload.password);

  return axiosClient.post<TokenResponse>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

/** POST /auth/register — plain JSON body matching UserRegister schema. */
export function registerRequest(payload: RegisterPayload) {
  return axiosClient.post<User>("/auth/register", payload);
}

/** GET /auth/me — requires Bearer token, returns the current user. */
export function getMeRequest() {
  return axiosClient.get<User>("/auth/me");
}
