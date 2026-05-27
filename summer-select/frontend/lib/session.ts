/** HttpOnly cookie that identifies the registered device for an account. */
export const DEVICE_SESSION_COOKIE = "ss_sid";

/** ~400 days — practical upper limit for browser cookie persistence. */
export const DEVICE_SESSION_MAX_AGE = 60 * 60 * 24 * 400;

export function deviceSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEVICE_SESSION_MAX_AGE,
  };
}
