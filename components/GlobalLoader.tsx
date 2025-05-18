"use client";
import { LoaderOverlay } from "@/components/LoaderOverlay";
import { useAuth } from "@/components/auth-provider";

export function GlobalLoader() {
  const auth = useAuth();
  return <LoaderOverlay show={auth?.isLoading ?? false} />;
} 