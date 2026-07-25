// مسیر فایل: src/hooks/useContentAdminAuth.ts
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const TIMEOUT_MINUTES = 15;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

export function useContentAdminAuth() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function logout() {
    localStorage.removeItem("contentAdminId");
    localStorage.removeItem("contentAdminLastActivity");
    router.push("/content-admin/login");
  }

  function resetTimer() {
    localStorage.setItem("contentAdminLastActivity", Date.now().toString());
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);
  }

  useEffect(() => {
    const contentAdminId = localStorage.getItem("contentAdminId");
    if (!contentAdminId) {
      router.push("/content-admin/login");
      return;
    }

    const lastActivity = localStorage.getItem("contentAdminLastActivity");
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity);
      if (elapsed > TIMEOUT_MS) {
        logout();
        return;
      }
    }

    resetTimer();

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { logout };
}
