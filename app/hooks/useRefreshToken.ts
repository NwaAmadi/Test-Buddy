import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER!;

export function useRefreshToken() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!refreshToken || !user.email || !user.role) return;

      try {
        const res = await fetch(`${BACKEND_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error("Failed to refresh");

        const tokens = await res.json();
        if (tokens.accessToken) {
          localStorage.setItem("accessToken", tokens.accessToken);
        }
      } catch (err) {
        console.error("TOKEN REFRESH FAILED:", err);
        localStorage.clear();

        try {
          const res = await fetch(`${BACKEND_URL}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              role: user.role,
            }),
          });

          if (!res.ok) {
            console.error("Logout failed");
          }
        } catch (logoutErr) {
          console.error("Logout error", logoutErr);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.push("/login");
        }
      }
    }, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);
}
