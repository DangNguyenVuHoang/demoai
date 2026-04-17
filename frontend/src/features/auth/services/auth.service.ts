import { api } from "@/lib/axios";
import { LoginPayload, LoginResponse } from "@/features/auth/types/auth.types";

export const authService = {
  async login(payload: LoginPayload): Promise<string> {
    const response = await api.post<LoginResponse>("/auth/login", payload);

    const token =
      response.data?.access_token || response.data?.accessToken;

    if (!token) {
      throw new Error("Login succeeded but access token was not returned.");
    }

    return token;
  },
};