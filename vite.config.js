import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Use an environment variable for backend target so the dev server
// doesn't force requests to a single hardcoded IP (which can cause ETIMEDOUT).
// Set VITE_BACKEND_URL in an .env.local file, e.g.:
// VITE_BACKEND_URL=https://localhost:44363/SparkPoint/api
// Export a function so we can read Vite env files for the current mode (e.g. .env.local)
export default defineConfig(({ mode }) => {
  // loads .env, .env.local, .env.[mode], etc into an object
  const env = loadEnv(mode, process.cwd(), "");

  const backendTarget = env.VITE_BACKEND_URL || "http://localhost:44363/api";

  // Parse host for explicit Host header (helps when backend enforces hostname validation)
  let backendHost = "localhost";
  let backendConnectTarget = backendTarget; // the actual URL used for opening network connection
  try {
    const url = new URL(backendTarget);
    backendHost = url.host;

    // If the backend hostname is localhost, prefer connecting via 127.0.0.1 to avoid
    // potential hostname resolution/binding issues on Windows. We'll still send the
    // original hostname in the Host header so the backend's host filtering accepts it.
    if (url.hostname === "localhost") {
      const portPart = url.port ? `:${url.port}` : "";
      backendConnectTarget = `${url.protocol}//127.0.0.1${portPart}${url.pathname}`;
    }
  } catch (e) {
    // fallback: leave backendHost as localhost and backendConnectTarget as backendTarget
  }

  const isBackendHttps = backendConnectTarget.startsWith("https:");

  // Diagnostic logs to help debug env loading issues. These appear when Vite starts.
  // Remove or comment out when debugging is finished.
  // eslint-disable-next-line no-console
  console.log("[vite proxy] VITE_BACKEND_URL=", env.VITE_BACKEND_URL);
  // eslint-disable-next-line no-console
  console.log("[vite proxy] backendTarget=", backendTarget);
  // eslint-disable-next-line no-console
  console.log("[vite proxy] backendConnectTarget=", backendConnectTarget);
  // eslint-disable-next-line no-console
  console.log("[vite proxy] backendHost=", backendHost);

// https://vite.dev/config/
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          // connect to backendConnectTarget (may use 127.0.0.1) while sending Host header=backendHost
          target: backendConnectTarget,
          changeOrigin: true,
          // Ensure the Host header matches the backend's expected hostname
          headers: { host: backendHost },
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
          cookieDomainRewrite: "localhost",
          configure: (proxy) => {
            // Ensure the outgoing proxied request carries the backend's expected Host header
            // Some proxy setups ignore the `headers` option for Host, so set it on proxyReq.
            proxy.on("proxyReq", (proxyReq, req, res) => {
              try {
                proxyReq.setHeader("host", backendHost);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Failed to set proxyReq Host header:", e);
              }
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              // Rewrite Set-Cookie headers to use localhost domain and adapt SameSite/Secure
              // behavior for local HTTP dev vs HTTPS backends.
              const setCookie = proxyRes.headers["set-cookie"];
              if (setCookie) {
                proxyRes.headers["set-cookie"] = setCookie.map((cookie) => {
                  // Ensure Domain is localhost so the browser stores the cookie for our app
                  let out = cookie.replace(/Domain=([^;]+)/i, "Domain=localhost");

                  if (isBackendHttps) {
                    // For HTTPS backends, it's OK to force SameSite=None; Secure so cross-site
                    // cookies (if any) work during development.
                    out = out.replace(/SameSite=[^;]+/i, "SameSite=None; Secure");
                  } else {
                    // For HTTP backends (local dev), remove any Secure flag (browsers will
                    // ignore cookies with Secure on plain HTTP) and leave SameSite alone
                    // or set to Lax for reasonable behavior.
                    out = out.replace(/;?\s*SameSite=[^;]+/i, "");
                    out = out.replace(/;\s*Secure/i, "");
                    // Optionally set SameSite=Lax for local cookies (uncomment if needed):
                    // out = out + "; SameSite=Lax";
                  }

                  return out;
                });
              }
            });
          },
        },
      },
    },
  };
});
