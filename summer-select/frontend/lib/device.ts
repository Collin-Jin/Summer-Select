/**
 * Turns a browser user-agent string into a short label such as "Chrome on
 * macOS", for the admin's blocked sign-in list. Deliberately rough: it only
 * needs to tell a person's devices apart.
 */
export function describeDevice(userAgent: string | null | undefined): string {
  const ua = userAgent ?? "";
  if (!ua) return "Unknown device";

  let os = "";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Order matters: Edge and Opera also say "Chrome", and Chrome also says "Safari".
  let browser = "";
  if (/Edg(e|A|iOS)?\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Firefox\/|FxiOS\//i.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  if (browser && os) return `${browser} on ${os}`;
  return browser || os || "Unknown device";
}

/** "San Francisco, US", "US", or null. */
export function describeLocation(city: string | null | undefined, country: string | null | undefined): string | null {
  const parts = [city, country].map((p) => (p ?? "").trim()).filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
