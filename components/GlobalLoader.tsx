"use client";
import { LoaderOverlay } from "@/components/LoaderOverlay";
import { useAuth } from "@/components/auth-provider";

export function GlobalLoader() {
  const { isLoading } = useAuth();
  return <LoaderOverlay show={isLoading} />;
} 