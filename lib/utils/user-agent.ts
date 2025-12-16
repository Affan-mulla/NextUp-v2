/**
 * Parse user agent string for better device/browser display
 * Extracts browser and OS info for session display
 */
export function parseUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return "Unknown device";

  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = "Unknown browser";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("opera") || ua.includes("opr/")) browser = "Opera";

  // OS detection
  let os = "";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os x")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  return os ? `${browser} on ${os}` : browser;
}

/**
 * Get approximate location from IP address (for display only)
 * In production, use a proper GeoIP service
 */
export function formatIpLocation(ipAddress: string | null | undefined): string {
  if (!ipAddress) return "";
  
  // For localhost/development
  if (ipAddress === "::1" || ipAddress === "127.0.0.1" || ipAddress.startsWith("::ffff:127.")) {
    return "Localhost";
  }

  // Return just the IP for now - in production integrate with a GeoIP service
  return ipAddress;
}
