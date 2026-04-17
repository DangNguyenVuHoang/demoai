"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import { LoginPayload } from "@/features/auth/types/auth.types";

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });
};