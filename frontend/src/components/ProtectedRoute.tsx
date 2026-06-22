"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireOrganizer = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOrganizer?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (requireAdmin && user.role !== "ROLE_ADMIN") {
        router.push("/");
      } else if (requireOrganizer) {
        if (user.role === "ROLE_ADMIN") {
          // Admins are always allowed
        } else if (user.role === "ROLE_ORGANIZER") {
          if (!user.approved) {
            router.push("/profile"); // Redirect unapproved organizers to profile where they see pending state
          }
        } else {
          router.push("/");
        }
      }
    }
  }, [user, isLoading, requireAdmin, requireOrganizer, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;
  }

  if (!user) return null;
  if (requireAdmin && user.role !== "ROLE_ADMIN") return null;
  if (requireOrganizer) {
    if (user.role !== "ROLE_ADMIN" && user.role !== "ROLE_ORGANIZER") return null;
    if (user.role === "ROLE_ORGANIZER" && !user.approved) return null;
  }

  return <>{children}</>;
}
