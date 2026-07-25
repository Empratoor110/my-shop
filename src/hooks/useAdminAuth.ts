"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const TIMEOUT_MINUTES = 15;
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;

export function useAdminAuth() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function logout() {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminLastActivity");
    router.push("/admin/login");
  }

  function resetTimer() {
    localStorage.setItem("adminLastActivity", Date.now().toString());
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
    }, TIMEOUT_MS);
  }

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      router.push("/admin/login");
      return;
    }

    // بررسی اینکه آیا قبلاً منقضی شده
    const lastActivity = localStorage.getItem("adminLastActivity");
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