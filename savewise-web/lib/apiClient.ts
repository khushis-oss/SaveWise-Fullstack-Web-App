import { notifications } from "@mantine/notifications";
import { signOut } from "next-auth/react";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function buildHmacHeaders(): Promise<Record<string, string>> {
  const secret = process.env.NEXT_PUBLIC_HMAC_SECRET_KEY;
  if (!secret) return {};

  const uniqueid = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const message = `${uniqueid}\n${timestamp}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const raw = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const signature = btoa(String.fromCharCode(...new Uint8Array(raw)));

  return { uniqueid, timestamp, "x-signature": signature };
}

/**
 * Drop-in replacement for fetch that:
 * - Injects Content-Type and Authorization headers automatically
 * - Attaches HMAC signing headers (uniqueid, timestamp, x-signature) on POST requests
 * - On 401: shows a "session expired" notification then redirects to /auth/login
 * - Throws "UNAUTHORIZED" so callers can bail out without double-showing errors
 */
export async function apiFetch(
  path: string,
  token: string | null | undefined,
  options: RequestInit = {},
): Promise<Response> {
  const extraHeaders = options.headers
    ? (options.headers as Record<string, string>)
    : {};

  const isPost = options.method?.toUpperCase() === "POST";
  const hmacHeaders = isPost ? await buildHmacHeaders() : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...hmacHeaders,
    ...extraHeaders,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    notifications.show({
      title: "Session expired",
      message: "Your session has expired. Please log in again.",
      color: "red",
      autoClose: 3000,
    });
    setTimeout(async () => {
      await signOut({ redirect: false });
      window.location.href = "/auth/login";
    }, 1500);
    throw new Error("UNAUTHORIZED");
  }

  if (res.status === 403) {
    const body = await res.clone().json().catch(() => ({}));
    notifications.show({
      title: "Access denied",
      message: body.message || "You do not have access to perform this action your role is not user.",
      color: "red",
      autoClose: 4000,
    });
    throw new Error("FORBIDDEN");
  }

  return res;
}

/** Show a generic red error notification. */
export function notifyError(message: string, title = "Something went wrong") {
  notifications.show({ title, message, color: "red", autoClose: 4000 });
}
