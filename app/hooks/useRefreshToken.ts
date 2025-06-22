import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER!;

export function useRefreshToken() {
  const router = useRouter();

  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const userString = localStorage.getItem("user");

      if (!refreshToken || !userString) return;

      let user;
      try {
        user = JSON.parse(userString);
      } catch {
        console.error("Corrupted user object");
        return;
      }

      if (!user.email || !user.role) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) throw new Error("Failed to refresh");

        const tokens = await res.json();
        if (typeof tokens.accessToken === "string") {
          localStorage.setItem("accessToken", tokens.accessToken);
        } else {
          throw new Error("Invalid access token format");
        }
      } catch (err) {
        console.error("TOKEN REFRESH FAILED:", err);

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
    };

    
    const interval = setInterval(refreshTokenIfNeeded, 55 * 60 * 1000);

    window.addEventListener("focus", refreshTokenIfNeeded);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshTokenIfNeeded);
    };
  }, [router]);
}
